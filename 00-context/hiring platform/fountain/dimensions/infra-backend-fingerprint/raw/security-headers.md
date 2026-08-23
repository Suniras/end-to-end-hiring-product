<!-- source: curl -sI (+ -sIL) against live hosts · captured_at: 2026-08-09 · method: dns-ct-fingerprint -->

# Fountain — security headers per host

## Per-host header table

| Host | HSTS | CSP | X-Frame-Options | X-Content-Type-Options | Cookie flags | Posture |
| --- | --- | --- | --- | --- | --- | --- |
| fountain.com (apex, →301 www) | `max-age=31536000; includeSubDomains; preload` | absent (redirect page) | absent | absent | `__cf_bm` HttpOnly, SameSite=None, Secure | edge-only, redirect hop |
| www.fountain.com | same HSTS | not captured on redirect hop (marketing SPA — needs full GET, not probed further) | — | — | — | — |
| app.fountain.com | `max-age=31536000; includeSubDomains; preload` | **present, report-only**: `content-security-policy-report-only` (not enforcing) — see full allow-list below | `SAMEORIGIN` | `nosniff` | `__cf_bm` HttpOnly, SameSite=None, Secure | CSP is **report-only, not enforced** — a real posture gap (the allow-list is drafted but not blocking); still a rich data source since it's fully populated |
| api.fountain.com | `max-age=31536000; includeSubDomains; preload` | absent | absent | absent | `__cf_bm` HttpOnly, SameSite=None, Secure | 404 body has minimal headers — no CSP/X-Frame-Options on the API host (expected for a pure JSON API, not a posture concern the way it would be on an HTML surface) |
| developer.fountain.com | `max-age=31536000` (no includeSubDomains/preload) | absent (ReadMe doesn't set one here) | `Deny` | `nosniff` | `__cf_bm` HttpOnly, SameSite=None, Secure | `x-download-options: noopen`, `x-dns-prefetch-control: off`, `x-xss-protection: 1; mode=block`, `permissions-policy: camera=(), microphone=(), geolocation=(), payment=()` — ReadMe's platform defaults, solid baseline |
| partners.fountain.com | same as developer (ReadMe platform) | absent | `Deny` | `nosniff` | same | same ReadMe baseline |
| support.fountain.com | `max-age=31536000; includeSubDomains; preload` | **present, enforced**: broad Intercom/Fin.ai allow-list (frame-ancestors includes many Intercom academy/partner subdomains) | `DENY` | `nosniff` | `__cf_bm` HttpOnly, SameSite=None, Secure | Intercom's own hosted-help-center security posture, not Fountain-authored |
| trust.fountain.com | `max-age=31536000; includeSubDomains; preload` | **present, enforced**, Vanta + many analytics/embed hosts allow-listed (see sub-processors) | absent explicit XFO (uses `frame-ancestors 'self'` in CSP instead) | `nosniff` | none observed on HEAD | `connect-src *` is notably broad (any origin) — a looser CSP directive on this one page |
| status.fountain.com | `max-age=259200` (short, no includeSubDomains) | absent | absent explicit (relies on Atlassian defaults) | `nosniff` | none | Statuspage/Atlassian's own baseline |
| internal.fountain.com | `max-age=31536000; includeSubDomains; preload` | absent | `SAMEORIGIN` | absent | `__cf_bm` HttpOnly, SameSite=None, Secure | 403 error-page shape, matches origin's generic blocked-host response |
| blog.fountain.com (bare subdomain) | absent (530 error page) | absent | `SAMEORIGIN` | absent | none | dangling/misconfigured entry, see cloud-cdn-fingerprint.md |
| www.fountain.com/blog (path) | `max-age=31536000; includeSubDomains; preload` | absent (not captured on HEAD; WordPress default likely permissive) | absent | absent | none on HEAD | WP Engine defaults |

## The `app.fountain.com` CSP allow-list (report-only) — the richest single artifact

Full directive text captured verbatim (redacted of nothing — this is a public response header, no
secrets). Reproduced by directive for scanability; **this is the CSP `connect-src`/`script-src`
cross-reference the task calls "gold"** — every third-party host below is corroborated against
`sub-processors.md`:

- **default-src:** `'none'`
- **script-src:** `'self' 'unsafe-eval' 'unsafe-inline'` + 3 sha256 hashes + `cdn.onesignal.com`,
  `fast.appcues.com`, `edge.fullstory.com`, `static.fountain.com`, `js.intercomcdn.com`,
  `cdp.customer.io`, `widget.intercom.io`
- **script-src-elem:** adds `3001.scriptcdn.net`, `api.nimblecapture.com`, `www.pagespeed-mod.com`,
  `onesignal.com`, `js.stripe.com`, `www.google-analytics.com`, `static.zdassets.com`,
  `ssl.google-analytics.com`, `www.youtube.com`
- **connect-src:** `'self'`, `api.nimblecapture.com`, `r.nimblecapture.com`,
  `onboardiq-secure-sa-east-1.s3.sa-east-1.amazonaws.com`, `api-iam.intercom.io`,
  `wss://nexus-websocket-a.intercom.io`, `fast.appcues.com`, `elements.hapi.vonq.com`,
  `marketplace.api.vonq.com`, `logs.browser-intake-datadoghq.com`, `rum.browser-intake-datadoghq.com`,
  `sockjs-mt1.pusher.com`, `*.fountain.com/`, `wss://api.appcues.net`, `wss://ws-mt1.pusher.com`,
  `wss://ws-us2.pusher.com`, `edge.fullstory.com`, `rs.fullstory.com`,
  `onboardiq-secure-ap-southeast-1.s3.ap-southeast-1.amazonaws.com`,
  `fountain-applicant-uploads.s3.us-west-1.amazonaws.com`,
  `onboardiq-secure-us-west-1.s3.us-west-1.amazonaws.com`,
  `onboardiq-secure-eu-west-1.s3.eu-west-1.amazonaws.com` (also `sa-east-1` again),
  `pr-onboardiq-secure-us-west-1.s3.us-west-1.amazonaws.com`, `merchant-ui-api.stripe.com`,
  `sockjs-us2.pusher.com`, `sockjs-ap2.pusher.com`, `wss://ws-ap2.pusher.com`, `api.appcues.net`,
  `wss://ws-eu.pusher.com`, `sockjs-eu.pusher.com`, `api.cronofy.com`, `www.google-analytics.com`,
  `onesignal.com`, `ekr.zdassets.com`, `cdp.customer.io`,
  `gist-queue-consumer-api.cloud.gist.build/api/v2/users`
- **img-src:** `'self' data: blob: *` (fully open)
- **style-src:** `'unsafe-inline' 'self'`, `onesignal.com`, `fonts.googleapis.com`, `fast.appcues.com`,
  `ka-p.fontawesome.com`
- **font-src:** `'self' data:`, `www.brightside.com/.../fonts/` (odd third-party font host — unexplained,
  open question), `fonts.intercomcdn.com`, `fonts.gstatic.com`, `static.zip.co/assets/fonts/`
- **media-src:** `data:`, `cameratag.com`, `us-assets.cameratag.com`, `assets.cameratag.com`,
  `secure-data.fountain.com`
- **frame-src:** `'self' blob: *` (fully open)
- **frame-ancestors:** `https://web.fountain.com` (note: a `web.` host, not `app.` — not seen elsewhere
  in DNS/CT; likely a legacy or internal alias, open question)
- **upgrade-insecure-requests**

**Read on the CSP posture:** it is **report-only, not enforcing** on `app.fountain.com` — the allow-list
is comprehensive (a real engineering investment) but doesn't yet block anything. `img-src`/`frame-src`
being wildcard-open (`*`) further softens the practical protection even once enforced. This is a
maturity signal: the security team is measuring before enforcing, a common safe rollout pattern, but
currently offers no CSP protection in production.

## Posture summary

| Signal | Read |
| --- | --- |
| HSTS | present + preloaded on every first-party host checked — strong |
| CSP on the core app | drafted, comprehensive, but **report-only** — not yet protective |
| Cookie flags (`__cf_bm`) | HttpOnly + Secure + SameSite=None — this is Cloudflare's own bot-management cookie, not an app session cookie (no app session cookie was observed via HEAD; a real session cookie would need an authenticated probe, out of scope here) |
| X-Frame-Options | present (`SAMEORIGIN`/`Deny`) on most first-party + vendor-hosted surfaces |
| Permissions-Policy | present on ReadMe-hosted docs surfaces only (`camera=(), microphone=(), geolocation=(), payment=()`) — not observed on `app.fountain.com` |
