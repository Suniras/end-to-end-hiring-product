/* ============================================================================
   pagemeta.js  ·  the head of every page, built on the server

   WHY THIS IS NOT IN THE BROWSER. Both surfaces are single-page applications,
   so before this file existed every route shared one title. /careers,
   /careers/roles/req_0003 and the confirmation all read "Careers" in the tab,
   in history and in a bookmark, and the operator side read "Hiring operations"
   on all seven of its pages. A title is the only label a person has for a tab
   they are not looking at.

   It is also the only way the metadata can be TRUE without JavaScript. A
   canonical link, a description and a job posting record written by the client
   are invisible to anything that does not run the page, and a canonical URL
   that appears a second after the document does is not a canonical URL.

   WHAT IS CLAIMED HERE IS WHAT IS ON THE PAGE. The job posting record is built
   from the same public projection the browser renders, field for field, so
   there is no path by which the structured data can describe a job the page
   does not show. Fields the record does not have are omitted rather than
   guessed: there is no employment type on a requisition, so none is emitted.

   INDEXING IS ONE SWITCH AND IT IS OFF. This is a demonstration environment
   whose retailer does not exist, so `PUBLIC_INDEX` defaults to false and every
   page carries noindex, robots.txt disallows everything and there is no
   sitemap. Turning it on makes ONE coherent change: the candidate pages become
   indexable, robots.txt allows exactly those and keeps the operator
   application and the API out, and the sitemap appears listing only the public
   candidate routes. The two states are never mixed, because a page that says
   noindex while robots.txt invites a crawler is a page nobody can reason about.
   ============================================================================ */

const TRUE = ['1', 'true', 'yes', 'on'];

