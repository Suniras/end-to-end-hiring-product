/* ============================================================================
   nlu.js  ·  on-device intent classifier

   WHAT THIS IS, stated plainly so nobody oversells it in a demo.

   Not a language model. It is a keyword, synonym and fuzzy-match intent
   classifier running entirely in the browser with no network calls. Its job is
   narrow: take what a person typed, work out which of a fixed set of intents
   they meant, pull out the entities involved, and tolerate paraphrase, word
   order, plurals and typos.

   That is genuinely useful and genuinely limited. It handles "can you hire
   alicia", "lets go ahead with alicia reyes" and "aprove alica" as one intent.
   It cannot answer a question nobody wrote an intent for, and when it is unsure
   it says so and offers its top guesses rather than picking one and being
   confidently wrong.

   HOW IT SCORES, in order:
     1. Normalise    lowercase, expand contractions, words to digits, strip punctuation
     2. Tokenise     drop stopwords but KEEP negations, because "do not approve"
                     and "approve" must never collapse together
     3. Canonicalise a synonym table folds surface forms onto concepts, so HIRE
                     covers hire, approve, greenlight, advance, accept, proceed
     4. Stem         light suffix stripping, no external stemmer
     5. Score        concept overlap weighted by inverse document frequency, so a
                     concept in one intent counts far more than one in ten
     6. Phrase bonus multi-word patterns that are strong signals alone
     7. Fuzzy pass   tokens that matched nothing get normalised
                     Damerau-Levenshtein against the vocabulary. Catches typos
     8. Gate         some intents require a concept to be present at all, so
                     "remove her shift" cannot score as "show me shifts"
     9. Confidence   normalised top score plus margin over the runner up. Low
                     confidence or a thin margin means ask, not guess
   ============================================================================ */

