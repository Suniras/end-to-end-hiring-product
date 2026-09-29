/* ============================================================================
   data.js  ·  what is left of the seed

   This file used to be the product's database: every candidate, every count,
   every duration, invented and hardcoded. On 29 August 2026 all of that moved
   behind the API, where it is a real dataset that real workflow code moves
   through and real arithmetic measures.

   What remains is the presenter script, which is narration rather than data,
   and the twenty-step table, which now lives in steps.js so that the server,
   the browser and the test harness read the same copy.

   If you are looking for candidates, they are in server/lib/seed.js and they
   are replayed through the workflow engine rather than written down.
   ============================================================================ */

window.DEMO = (function () {
  'use strict';

  var HOUR = 3600000, DAY = 86400000, MIN = 60000;

  /* -------------------------------------------------------- the scenes ---
     Thirteen scenes, read aloud. The narration says what to say and the act
     line says what to do. Nothing here is data the product reads.
  ------------------------------------------------------------------------ */

  var scenes = [
    { id: 1, t: 'Monday morning', route: 'deck', secs: 45, land: 'the queue is the product',
      say: 'This is what a store manager opens on a Monday. Everything that arrived over the weekend has already been through the rules and the screening agent. What is left on this screen is the part that needs a person.',
      act: 'Point at the four numbers. They are counted from the database, not typed in.' },
    { id: 2, t: 'The whole journey', route: 'pipeline', secs: 50, land: 'seventeen of nineteen are waits or handoffs',
      say: 'Twenty steps from application to day ninety. Colour is ownership, not decoration. Purple is the agent, blue is a person, grey is deterministic software, amber is a wait nobody controls.',
      act: 'Open a step. Every one says what the agent does, what a person does, and what the software does.' },
    { id: 3, t: 'One candidate, all twenty steps', route: 'candidate', secs: 55, land: 'one system sees the whole thing',
      say: 'Here is one person through the entire journey. Every step shows how long it took and how much of that was queue rather than work. The queue is the product.',
      act: 'Scroll the timeline. Point at a step with a big queue and a small work time.' },
    { id: 4, t: 'The screening', route: 'screening', secs: 60, land: 'the agent recommends, it never decides',
      say: 'The screening conversation, the transcript, and the evaluation. The evaluation names the criteria it was given, quotes the answer behind each verdict, and lists what it could not answer.',
      act: 'Show the evidence column. Every verdict cites something the candidate actually said.' },
    { id: 5, t: 'The decision', route: 'decide', secs: 50, land: 'a named person, always',
      say: 'The agent can put somebody in front of you. It cannot approve and it cannot reject. Both of those are reserved for a named person and the workflow engine refuses any other actor.',
      act: 'Approve somebody. Watch the pipeline count change behind it.' },
    { id: 6, t: 'Where the openings go', route: 'sources', secs: 40, land: 'we buy breadth, we do not build it',
      say: 'Where the openings go out and where the people come back from. Every one of these is a simulated connector, and the screen says so.',
      act: 'Point at the failed post and its retry. An integration surface with no errors in it has never met a real vendor.' },
    { id: 7, t: 'The rehire flag', route: 'flag', secs: 55, land: 'it stops, it does not reject',
      say: 'This applicant matched a prior employment record marked not eligible for rehire. The product stopped and put it in front of a person. It did not reject him, because the record might be wrong.',
      act: 'Show the two ways out. Both need a reason and both are recorded against whoever chose.' },
    { id: 8, t: 'The refusal', route: 'compliance', secs: 65, land: 'the product refuses its own user',
      say: 'A new hire is contesting an E-Verify mismatch. Until the case closes, nothing adverse is lawful. Try to take her shifts off the rota and the product refuses, and tells you why.',
      act: 'Try it in the assistant. Then show the two previous attempts on the record.' },
    { id: 9, t: 'The checks', route: 'checks', secs: 40, land: 'the wait is the county court',
      say: 'Background checks, broken down by search and by county. One of these has been open eight days. The wait is the county court, not the agency and not us, and the screen says which court.',
      act: 'Expand the slow one.' },
    { id: 10, t: 'Onboarding, in parallel', route: 'candidate', secs: 50, land: 'we started everything we could start',
      say: 'When somebody accepts, eleven onboarding tasks are created at once and every one with no unmet dependency starts immediately. Two of them genuinely cannot start before the first day of work for pay, and the screen says which and why.',
      act: 'Show the sequential estimate against the critical path. The gap is arithmetic, not a claim.' },
    { id: 11, t: 'What it measures', route: 'funnel', secs: 50, land: 'the product is the instrument',
      say: 'Every number here is computed from recorded events. If the data produces an ugly number, the screen shows the ugly number. That is the whole point of an instrument.',
      act: 'Point at the queue share. Then compare the stores.' },
    { id: 12, t: 'The store', route: 'store', secs: 40, land: 'the district manager gets a reason to care',
      say: 'One store, and then the same view across five. A store manager cannot use a comparison against stores they do not run, which is exactly why this screen is here.',
      act: 'Switch stores in the header.' },
    { id: 13, t: 'The assistant', route: 'deck', secs: 60, land: 'it asks before it acts',
      say: 'Ask it who needs attention. Ask it why somebody is blocked. Then ask it to approve somebody, and watch it stop and ask, because that is a hiring decision and it is going on your name.',
      act: 'Press C. Ask three questions. Then show the audit trail proving what happened.' }
  ];

  return {
    scenes: scenes,
    steps: window.STEPS || [],
    HOUR: HOUR, DAY: DAY, MIN: MIN
  };
})();