export function siteConfig(env) {
  const e = env || process.env;
  const origin = String(e.SITE_ORIGIN || 'http://127.0.0.1:' + (e.PORT || 4173)).replace(/\/+$/, '');
  return { origin, indexable: TRUE.indexOf(String(e.PUBLIC_INDEX || '').toLowerCase()) >= 0 };
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* JSON inside a script tag needs one more escape than JSON.stringify gives:
   the sequence </script> anywhere in a string ends the block early. */
const jsonLd = (o) => JSON.stringify(o, null, 2).replace(/<\//g, '<\\/');

/**
 * The head, as a string.
 *
 * `page` carries what this particular URL is: its title, its description, its
 * path, whether it may be indexed at all, and any structured data. Everything
 * shared, which is the icons, the theme colour and the social card, is here
 * once rather than in two HTML files that would drift.
 */
export function head(page, site) {
  const p = page || {};
  const s = site || siteConfig();
  const url = s.origin + (p.path || '/');
  const indexable = s.indexable && p.indexable === true;
  const out = [];

  /* The client routes on the path, so without this it would see
     /careers/roles/<id> on a 404 response, ask the API for that requisition,
     get "No such job." and render the product's own red failure voice at
     somebody who mistyped a URL. This is how the document tells it. */
  if (p.status === 404) out.push('<meta name="app-state" content="not-found">');

  out.push('<title>' + esc(p.title) + '</title>');
  if (p.description) out.push('<meta name="description" content="' + esc(p.description) + '">');
  out.push('<meta name="robots" content="' + (indexable ? 'index, follow' : 'noindex, nofollow') + '">');
  /* A 404 gets no canonical. It has no canonical URL to declare: pointing one
     at /404 would be declaring a page that does not exist as the preferred
     version of a page that does not exist. */
  if (p.canonical !== false) out.push('<link rel="canonical" href="' + esc(url) + '">');

  /* The icons. An SVG for anything modern, an ICO because a browser asks for
     /favicon.ico whether or not anybody linked one, and a touch icon because a
     careers page gets saved to a phone home screen. */
  out.push('<link rel="icon" href="/brand/mark.svg" type="image/svg+xml">');
  out.push('<link rel="alternate icon" href="/favicon.ico" sizes="32x32">');
  out.push('<link rel="apple-touch-icon" href="/brand/icon-180.png">');
  out.push('<meta name="theme-color" content="#245AE2">');

  /* The social card, on the candidate pages only. An operator queue is not a
     thing anybody shares a preview of, and giving it one would be inviting it. */
  if (p.social !== false) {
    out.push('<meta property="og:type" content="website">');
    out.push('<meta property="og:title" content="' + esc(p.ogTitle || p.title) + '">');
    if (p.description) out.push('<meta property="og:description" content="' + esc(p.description) + '">');
    out.push('<meta property="og:url" content="' + esc(url) + '">');
    if (p.siteName) out.push('<meta property="og:site_name" content="' + esc(p.siteName) + '">');
    out.push('<meta property="og:image" content="' + esc(s.origin + '/brand/og.png') + '">');
    out.push('<meta property="og:image:width" content="1200">');
    out.push('<meta property="og:image:height" content="630">');
    out.push('<meta name="twitter:card" content="summary_large_image">');
  }

  if (p.structured) {
    out.push('<script type="application/ld+json">' + jsonLd(p.structured) + '</script>');
  }
  return out.join('\n  ');
}

/* ----------------------------------------------------------- the pages ---
   One entry per URL the candidate can be on, so a title, a description and a
   canonical path are decided in one place rather than three.
   ----------------------------------------------------------------------- */

const BRAND = (org) => (org && org.name) || 'Careers';

export function careersList(org, total) {
  const name = BRAND(org);
  return {
    path: '/careers',
    title: name + ' · Open roles',
    ogTitle: 'Open hourly roles at ' + name,
    siteName: name,
    description: total
      ? total + ' open hourly roles across our stores. Pay, hours and the shifts each role needs, ' +
        'and what happens after you apply.'
      : 'Open hourly roles across our stores. Pay, hours and the shifts each role needs, and what ' +
        'happens after you apply.',
    indexable: true
  };
}

export function rolePage(org, job) {
  const name = BRAND(org);
  const j = job || {};
  const where = j.store ? j.store.name + (j.store.city ? ', ' + j.store.city : '') : null;
  return {
    path: '/careers/roles/' + encodeURIComponent(j.id || ''),
    title: name + ' · ' + (j.title || 'Role'),
    ogTitle: (j.title || 'Role') + (where ? ' at ' + where : '') + ' · ' + name,
    siteName: name,
    description: describeJob(j),
    indexable: true,
    structured: jobPosting(org, j)
  };
}

export function applyPage(org, job) {
  const name = BRAND(org);
  const j = job || {};
  return {
    path: '/careers/apply/' + encodeURIComponent(j.id || ''),
    title: name + ' · Apply' + (j.title ? ' for ' + j.title : ''),
    siteName: name,
    description: "The application form. Only what the role's own requirements are checked against.",
    /* Never indexable. It is a form behind a recorded consent, and a crawler
       landing on it would index a step nobody can complete. */
    indexable: false
  };
}

export function sentPage(org) {
  const name = BRAND(org);
  return {
    path: '/careers/sent',
    title: name + ' · Application sent',
    siteName: name,
    description: 'Your application reached the hiring system.',
    indexable: false
  };
}

export function notFound(org) {
  const name = BRAND(org) === 'Careers' ? null : BRAND(org);
  return {
    path: '/404',
    title: (name ? name + ' · ' : '') + 'Page not found',
    description: 'That address does not exist on this site.',
    indexable: false,
    canonical: false,
    social: false
  };
}

/** The operator application. One title per surface, never indexable. */
export function operatorPage(org, which) {
  const name = BRAND(org);
  const w = OPERATOR[which] || OPERATOR.work;
  return {
    path: '/app',
    title: w + ' · ' + name + ' hiring',
    indexable: false,
    social: false
  };
}

export const OPERATOR = {
  work: 'Operations',
  decide: 'Decisions',
  find: 'Candidates',
  exceptions: 'Flags',
  screening: 'Screening',
  compliance: 'Compliance',
  pipeline: 'Pipeline',
  store: 'Stores',
  sources: 'Sources',
  person: 'Candidate'
};

function describeJob(j) {
  const bits = [];
  if (j.title) bits.push(j.title);
  if (j.store) bits.push('at ' + j.store.name + (j.store.city ? ', ' + j.store.city +
    (j.store.state ? ' ' + j.store.state : '') : ''));
  const tail = [];
  if (j.rate) tail.push(j.rate);
  if (j.hoursPerWeek != null) tail.push(j.hoursPerWeek + ' hours a week');
  if ((j.slotLabels || []).length) {
    const l = j.slotLabels;
    tail.push('needs ' + (l.length > 1
      ? l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1]
      : l[0]));
  }
  return bits.join(' ') + (tail.length ? '. ' + cap(tail.join(', ')) + '.' : '.');
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/**
 * schema.org JobPosting, built only from fields the page itself renders.
 *
 * WHAT IS DELIBERATELY ABSENT. There is no employmentType on a requisition, so
 * none is emitted: reading PART_TIME off an hours figure is an inference and
 * this record is not the place to make one. There is no closing date, so no
 * validThrough. `openings` is not published by the public projection at all,
 * because the requisition's size is not the number of seats left, so there is
 * no totalJobOpenings here either.
 */
function jobPosting(org, j) {
  if (!j || !j.id || !j.title) return null;
  const out = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: j.title,
    identifier: { '@type': 'PropertyValue', name: BRAND(org), value: j.key || j.id }
  };
  if (j.summary) out.description = j.summary;
  if (j.postedAt) out.datePosted = new Date(j.postedAt).toISOString().slice(0, 10);
  if (org && org.name) out.hiringOrganization = { '@type': 'Organization', name: org.name };
  if (j.store) {
    out.jobLocation = {
      '@type': 'Place',
      name: j.store.name,
      address: Object.assign({ '@type': 'PostalAddress', addressCountry: 'US' },
        j.store.city ? { addressLocality: j.store.city } : {},
        j.store.state ? { addressRegion: j.store.state } : {})
    };
  }
  if (j.rateCents != null) {
    out.baseSalary = {
      '@type': 'MonetaryAmount', currency: 'USD',
      value: { '@type': 'QuantitativeValue', value: j.rateCents / 100, unitText: 'HOUR' }
    };
  }
  if (j.hoursPerWeek != null) out.workHours = j.hoursPerWeek + ' hours a week';
  return out;
}
