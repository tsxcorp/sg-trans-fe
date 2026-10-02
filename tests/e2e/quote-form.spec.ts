import { test, expect, type Page } from '@playwright/test';

// Each test uses its own forged client IP so the 5-per-10-minutes limit never bleeds between tests.
// (Assumes the server derives the IP from x-forwarded-for; see report.)
let n = 0;
const ip = () => `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${(++n % 250) + 1}`;

const L = {
  first: /first name/i,
  last: /last name/i,
  company: /comp(an|na)y/i, // matches "Company" and the design spelling "Compnay"
  email: /email/i,
  phone: /phone/i,
  country: /country/i,
  job: /job title/i,
};

const valid = {
  first: 'An', last: 'Nguyen', company: 'Acme Co', email: 'an@example.com',
  phone: '0901234567', country: 'Vietnam', job: 'Buyer',
};

// Scope every field locator to the quote card so footer/nav elements (e.g. nav aria-label="Company") never match.
const form = (page: Page) => page.locator('#quote');

async function open(page: Page) {
  await page.goto('/en');
  return page.getByRole('button', { name: /request a quote/i });
}

async function setField(page: Page, label: RegExp, value: string) {
  const f = form(page).getByLabel(label).first();
  const tag = await f.evaluate((e) => e.tagName.toLowerCase());
  if (tag === 'select') await f.selectOption({ index: 1 });
  else await f.fill(value);
}

async function fillAll(page: Page, over: Partial<typeof valid> = {}) {
  const v = { ...valid, ...over };
  await setField(page, L.first, v.first);
  await setField(page, L.last, v.last);
  await setField(page, L.company, v.company);
  await setField(page, L.email, v.email);
  await setField(page, L.phone, v.phone);
  await setField(page, L.country, v.country);
  await setField(page, L.job, v.job);
}

const SUCCESS = /thank|success|received|submitted|we have your/i;
const DEADLINE = /within \d+|hours?|business days?/i;

test.describe('Quote form (S3)', () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({ 'x-forwarded-for': ip() });
  });

  test('S3: design fields are present, labelled; there is no message input', async ({ page }) => {
    await open(page);
    for (const l of Object.values(L)) await expect(form(page).getByLabel(l).first()).toBeVisible();
    await expect(page.locator('form textarea')).toHaveCount(0);
    await expect(form(page).getByLabel(/message/i)).toHaveCount(0);
  });

  // The footer newsletter form (S7) has its own honeypot named `website`, so each form is checked in its own scope.
  for (const [name, scope] of [['quote card', '#quote'], ['footer newsletter form', 'footer']] as const) {
    test(`S3/S7: honeypot \`website\` in the ${name} is in the DOM, visually hidden, and not tabbable`, async ({ page }) => {
      await open(page);
      const hp = page.locator(scope).locator('[name="website"]');
      await expect(hp).toHaveCount(1);
      const hidden = await hp.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const wrap = el.closest('[aria-hidden="true"]') !== null;
        return (
          cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0 ||
          r.width <= 1 || r.height <= 1 || r.right <= 0 || r.left < -500 || r.bottom <= 0 || r.top < -500 || wrap
        );
      });
      expect(hidden).toBe(true);
      const tabindex = await hp.getAttribute('tabindex');
      expect(tabindex).toBe('-1');
    });
  }

  test('S3: valid data shows a success state', async ({ page }) => {
    const submit = await open(page);
    await fillAll(page);
    await submit.click();
    const ok = page.getByText(SUCCESS).first();
    await expect(ok).toBeVisible();
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  });

  test('S3: success text promises no response deadline', async ({ page }) => {
    const submit = await open(page);
    await fillAll(page);
    await submit.click();
    const ok = page.getByText(SUCCESS).first();
    await expect(ok).toBeVisible();
    const region = await ok.evaluate((el) => (el.closest('[role="status"], [role="alert"], section, form, div') ?? el).textContent ?? '');
    const own = (await ok.textContent()) ?? '';
    expect(own).not.toMatch(DEADLINE);
    // the confirmation container must not contain a deadline either
    expect(region.replace(/request a quote/gi, '')).not.toMatch(/within \d+|business days?/i);
  });

  test('S3: empty submit shows per-field errors for every required field (not the optional ones) and no success', async ({ page }) => {
    const submit = await open(page);
    await submit.click();
    for (const l of [L.first, L.last, L.email, L.phone]) {
      await expect(form(page).getByLabel(l).first()).toHaveAttribute('aria-invalid', 'true');
    }
    for (const l of [L.company, L.country, L.job]) {
      await expect(form(page).getByLabel(l).first()).not.toHaveAttribute('aria-invalid', 'true');
    }
    await expect(page.getByText(SUCCESS)).toHaveCount(0);
  });

  test('S3: invalid email shows an error on the email field only and no success', async ({ page }) => {
    const submit = await open(page);
    await fillAll(page, { email: 'not-an-email' });
    await submit.click();
    await expect(form(page).getByLabel(L.email).first()).toHaveAttribute('aria-invalid', 'true');
    await expect(form(page).getByLabel(L.first).first()).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText(SUCCESS)).toHaveCount(0);
  });

  test('S3: optional company, country and job title may be left empty', async ({ page }) => {
    const submit = await open(page);
    await setField(page, L.first, valid.first);
    await setField(page, L.last, valid.last);
    await setField(page, L.email, valid.email);
    await setField(page, L.phone, valid.phone);
      await submit.click();
    await expect(page.getByText(SUCCESS).first()).toBeVisible();
  });

  test('S3: 6th submission from one IP within 10 minutes shows a friendly rejection, not success', async ({ page }) => {
    test.setTimeout(90_000);
    for (let i = 1; i <= 5; i++) {
      const submit = await open(page);
      await fillAll(page);
      await submit.click();
      await expect(page.getByText(SUCCESS).first(), `submission ${i}`).toBeVisible();
    }
    const submit = await open(page);
    await fillAll(page);
    await submit.click();
    await expect(page.getByText(SUCCESS)).toHaveCount(0);
    await expect(page.getByText(/too many|try again|later|slow down/i).first()).toBeVisible();
  });
});
