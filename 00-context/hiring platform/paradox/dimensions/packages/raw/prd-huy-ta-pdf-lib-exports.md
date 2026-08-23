<!-- source: https://registry.npmjs.org/@prd-huy-ta%2Fpdf-lib + https://github.com/ParadoxAi/pdf-lib · captured_at: 2026-08-09 · method: registry-metadata + fork-diff (delta only, not the full upstream API) -->

# `@prd-huy-ta/pdf-lib` — the Paradox-added delta over upstream `pdf-lib`

This package is 99% the well-documented upstream `Hopding/pdf-lib` public API (`PDFDocument`, `PDFPage`,
`PDFForm`, `PDFFont`, `rgb`/`cmyk` color helpers, embed/draw/save methods — see upstream docs at
https://pdf-lib.js.org/ for the full inherited surface, not re-documented here since Paradox did not
author it). This file records only the **delta** — what Paradox's 21 ahead-of-upstream commits add.

## Build shape (unchanged from upstream convention)

- `main`: `cjs/index.js` · `module`: `es/index.js` · `types`: `cjs/index.d.ts` (dual CJS/ESM, no
  `exports` map — pre-`exports`-field-era package layout, same as the original library).
- License: MIT (unchanged). Dependencies unchanged (`@pdf-lib/standard-fonts`, `@pdf-lib/upng`, `pako`,
  `tslib`).

## The added surface (from commit history — `PDFSignature`)

Commit trail: `add signature feature` → `fix(OL-99979): update appearance related functions for
PDFSignature` → `bug(OL-99979): create signature in form`. This adds a **`PDFSignature`** field/widget
type to the PDF-form object model — i.e., the ability to programmatically create and render a signature
field inside a fillable PDF form, which upstream `pdf-lib` does not support natively (upstream `PDFForm`
covers text/checkbox/radio/dropdown/button fields only, not signature widgets).

## Interpretation

This is a small, targeted, production-used extension (32 published versions, 2.5 years of maintenance)
purpose-built for **e-signature capture on generated PDF forms** — squarely consistent with a hiring
platform's offer-letter / onboarding-document workflow (candidate e-signs an offer letter or I-9/W-4-style
form rendered as a PDF). No evidence this ever integrates a third-party e-signature vendor (DocuSign,
HelloSign) at the library level — the signature capability appears to be built in-house on top of the
forked pdf-lib rather than delegated.