window.NLU = (function () {
  'use strict';

  /* ------------------------------------------------------------ normalise --- */

  var CONTRACTIONS = {
    "cant":"can not","can't":"can not","wont":"will not","won't":"will not",
    "dont":"do not","don't":"do not","doesnt":"does not","doesn't":"does not",
    "didnt":"did not","didn't":"did not","isnt":"is not","isn't":"is not",
    "arent":"are not","aren't":"are not","wasnt":"was not","wasn't":"was not",
    "shouldnt":"should not","shouldn't":"should not","couldnt":"could not",
    "couldn't":"could not","whats":"what is","what's":"what is",
    "whos":"who is","who's":"who is","wheres":"where is","where's":"where is",
    "hows":"how is","how's":"how is","thats":"that is","that's":"that is",
    "lets":"let us","let's":"let us","im":"i am","i'm":"i am",
    "ive":"i have","i've":"i have","theres":"there is","there's":"there is",
    "hasnt":"has not","hasn't":"has not","havent":"have not","haven't":"have not",
    "pls":"please","plz":"please","thx":"thanks","u":"you","ur":"your","abt":"about"
  };

  // Deliberately explicit. Lowering the fuzzy threshold to catch these would
  // also make "fire alicia" match "hire alicia", which is one edit away and
  // exactly the mistake that must never happen.
  var MISSPELL = {
    hlep:'help', ehlp:'help', hepl:'help', waht:'what', taht:'that', cna:'can', ehre:'here',
    hier:'hire', hrie:'hire', hier:'hire', aprove:'approve', aprv:'approve', apprv:'approve',
    opne:'open', oepn:'open', backround:'background', bakground:'background',
    montn:'month', mnoth:'month', yesterdya:'yesterday', doign:'doing', sittign:'sitting',
    tth:'time to hire', dnh:'do not hire', bgc:'background check', reqs:'requisitions',
    stauts:'status', staus:'status', pipline:'pipeline', complaince:'compliance',
    nto:'not', dnot:'not', emial:'email', eamil:'email', dwon:'down', kettel:'kettle',
    offr:'offer', teh:'the', tomorow:'tomorrow', sahsa:'sasha', comfirm:'confirm',
    everify:'everify', evrify:'everify', rota:'rota', chekcs:'checks', cheks:'checks'
  };

  var NUMBERS = { zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,
    nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,
    sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20 };

  var STOP = { a:1,an:1,the:1,is:1,are:1,was:1,were:1,be:1,been:1,being:1,
    of:1,to:1,in:1,on:1,at:1,for:1,with:1,and:1,or:1,but:1,
    i:1,you:1,we:1,it:1,this:1,that:1,these:1,those:1,
    does:1,did:1,doing:1,have:1,has:1,had:1,will:1,would:1,
    could:1,should:1,shall:1,may:1,might:1,must:1,
    please:1,thanks:1,hey:1,hi:1,hello:1,ok:1,okay:1,just:1,some:1,
    am:1,my:1,me:1,us:1,our:1,your:1,any:1,so:1,if:1,then:1,
    from:1,by:1,as:1,up:1,about:1,into:1,again:1,
    let:1,going:1,want:1,like:1,got:1,
    thing:1,things:1,stuff:1,now:1,here:1,right:1,really:1,actually:1 };

  // Negations survive stopword removal. So do a few verbs other intents need.
  var NEGATIONS = { not:1,no:1,never:1,none:1,nobody:1,nothing:1,without:1,cannot:1 };

  function normalise(text) {
    var t = String(text || '').toLowerCase();
    t = t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    t = t.replace(/[^a-z0-9'#\-\s]/g, ' ');
    // Split hyphens. "i-9" matched nothing at all: EVERIFY lists i9, and the
    // fuzzy pass skips tokens under four characters. Same for no-show,
    // do-not-hire and day-one, which all have phrase entries.
    t = t.replace(/-+/g, ' ');
    // Drop possessive apostrophes. Trimming only the ends left "kayla's" intact,
    // so the person was never found and the guards that depend on a person
    // silently did nothing.
    t = t.replace(/'s\b/g, 's').replace(/'/g, '');
    t = t.replace(/\s+/g, ' ').trim();
    return t.split(' ').map(function (w) { return CONTRACTIONS[w] || w; }).join(' ');
  }

  function tokenise(norm) {
    var out = [];
    norm.split(' ').filter(Boolean).forEach(function (w) {
      w = w.replace(/^'+|'+$/g, '');
      if (!w) return;
      if (MISSPELL[w]) { MISSPELL[w].split(' ').forEach(function (x) { out.push(x); }); return; }
      out.push(NUMBERS[w] != null ? String(NUMBERS[w]) : w);
    });
    return out;
  }

  function stem(w) {
    if (w.length <= 3) return w;
    var suf = ['ingly','edly','ings','ing','ies','ied','es','ed','ly','s'];
    for (var i = 0; i < suf.length; i++) {
      var sf = suf[i];
      if (w.length > sf.length + 2 && w.slice(-sf.length) === sf) {
        var base = w.slice(0, -sf.length);
        if (sf === 'ies' || sf === 'ied') return base + 'y';
        if ((sf === 'ing' || sf === 'ed') && base.length > 2 &&
            base.slice(-1) === base.slice(-2, -1) && !/[aeiou]/.test(base.slice(-1))) {
          return base.slice(0, -1);
        }
        return base;
      }
    }
    return w;
  }

  /* ---------------------------------------------------------- concept map ---
     Paraphrase tolerance lives here. The classifier never sees "greenlight",
     it sees HIRE.
  ------------------------------------------------------------------------- */

  var CONCEPTS = {
    HIRE:      ['hire','hiring','approve','approval','approved','accept','greenlight','advance','proceed','onboard','yes','offer',
                'go ahead','goahead','move forward','bring on','on board','the job','sign off','say yes','push through','let through',
                'green light','greenlight','take on','bring aboard'],
    REJECT:    ['reject','decline','turn down','turndown','pass on','refuse','deny','knock back','ding',
                'no on','no to','get rid of','say no'],
    CANDIDATE: ['candidate','applicant','person','people','someone','somebody','starter','employee','staff','worker','associate','guy','her','him','them'],
    QUEUE:     ['queue','inbox','todo','waiting','pending','outstanding','backlog','today','morning','attention','action','actions',
                'need','needs','needed','require','requires','sitting','first','anything','next','chase','plate'],
    STAGE:     ['stage','step','phase'],
    PIPELINE:  ['pipeline','funnel','flow','journey','lifecycle'],
    FLAG:      ['flag','flagged','blocked','block','rehire','do not hire','donothire','ineligible','barred','stopped','halted'],
    EVERIFY:   ['everify','e verify','verify','verification','mismatch','tnc','nonconfirmation','i9','i 9'],
    COMPLIANCE:['compliance','legal','lawful','unlawful','law','deadline','deadlines','clock','clocks','statutory','audit',
                'days left','working days','how long left','time left','expires','case','cases','contest','contesting'],
    SHIFT:     ['shift','shifts','rota','roster','schedule','scheduling','hours','week','weeks','shiftpattern',
                'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
                'mon','tue','tues','wed','thu','thur','thurs','fri','sat','sun','floor','next week'],
    REMOVE:    ['remove','delete','cancel','take off','takeoff','drop','pull','unassign','strip',
                'off the rota','off the schedule','off next week','zero out','blank out','clear her hours','clear his hours'],
    CHECK:     ['background','check','checks','bgc','county','court','drug screen'],
    SLOW:      ['slow','late','delay','delayed','stuck','overdue','behind','long','longest','holding up','taking so long','held up','dragging'],
    DAYONE:    ['day one','dayone','day 1','first shift','firstshift','start','starting','starts','no show','noshow',
                'turn up','turnup','show up','showup','attend','arrive','risk','risks','risky','flake','ghost','ghosting','coming in'],
    CONFIRMED: ['confirmed','confirm','confirmation','tapped','replied','responded','acknowledged','read it','opened it','opened the link'],
    HOW:       ['how','mechanism','work','works','track','tracking','tracked','measure','detect','know','signal','tell'],
    REPORT:    ['report','reports','metric','metrics','number','numbers','stat','stats','analytics','dashboard',
                'time to hire','timetohire','drop off','dropoff','who acted','acted','breakdown',
                'who approved','who rejected','how many hires','how long are we taking'],
    SCREEN:    ['screen','screening','call','interview','transcript','conversation','phrase bank','phrasebank'],
    REVIEW:    ['review','held','holding','unscored','read','triage','phrase bank','phrasebank','no match','not match','did not match'],
    WHY:       ['why','reason','explain','explanation','cause','rationale','wrong'],
    SHOW:      ['show','open','display','view','see','look','navigate','pull up','bring up','jump','take me',
                'screen','page','tab','go to','find'],
    STATUS:    ['status','where','update','progress','state','standing','happening','far along','clear yet','sorted','resolved'],
    STORE:     ['store','branch','site','location','shop'],
    RESET:     ['reset','restart','start over','startover','clean slate','back how it was','back to the start',
                'from scratch','wipe','back to the beginning','put it back'],
    THEME:     ['theme','mode','appearance','dark','light','dark mode','light mode','dark theme','light theme',
                'darker','lighter','brighter','bright','glare','go dark','night mode'],
    HELP:      ['help','capable','capability','able','commands','options','what can you do','what do you do','how do i use'],
    SCORE:     ['score','scored','rating','rated','band','above','over','below','under'],
    ALL:       ['all','every','everyone','everybody','bulk','batch','each','the lot','anyone','anybody','whole'],
    COUNT:     ['many','count','total','how many']
  };

  /* -------------------------------------------------------- out of scope ---
     Kept OUT of CONCEPTS on purpose. As a concept it was worse: "hourly" stems
     to "hour", so "sorry to bother you at this hour" blocked a valid approval.
     Also deliberately excludes "call", "req" and "number", which are real
     product words: screening call, cashier req, the numbers.
  ------------------------------------------------------------------------- */
  var OUT_OF_SCOPE = ['email','emails','emailing','emailed','mail','text','texting','txt','sms',
    'send','sending','sent','fire','fired','firing','terminate','termination','sack','dismiss',
    'pay','wage','wages','salary','comp','hourly','raise','bump','promote','promotion',
    'export','csv','excel','spreadsheet','download','print','printed','calendar','diary',
    'reschedule','rerun','unapprove','unblock','override','undo','shrink','tenure','wotc','ats'];
  var OUT_OF_SCOPE_PHRASES = ['let go of','part ways','re run','phone number','minimum wage',
    'admin access','open reqs','a new req','post a new','add a new'];
  // Deferrals are not instructions. "hold off on approving" must not approve.
  var DEFERRALS = ['hold off','on hold','not yet','changed my mind','leave it for now'];
  /* An exclusion cannot be represented by a bag of concepts, so acting on one
     would silently ignore it. "approve everyone above 75 except ryan" must not
     approve Ryan. Refusing and asking is the only safe answer. */
  var EXCLUSIONS = ['except','excluding','apart from','other than','but not','besides','minus'];
  /* Undo is not one of the eighteen actions, and reading it as the action
     itself is the worst possible misinterpretation. */
  var UNDO = ['cancel that','cancel the approval','undo that','revoke','reverse that','take that back'];

  // These are verbs when somebody is asking for an action and nouns when
  // somebody is asking how something works. "text dax" is out of scope.
  // "is it a text message coming back" is a mechanism question.
  var NOUN_AMBIGUOUS = { text:1, sms:1, mail:1, email:1, send:1, sent:1, print:1, calendar:1 };

  function outOfScope(tokens, norm, isQuestion) {
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (OUT_OF_SCOPE.indexOf(t) < 0) continue;
      if (isQuestion && NOUN_AMBIGUOUS[t]) continue;
      return t;
    }
    for (var j = 0; j < OUT_OF_SCOPE_PHRASES.length; j++) {
      if (norm.indexOf(OUT_OF_SCOPE_PHRASES[j]) >= 0) return OUT_OF_SCOPE_PHRASES[j];
    }
    for (var k = 0; k < DEFERRALS.length; k++) {
      if (norm.indexOf(DEFERRALS[k]) >= 0) return DEFERRALS[k];
    }
    for (var m = 0; m < EXCLUSIONS.length; m++) {
      if (norm.indexOf(EXCLUSIONS[m]) >= 0) return 'exclusion:' + EXCLUSIONS[m];
    }
    for (var u = 0; u < UNDO.length; u++) {
      if (norm.indexOf(UNDO[u]) >= 0) return 'undo:' + UNDO[u];
    }
    return null;
  }

  var TOK2CONCEPT = {}, PHRASES = [];
  Object.keys(CONCEPTS).forEach(function (c) {
    CONCEPTS[c].forEach(function (surface) {
      if (surface.indexOf(' ') >= 0) {
        // A multiword surface is matched ONLY as a phrase. Indexing its parts
        // as well is a real bug: "drop off" would teach the classifier that
        // "drop" means REPORT, and "drop kayla from the rota" then misfires.
        PHRASES.push({ phrase: surface, concept: c });
        return;
      }
      var k = stem(surface);
      (TOK2CONCEPT[k] = TOK2CONCEPT[k] || []);
      if (TOK2CONCEPT[k].indexOf(c) < 0) TOK2CONCEPT[k].push(c);
    });
  });
  PHRASES.sort(function (a, b) { return b.phrase.length - a.phrase.length; });

  /* --------------------------------------------------------------- intents --- */

  var INTENTS = [
    { id:'approve_candidate', concepts:['HIRE','CANDIDATE'], require:[['HIRE']], needsPerson:true,
      phrases:['hire','approve','go ahead with','move forward with','give the job'],
      examples:['hire alicia','approve alicia reyes','lets go ahead with alicia','give ines the job',
                'move marcus hale forward','yes to ines duarte','aprove alica','can you hire alicia reyes'] },

    { id:'reject_candidate', concepts:['REJECT','CANDIDATE'], require:[['REJECT']], needsPerson:true,
      phrases:['reject','turn down','pass on'],
      examples:['reject ryan','turn down ryan kettle','pass on ryan','decline ryan kettle'] },

    { id:'approve_batch', concepts:['HIRE','ALL','SCORE'], require:[['HIRE'],['ALL','SCORE']],
      phrases:['approve all','hire everyone','approve everyone above'],
      examples:['approve everyone above 75','hire all the unflagged ones','approve every candidate over 80',
                'bulk approve the clear ones'] },

    { id:'remove_shift', concepts:['REMOVE','SHIFT'], require:[['REMOVE'],['SHIFT']],
      phrases:['take off the rota','remove from the rota','drop the shift','off the schedule'],
      examples:['take kayla off the rota','remove kayla brennan-ross shifts','drop kayla from next week',
                'cancel her shifts','pull kayla off the schedule'] },

    { id:'queue_summary', concepts:['QUEUE','COUNT'], require:[['QUEUE']],
      phrases:['what needs me','what is waiting','my queue','what should i do'],
      examples:['what needs a person','what is in my queue','what is waiting on me','anything for me today',
                'show my inbox','what should i do first'] },

    { id:'explain_flag', concepts:['FLAG','WHY'], require:[['FLAG']],
      phrases:['why blocked','rehire flag','do not hire'],
      examples:['why is trevor blocked','what is wrong with trevor boone','explain the rehire flag',
                'why did trevor stop','who is flagged'] },

    { id:'compliance_status', concepts:['EVERIFY','COMPLIANCE','STATUS'], require:[['EVERIFY','COMPLIANCE']],
      phrases:['e verify','mismatch','how long left'],
      examples:['what is happening with kayla','everify status','how long left on the mismatch',
                'when does the i9 expire','compliance deadlines','is kayla clear yet'] },

    { id:'slow_checks', concepts:['CHECK','SLOW'], require:[['CHECK','SLOW']],
      phrases:['background check','which checks are slow'],
      examples:['which background checks are slow','what is holding up the checks','any checks overdue',
                'why is sasha taking so long','background check status'] },

    { id:'day_one_risk', concepts:['DAYONE','CANDIDATE','CONFIRMED'], require:[['DAYONE','CONFIRMED']],
      phrases:['day one','first shift','might not turn up'],
      examples:['who might not turn up','any day one risk','who has not confirmed','who is starting soon',
                'first shifts this week','anyone likely to no show'] },

    { id:'confirm_signal', concepts:['CONFIRMED','HOW'], require:[['HOW'],['CONFIRMED','DAYONE']],
      phrases:['how do you know','how is it tracked','how does that work'],
      examples:['how do you know the confirmation was opened','how do you track confirmations',
                'how does the confirmation signal work','how can you tell if they read it'] },

    { id:'explain_stage', concepts:['STAGE','WHY','PIPELINE'], require:[['STAGE']],
      phrases:['what happens at stage','who owns stage'],
      examples:['what happens at stage 12','who owns step 6','explain stage 3','tell me about stage 10',
                'what is step 16'] },

    { id:'review_held', concepts:['REVIEW','SCREEN'], require:[['REVIEW']],
      phrases:['held for review','clear the review list'],
      examples:['show the held candidates','why were 19 held','clear the review list',
                'mark the held ones read','what is in review'] },

    { id:'candidate_status', concepts:['CANDIDATE','STATUS','STAGE'], require:[['STATUS','STAGE']], needsPerson:true,
      phrases:['where is','status of','how far along'],
      examples:['where is alicia','status of alicia reyes','how far along is alicia','what stage is alicia at'] },

    { id:'report_metric', concepts:['REPORT','COUNT'], require:[['REPORT','COUNT']],
      phrases:['time to hire','how many hires','show the numbers'],
      examples:['what is our time to hire','how many did we hire','show me the numbers','open reports',
                'who acted the most','what is the drop off'] },

    { id:'nav_goto', concepts:['SHOW','PIPELINE','STORE','SCREEN','REPORT','COMPLIANCE'], require:[['SHOW']],
      phrases:['open the','take me to','show me the'],
      examples:['open the pipeline','show compliance','take me to reports','go to the store view',
                'show me the screening call'] },

    { id:'reset_demo', concepts:['RESET'], require:[['RESET']],
      phrases:['reset the demo','start over'],
      examples:['reset the demo','start over','put it back how it was','clean slate'] },

    { id:'set_theme', concepts:['THEME'], require:[['THEME']],
      phrases:['dark mode','light mode'],
      examples:['switch to dark mode','make it light','change the theme','dark please'] },

    { id:'help', concepts:['HELP'], require:[['HELP']],
      phrases:['what can you do','help'],
      examples:['what can you do','help','what are you able to do','list your commands','how do i use this'] }
  ];

  /* --------------------------------------------------------------- weights --- */

  var IDF = {};
  (function () {
    var N = INTENTS.length, df = {};
    INTENTS.forEach(function (it) {
      var seen = {};
      it.concepts.forEach(function (c) { seen[c] = 1; });
      Object.keys(seen).forEach(function (c) { df[c] = (df[c] || 0) + 1; });
    });
    Object.keys(CONCEPTS).forEach(function (c) {
      IDF[c] = Math.log((N + 1) / ((df[c] || 0) + 1)) + 1;
    });
  })();

  var VOCAB = Object.keys(TOK2CONCEPT);

  /* ----------------------------------------------------------------- fuzzy --- */

  function damerau(a, b) {
    var al = a.length, bl = b.length;
    if (!al) return bl;
    if (!bl) return al;
    var d = [], i, j;
    for (i = 0; i <= al; i++) d[i] = [i];
    for (j = 0; j <= bl; j++) d[0][j] = j;
    for (i = 1; i <= al; i++) {
      for (j = 1; j <= bl; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + cost);
        if (i > 1 && j > 1 && a.charAt(i-1) === b.charAt(j-2) && a.charAt(i-2) === b.charAt(j-1)) {
          d[i][j] = Math.min(d[i][j], d[i-2][j-2] + 1);
        }
      }
    }
    return d[al][bl];
  }

  function ratio(a, b) {
    var m = Math.max(a.length, b.length);
    return m ? 1 - (damerau(a, b) / m) : 1;
  }

  function fuzzyToken(tok) {
    if (tok.length < 4) return null;
    var best = null, bestR = 0;
    for (var i = 0; i < VOCAB.length; i++) {
      var v = VOCAB[i];
      if (Math.abs(v.length - tok.length) > 3) continue;
      var r = ratio(tok, v);
      if (r > bestR) { bestR = r; best = v; }
    }
    return bestR >= 0.78 ? { token: best, score: bestR } : null;
  }

  /* -------------------------------------------------------------- entities --- */

  function roster() {
    var D = window.DEMO, out = [], seen = {};
    function add(name, kind, extra) {
      if (!name || seen[name]) return;
      seen[name] = 1;
      out.push({ name: name, kind: kind, extra: extra || null });
    }
    add(D.spine.name, 'candidate', D.spine);
    add(D.flagged.name, 'flagged', D.flagged);
    add(D.mismatch.name, 'newhire', D.mismatch);
    D.decisions.forEach(function (c) { add(c.name, 'decision', c); });
    D.inReview.forEach(function (c) { add(c.name, 'review', c); });
    D.checks.forEach(function (c) { add(c.name, 'check', c); });
    D.starts.forEach(function (c) { add(c.name, 'start', c); });
    add(D.people.dana.name, 'user', D.people.dana);
    add(D.people.marcus.name, 'user', D.people.marcus);
    return out;
  }

  function findPerson(tokens, norm) {
    var people = roster(), best = null, bestScore = 0;
    // Possessives arrive without an apostrophe once punctuation is stripped:
    // "kaylas case", "trevors flag". Compare the de-possessed form too.
    var probes = tokens.slice();
    tokens.forEach(function (t) {
      if (t.length > 4 && t.slice(-1) === 's') probes.push(t.slice(0, -1));
    });
    tokens = probes;
    people.forEach(function (p) {
      var full = p.name.toLowerCase();
      var parts = full.split(/[\s\-]+/).filter(function (w) { return w.length > 1; });
      var score = 0;
      if (norm.indexOf(full) >= 0) score = 1.0;
      else {
        parts.forEach(function (part) {
          tokens.forEach(function (t) {
            if (t === part) score = Math.max(score, 0.9);
            else if (t.length >= 4 && part.length >= 4) {
              var r = ratio(t, part);
              if (r >= 0.8) score = Math.max(score, r * 0.85);
            }
          });
        });
        var hits = parts.filter(function (part) {
          return tokens.some(function (t) { return t === part || (t.length > 3 && ratio(t, part) >= 0.85); });
        }).length;
        if (hits >= 2) score = Math.max(score, 0.97);
      }
      if (score > bestScore) { bestScore = score; best = p; }
    });
    // Count how many DISTINCT roster people the text points at. findPerson
    // returns one best match, so without this "approve ines and marcus" is
    // indistinguishable from "approve ines".
    /* Count DISTINCT people, carefully. A first name shared by two roster rows
       is ambiguity, not two people: "move marcus hale forward" names one person
       even though "marcus" appears in both Marcus Hale and Marcus Iyer. So a
       row only counts when its surname matched, or when its first name matched
       and no other row shares that first name. */
    var firstNameCounts = {};
    people.forEach(function (p) {
      var f = p.name.toLowerCase().split(/[\s\-]+/)[0];
      firstNameCounts[f] = (firstNameCounts[f] || 0) + 1;
    });

    var hitNames = {};
    people.forEach(function (p) {
      var parts = p.name.toLowerCase().split(/[\s\-]+/).filter(function (w) { return w.length > 2; });
      var first = parts[0], rest = parts.slice(1);
      var surnameHit = rest.some(function (part) {
        return tokens.some(function (t) { return t === part; });
      });
      var firstHit = tokens.some(function (t) { return t === first; });
      if (surnameHit || (firstHit && firstNameCounts[first] === 1)) hitNames[p.name] = 1;
    });

    return bestScore >= 0.72
      ? { person: best, score: bestScore, count: Object.keys(hitNames).length || 1 }
      : null;
  }

  var STAGE_ALIAS = [
    { n: 1,  words: ['application', 'apply', 'applied', 'intake', 'captured'] },
    { n: 2,  words: ['eligibility', 'eligible', 'hardrule', 'rules'] },
    { n: 3,  words: ['screening', 'screen', 'behavioural', 'behavioral', 'phrasebank'] },
    { n: 4,  words: ['scheduled', 'booking', 'booked', 'calendar'] },
    { n: 5,  words: ['noshow', 'interview'] },
    { n: 6,  words: ['decision', 'decide', 'hire', 'reject'] },
    { n: 7,  words: ['offer'] },
    { n: 8,  words: ['accepted', 'acceptance', 'quiet'] },
    { n: 9,  words: ['ordered', 'order'] },
    { n: 10, words: ['background', 'county', 'court', 'bgc'] },
    { n: 11, words: ['i9', 'w4', 'paperwork', 'deposit'] },
    { n: 12, words: ['everify', 'verify', 'verification', 'mismatch', 'tnc'] },
    { n: 13, words: ['training', 'certification', 'certifications'] },
    { n: 14, words: ['badge', 'uniform', 'provisioning', 'payroll', 'access'] },
    { n: 15, words: ['firstshift', 'rota', 'roster'] },
    { n: 16, words: ['dayone'] },
    { n: 17, words: ['weekone', 'floor'] },
    { n: 18, words: ['ramp', 'unsupervised'] },
    { n: 19, words: ['checkin', 'checkins', '30', '60', '90'] },
    { n: 20, words: ['retention', 'retained', 'day90'] }
  ];

  function findStage(tokens, norm) {
    var flat = norm.replace(/[\s\-]/g, '');
    if (/\b(stage|step|phase)\b/.test(norm)) {
      for (var i = 0; i < tokens.length; i++) {
        var n = parseInt(tokens[i], 10);
        if (!isNaN(n) && n >= 1 && n <= 20) return { n: n, by: 'number' };
      }
    }
    // aliases first: one distinctive word is a better signal than 45% coverage
    // of a long official stage name
    var aliasHit = null;
    STAGE_ALIAS.forEach(function (a) {
      a.words.forEach(function (w) {
        if (aliasHit) return;
        if (flat.indexOf(w) >= 0) { aliasHit = a.n; return; }
        if (tokens.some(function (t) {
          return t === w || stem(t) === stem(w) || (t.length > 4 && w.length > 4 && ratio(t, w) >= 0.84);
        })) aliasHit = a.n;
      });
    });
    if (aliasHit) {
      var st0 = window.DEMO.steps.filter(function (x) { return x.n === aliasHit; })[0];
      return { n: aliasHit, by: 'alias', step: st0 };
    }

    var D = window.DEMO, best = null, bestR = 0;
    D.steps.forEach(function (st) {
      var words = st.name.toLowerCase().split(/[^a-z0-9]+/)
        .filter(function (w) { return w.length > 3 && !STOP[w]; });
      var hits = words.filter(function (w) {
        return tokens.some(function (t) { return t === w || stem(t) === stem(w) || ratio(t, w) >= 0.85; });
      }).length;
      var r = words.length ? hits / words.length : 0;
      if (r > bestR) { bestR = r; best = st; }
    });
    return bestR >= 0.34 ? { n: best.n, by: 'name', step: best } : null;
  }

  var ROUTE_WORDS = {
    deck: ['today','inbox','queue','deck','home','dashboard'],
    decide: ['approval','approvals','decision','decisions','decide'],
    screening: ['screening','call','transcript','interview'],
    pipeline: ['pipeline','funnel','stage','stages','step','steps'],
    candidate: ['record','history','timeline','alicia'],
    funnel: ['report','reports','metric','metrics','analytics','instrumentation'],
    flag: ['flag','rehire','trevor'],
    compliance: ['compliance','everify','i9','mismatch','kayla','legal'],
    checks: ['background','county','court','check','checks','bgc','bg'],
    store: ['store','marcus','branch','shop']
  };

  function findRoute(tokens) {
    var best = null, bestHits = 0;
    Object.keys(ROUTE_WORDS).forEach(function (r) {
      var hits = 0;
      ROUTE_WORDS[r].forEach(function (w) {
        if (tokens.some(function (t) {
          return t === w || stem(t) === stem(w) || (t.length > 4 && ratio(t, w) >= 0.85);
        })) hits++;
      });
      if (hits > bestHits) { bestHits = hits; best = r; }
    });
    return bestHits ? best : null;
  }

  function findNumber(tokens) {
    for (var i = 0; i < tokens.length; i++) {
      var n = parseInt(tokens[i], 10);
      if (!isNaN(n)) return n;
    }
    return null;
  }

  /* -------------------------------------------------------------- classify --- */

  /**
   * Does the phrase appear in the token stream, in order, within a small gap?
   * English splits verb particles constantly: "take kayla off the rota" has to
   * match the REMOVE phrase "take off". Contiguous-only matching misses it, and
   * that single gap was breaking the most important intent in the product.
   */
  function gappyPhrase(words, tokens, maxGap) {
    var wi = 0, lastAt = -1;
    for (var ti = 0; ti < tokens.length && wi < words.length; ti++) {
      var t = tokens[ti];
      if (t === words[wi] || stem(t) === stem(words[wi])) {
        if (wi > 0 && (ti - lastAt - 1) > maxGap) { wi = 0; }        // gap too wide, restart
        if (t === words[wi] || stem(t) === stem(words[wi])) {
          lastAt = ti; wi++;
        }
      }
    }
    return wi === words.length;
  }

  function conceptsIn(tokens, norm) {
    var found = {}, evidence = [], consumed = {};
    PHRASES.forEach(function (ph) {
      var words = ph.phrase.split(' ');
      var hit = false, how = null;
      if (norm.indexOf(ph.phrase) >= 0) { hit = true; how = 'phrase'; }
      else if (words.length === 2 && gappyPhrase(words, tokens, 3)) { hit = true; how = 'phrase-split'; }
      if (hit) {
        found[ph.concept] = (found[ph.concept] || 0) + (how === 'phrase' ? 1.35 : 1.15);
        evidence.push({ concept: ph.concept, matched: ph.phrase, how: how });
        // Mark the words as spoken for, so the fuzzy pass leaves them alone.
        // Without this, "phrase bank" also yielded STAGE, because "phrase"
        // fuzzy-matches "phase" at 0.8.
        words.forEach(function (w) { consumed[w] = 1; consumed[stem(w)] = 1; });
      }
    });
    tokens.forEach(function (tok) {
      if (STOP[tok] && !NEGATIONS[tok]) return;
      var st = stem(tok);
      var cs = TOK2CONCEPT[st] || TOK2CONCEPT[tok];
      if (cs) {
        cs.forEach(function (c) {
          found[c] = (found[c] || 0) + 1;
          evidence.push({ concept: c, matched: tok, how: 'exact' });
        });
        return;
      }
      if (consumed[tok] || consumed[st]) return;
      var f = fuzzyToken(st);
      if (f) {
        (TOK2CONCEPT[f.token] || []).forEach(function (c) {
          found[c] = (found[c] || 0) + f.score * 0.85;
          evidence.push({ concept: c, matched: tok, how: 'fuzzy', to: f.token,
                          score: Math.round(f.score * 100) / 100 });
        });
      }
    });
    return { found: found, evidence: evidence };
  }

  function classify(text) {
    var norm = normalise(text);
    var tokens = tokenise(norm);
    var cn = conceptsIn(tokens, norm);
    var found = cn.found;

    var person = findPerson(tokens, norm);
    var stage = findStage(tokens, norm);
    var route = findRoute(tokens);
    // A mechanism question, as opposed to a request for an action.
    var asksHow = /\b(how|what|where|which|why)\b/.test(norm) &&
                  !/^(please\s+)?(email|text|send|fire|print|export)\b/.test(norm);
    var oos = outOfScope(tokens, norm, asksHow);
    var personCount = person ? person.count : 0;

    /* Reset vocabulary aimed at a named person is a deletion request, not a
       demo reset. Without this it fell through to whatever else matched, so
       "wipe kayla's file so we can start her over" answered a day-one question.
       Deleting a person's record is not something the product does. */
    if (!oos && person && /\b(wipe|delete|clear|purge|remove|scrub|erase)\b/.test(norm) &&
        /\b(file|record|records|data|history|profile)\b/.test(norm)) {
      oos = 'delete-a-record';
    }

    /* Negation has to be SCOPED. Setting a global flag whenever any negation
       token appears anywhere means ordinary politeness kills a real request:
       "if it is not too much trouble, push Marcus through" was being discarded
       entirely. Only count a negation that sits within a few tokens of the
       action word it would actually negate. The lookahead runs the same fuzzy
       pass, or "do not aprove ryan" slips through, and it checks phrases too,
       or "lets not move forward with trevor" slips through, because
       "move forward" never enters TOK2CONCEPT. */
    var ACTION_CONCEPTS = { HIRE:1, REJECT:1, REMOVE:1, RESET:1, THEME:1 };
    function negatesAnAction() {
      for (var i = 0; i < tokens.length; i++) {
        if (!NEGATIONS[tokens[i]]) continue;
        for (var j = i + 1; j <= i + 4 && j < tokens.length; j++) {
          var st2 = stem(tokens[j]);
          var cs = TOK2CONCEPT[st2] || TOK2CONCEPT[tokens[j]];
          if (!cs) { var fz = fuzzyToken(st2); if (fz) cs = TOK2CONCEPT[fz.token]; }
          if (cs && cs.some(function (c) { return ACTION_CONCEPTS[c]; })) return true;
        }
        // phrase forms, which never reach TOK2CONCEPT
        var tail = tokens.slice(i + 1, i + 5).join(' ');
        var phraseHit = false;
        PHRASES.forEach(function (ph) {
          if (ACTION_CONCEPTS[ph.concept] && tail.indexOf(ph.phrase) >= 0) phraseHit = true;
        });
        if (phraseHit) return true;
      }
      return false;
    }
    var negated = negatesAnAction();

    // Entities can satisfy a gate. Somebody asking "why is sasha taking so long"
    // never types the word "check", but Sasha is a background check. Somebody
    // asking "what is happening with kayla" never types "e-verify", but Kayla is
    // the mismatch case. Without this the gate rejects the very questions a real
    // user would ask.
    var implied = {};
    if (person) {
      if (person.person.kind === 'check')   implied.CHECK = 1;
      if (person.person.kind === 'newhire') { implied.EVERIFY = 1; implied.COMPLIANCE = 1; }
      if (person.person.kind === 'flagged') implied.FLAG = 1;
      if (person.person.kind === 'start')   implied.DAYONE = 1;
    }
    function has(c) { return found[c] || implied[c]; }

    var ACTIONS = { approve_candidate:1, approve_batch:1, reject_candidate:1,
                    remove_shift:1, reset_demo:1, set_theme:1 };
    // A number that looks like a stage but is out of range.
    var r_outOfRange = /\b(stage|step|phase)\b/.test(norm) && !stage &&
                       tokens.some(function (t) { var n = parseInt(t, 10); return !isNaN(n) && (n < 1 || n > 20); });

    var scored = INTENTS.map(function (it) {
      var gated = (it.require || []).every(function (group) {
        return group.some(function (c) { return has(c); });
      });
      var raw = 0, hitCount = 0;
      it.concepts.forEach(function (c) {
        if (found[c]) { raw += Math.min(found[c], 2) * (IDF[c] || 1); hitCount++; }
      });
      var pb = 0;
      (it.phrases || []).forEach(function (ph) { if (norm.indexOf(ph) >= 0) pb += 1.6; });
      var eb = 0;
      if (it.needsPerson && person) eb += 1.2;
      if (it.needsPerson && !person) eb -= 1.4;      // "hire" with nobody named is not actionable
      if (it.id === 'explain_stage') {
        if (stage && (stage.by === 'number' || stage.by === 'alias')) eb += 1.8;
        else if (stage) eb += 1.3;
        else eb -= 1.6;                              // asking about "a stage" with no stage is not this
        if (person && !(stage && (stage.by === 'number' || stage.by === 'alias'))) eb -= 1.2;  // "what stage is alicia at" is a status question
      }
      if (it.id === 'candidate_status' && person && !(stage && (stage.by === 'number' || stage.by === 'alias'))) eb += 1.0;
      if (it.id === 'nav_goto') {
        if (route) eb += 0.8; else eb -= 1.0;
        if (route === 'funnel') eb -= 0.6;            // reports: let report_metric take it, same destination
      }
      // A named person who is the mismatch case pulls toward compliance.
      var pk = person ? person.person.kind : null;
      if (it.id === 'compliance_status' && pk === 'newhire') eb += 2.2;
      if (it.id === 'candidate_status' && pk === 'newhire') eb -= 1.6;
      // The CHECK boost must not fire when the user is plainly navigating.
      if (it.id === 'slow_checks' && (pk === 'check' || has('CHECK')) && !has('SHOW')) eb += 1.8;
      if (it.id === 'explain_flag' && pk === 'flagged') eb += 2.0;
      if (it.id === 'explain_flag' && person && pk !== 'flagged') eb -= 1.4;
      if (it.id === 'review_held' && has('CHECK')) eb -= 1.2;
      // A batch request names no individual, so it must beat the singular form.
      if (it.id === 'approve_batch' && (has('ALL') || has('SCORE'))) eb += 2.0;
      if (it.id === 'approve_candidate' && has('ALL') && !person) eb -= 2.0;
      // Asking for the queue is more specific than asking to navigate to it.
      if (it.id === 'queue_summary' && has('QUEUE')) eb += 1.0;
      if (it.id === 'remove_shift' && has('REMOVE') && (has('SHIFT') || pk === 'newhire')) eb += 1.6;
      // "how many working days left on kayla's case" is a compliance question
      // that happens to contain "how many". A named case beats a bare count.
      if (it.id === 'report_metric' && (pk === 'newhire' || pk === 'check' || pk === 'flagged')) eb -= 2.0;
      // If the person literally typed "stage" or "step", they are asking about
      // the stage, even when the stage they named is a compliance one.
      if (it.id === 'explain_stage' && found.STAGE) eb += 1.2;
      if (it.id === 'compliance_status' && found.STAGE && stage) eb -= 1.0;
      /* A question is not a command. "who approved alicia" was returning
         approve_candidate at full confidence, which in a live demo means a
         question gets answered by hiring somebody. */
      if (ACTIONS[it.id] && /^(who|why|how|when|which|whose)\b/.test(norm)) eb -= 3.0;
      // There is no batch reject, so a plural reject must not read as singular.
      if (it.id === 'reject_candidate' && has('ALL')) eb -= 2.5;
      // "hows eli doing" is not a question about the tracking mechanism.
      if (it.id === 'confirm_signal' && !found.CONFIRMED) eb -= 2.0;
      if (it.id === 'confirm_signal' && found.HOW && found.CONFIRMED) eb += 2.0;
      if (it.id === 'day_one_risk' && found.HOW && found.CONFIRMED) eb -= 2.0;
      // Navigating to the background checks screen is not asking what is slow.
      if (it.id === 'slow_checks' && has('SHOW') && !has('SLOW')) eb -= 3.5;
      // A stage number outside 1 to 20 is not a stage question.
      if (it.id === 'explain_stage' && r_outOfRange) eb -= 3.0;
      // There is no batch reject, so several names must not read as one.
      if (it.id === 'reject_candidate' && personCount > 1) eb -= 3.0;
      if (it.id === 'reject_candidate' && has('ALL')) eb -= 1.2;   // on top of the earlier demotion
      // Reset applies to the whole demo, never to one person.
      if (it.id === 'reset_demo' && person) eb -= 3.5;
      // Nobody asks for dark mode about a person, so a named person rules out a
      // theme change. This is what keeps "green light Marcus Hale" an approval.
      if (it.id === 'set_theme' && person) eb -= 3.0;
      // Two or more roster names means a batch, which findPerson cannot count.
      if (it.id === 'approve_candidate' && personCount > 1) eb -= 2.0;
      if (it.id === 'approve_batch' && personCount > 1) eb += 2.0;

      var coverage = it.concepts.length ? hitCount / it.concepts.length : 0;
      var score = gated ? (raw + pb + eb) * (0.65 + 0.35 * coverage) : 0;
      return { id: it.id, score: score, gated: gated, coverage: coverage, hits: hitCount };
    }).sort(function (a, b) { return b.score - a.score; });

    var top = scored[0], second = scored[1] || { score: 0 };
    /* A prior in the denominator. Without it, whenever exactly one intent
       survives the gate, confidence is 1.0 and margin is 1.0 by arithmetic,
       however little evidence there was. "unblock trevor" scored 1.0 on an
       empty concept list. A lone weak score now reads as weak. */
    var sum = scored.reduce(function (a, x) { return a + x.score; }, 0) + 2.0;
    var confidence = top.score > 0 ? top.score / sum : 0;
    var margin = top.score > 0 ? (top.score - second.score) / top.score : 0;

    var flags = [];
    if (negated && ACTIONS[top.id]) flags.push('negated');
    if (oos) flags.push('out-of-scope:' + oos);

    /* Hard blocks, not score penalties. A penalty can always be outvoted by a
       strong enough lexical match, and these three must never resolve:
         - a singular action naming more than one person, because acting would
           silently pick one of them
         - a reset aimed at a person, because reset only means the whole demo
         - an exclusion or an undo, handled above by outOfScope */
    var SINGULAR = { approve_candidate: 1, reject_candidate: 1 };
    if (SINGULAR[top.id] && personCount > 1) flags.push('multiple-people');
    if (top.id === 'reset_demo' && person) flags.push('reset-is-global');

    /* Two names joined by "and" against a singular action. personCount cannot
       always separate them, because a shared first name is ambiguous, so catch
       the conjunction directly. Acting would silently pick one of the two. */
    if (SINGULAR[top.id] && person && /\b(and|plus|also)\b/.test(norm) &&
        /\b(and|plus|also)\s+\w+/.test(norm)) {
      var afterAnd = norm.split(/\b(?:and|plus|also)\b/)[1] || '';
      if (findPerson(tokenise(afterAnd), afterAnd)) flags.push('multiple-people');
    }

    /* There is no bulk reject. So any request for one must not resolve to an
       action, however much other vocabulary is in the sentence. "rather than
       pushing the good ones through, turn down everybody under 50" was landing
       on bulk APPROVE, because the discarded clause carried the approve words. */
    if (ACTIONS[top.id] && found.REJECT && found.ALL) flags.push('bulk-reject-unsupported');

    /* Two intents that both point at the same screen for the same person are
       agreeing, not competing, so a thin margin between them should not be
       read as confusion. */
    var SAME_DEST = { candidate_status: 'compliance_status', compliance_status: 'candidate_status',
                      report_metric: 'nav_goto', nav_goto: 'report_metric' };
    var agreeing = second.score > 0 && SAME_DEST[top.id] === second.id;
    var marginOk = margin >= 0.12 || agreeing;

    var blocked = flags.some(function (f) {
      return f === 'negated' || f === 'multiple-people' || f === 'reset-is-global' ||
             f === 'bulk-reject-unsupported';
    });
    var ok = top.score > 0 && confidence >= 0.20 && marginOk && !blocked && !oos;

    return {
      text: text, norm: norm, tokens: tokens,
      intent: ok ? top.id : 'unknown',
      raw: top.id,
      score: Math.round(top.score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      resolved: ok, flags: flags,
      alternatives: scored.filter(function (x) { return x.score > 0; }).slice(0, 3)
        .map(function (x) { return { id: x.id, score: Math.round(x.score * 100) / 100 }; }),
      concepts: Object.keys(found).sort(function (a, b) { return found[b] - found[a]; }),
      evidence: cn.evidence,
      outOfScope: oos,
      entities: {
        person: person ? person.person : null,
        personCount: personCount,
        personScore: person ? Math.round(person.score * 100) / 100 : 0,
        stage: stage, route: route, number: findNumber(tokens), negated: negated
      }
    };
  }

  return {
    classify: classify, normalise: normalise, tokenise: tokenise, stem: stem, ratio: ratio,
    intents: INTENTS.map(function (i) { return i.id; }),
    examples: function () {
      var out = [];
      INTENTS.forEach(function (i) {
        i.examples.forEach(function (e) { out.push({ text: e, expect: i.id }); });
      });
      return out;
    }
  };
})();
