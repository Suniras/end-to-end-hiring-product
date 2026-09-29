/* ============================================================================
   e2e.spec.js  ·  the demo path, in a real browser

   THIS FILE NEEDS PLAYWRIGHT, WHICH THIS REPOSITORY DOES NOT INSTALL.
   Nothing else in the build has a dependency and that is deliberate, so this
   one is opt in. To run it:

       cd demo
       node server/index.js            # in one terminal
       npx playwright test tools/e2e.spec.js --browser=chromium

   npx downloads Playwright and a browser the first time, which is a real
   install on your machine. If you would rather not, server/test/e2e.test.js
   walks the same journey through the API with no dependencies at all, and runs
   as part of sh tools/test.sh. What that one cannot check is the part below:
   that the screens render it, that the console stays clean, and that the
   assistant panel behaves.

   The demo walked here is the one in the read-aloud script. If a scene changes,
   change this too.
   ============================================================================ */

const { test, expect } = require('@playwright/test');

const BASE = process.env.DEMO_BASE || 'http://localhost:4173';

/** Fails the test on the first console error rather than at the end. */
function watchConsole(page, errors) {
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
}

test.describe('the September demo path', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('every screen renders from live data with a clean console', async ({ page }) => {
    const errors = [];
    watchConsole(page, errors);

    const routes = ['deck', 'decide', 'screening', 'pipeline', 'candidate', 'funnel',
                    'flag', 'compliance', 'checks', 'sources', 'store'];

    await page.goto(BASE + '/app.html#/deck');
    await expect(page.locator('.topbar-title h1')).toBeVisible();

    for (const route of routes) {
      await page.evaluate((r) => { window.location.hash = '#/' + r; }, route);
      await page.waitForFunction(() => !document.querySelector('#view .load'), null, { timeout: 8000 });

      // Exactly one h1 on the page, and it is the topbar title.
      await expect(page.locator('.topbar-title h1')).toHaveCount(1);
      // The view rendered something rather than an error card.
      await expect(page.locator('#view pre.mono')).toHaveCount(0);
      await expect(page.locator('#view').locator('.card, .empty, .stats').first()).toBeVisible();
    }

    expect(errors, 'console errors: ' + errors.join(' | ')).toEqual([]);
  });

  test('a candidate goes application to first shift, and the timeline holds it', async ({ page, request }) => {
    const errors = [];
    watchConsole(page, errors);

    // Reseed so the walk starts from a known state, exactly as pressing R does.
    await request.post(BASE + '/api/reset');

    // Somebody sitting in the screening queue.
    const found = await request.post(BASE + '/api/agent/tool', {
      data: { tool: 'search_candidates', args: { state: 'SCREENING_PENDING' } }
    });
    const who = (await found.json()).data.candidates[0];

    await page.goto(BASE + '/app.html#/screening');
    await page.waitForFunction(() => !document.querySelector('#view .load'));

    // Run the screening from the interface, not the API.
    const runBtn = page.locator('.qitem', { hasText: who.name }).getByRole('button', { name: /Run the screening/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();
    await expect(page.locator('.toast')).toContainText(/Screened|Recommendation/i, { timeout: 15000 });

    // The decision is a person's, and the interface says so before it happens.
    await page.evaluate(() => { window.location.hash = '#/decide'; });
    await page.waitForFunction(() => !document.querySelector('#view .load'));
    const row = page.locator('.qitem', { hasText: who.name });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Approve' }).click();
    await expect(page.locator('.sheet')).toContainText(/recorded against/i);
    await page.locator('.sheet').getByRole('button', { name: /record it against me/i }).click();
    await expect(page.locator('.toast')).toContainText(/approved/i, { timeout: 10000 });

    // Offer, acceptance, check, and the clock doing the rest for real reasons.
    for (const state of ['OFFER_SENT', 'OFFER_ACCEPTED', 'BACKGROUND_CHECK_IN_PROGRESS']) {
      await request.post(BASE + '/api/applications/' + who.applicationId + '/transition', { data: { state } });
    }
    await request.post(BASE + '/api/sim/advance', { data: { hours: 24 * 10 } });

    // The one task a person owns, which the ticker will never do for them.
    const cand = await (await request.get(BASE + '/api/view/candidate?applicationId=' + who.applicationId)).json();
    const badge = cand.data.tasks.find((t) => t.key === 'badge');
    expect(badge.owner).toBe('human');
    expect(badge.status).not.toBe('done');
    await request.post(BASE + '/api/applications/' + who.applicationId + '/task', { data: { taskId: badge.id } });

    for (const state of ['FIRST_SHIFT_SCHEDULED', 'STARTED']) {
      await request.post(BASE + '/api/applications/' + who.applicationId + '/transition', { data: { state } });
    }

    // Open the same candidate and read the journey off the screen.
    await page.evaluate((id) => { window.E.ui.focusApplication = id; window.location.hash = '#/candidate'; },
      who.applicationId);
    await page.waitForFunction(() => !document.querySelector('#view .load'));
    await expect(page.locator('#view')).toContainText(who.name);
    await expect(page.locator('.tl-item')).toHaveCount(20);
    await expect(page.locator('.tl-item.is-done').first()).toBeVisible();
    await expect(page.locator('#view')).toContainText(/All twenty steps/i);

    expect(errors, 'console errors: ' + errors.join(' | ')).toEqual([]);
  });

  test('the assistant answers from live data and asks before it acts', async ({ page }) => {
    const errors = [];
    watchConsole(page, errors);

    await page.goto(BASE + '/app.html#/deck');
    await page.waitForFunction(() => !document.querySelector('#view .load'));
    await page.locator('.ch-fab').click();
    await expect(page.locator('.ch-panel')).toBeVisible();

    const ask = async (text) => {
      await page.locator('.ch-input').fill(text);
      await page.locator('.ch-input').press('Enter');
      await page.waitForFunction(() => !document.body.textContent.includes('Looking'), null, { timeout: 15000 });
    };

    await ask('who needs my attention today');
    await expect(page.locator('.ch-log')).toContainText(/waiting on a person/i);

    await ask('why is trevor blocked');
    await expect(page.locator('.ch-log')).toContainText(/not eligible for rehire/i);

    // A hiring decision stops and asks, and says whose name it goes on.
    const target = await page.evaluate(async () => {
      const r = await fetch('/api/view/decide').then((x) => x.json());
      return r.data.candidates[0].name;
    });
    await ask('approve ' + target);
    await expect(page.locator('.ch-log')).toContainText(/hiring decision/i);
    await expect(page.locator('.ch-log')).toContainText(/records .* as the person who made it/i);

    await page.getByRole('button', { name: /record it against me/i }).last().click();
    await expect(page.locator('.ch-log')).toContainText(/approved/i, { timeout: 10000 });
    await expect(page.locator('.ch-log')).toContainText(/on the audit trail/i);

    // And the law outranks the person asking.
    await ask('take kayla brennan-ross off the rota');
    await expect(page.locator('.ch-log')).toContainText(/will be refused|adverse action/i);
    await page.getByRole('button', { name: /Yes, do it/i }).last().click();
    await expect(page.locator('.ch-log')).toContainText(/Final Nonconfirmation/i, { timeout: 10000 });

    expect(errors, 'console errors: ' + errors.join(' | ')).toEqual([]);
  });

  test('a refresh does not lose the workflow', async ({ page }) => {
    await page.goto(BASE + '/app.html#/decide');
    await page.waitForFunction(() => !document.querySelector('#view .load'));
    const before = await page.locator('.qitem').count();

    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#view .load'));
    const after = await page.locator('.qitem').count();

    expect(after).toBe(before);
  });
});
