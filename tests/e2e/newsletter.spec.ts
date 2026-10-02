import { test, expect, type Page } from '@playwright/test';

// Forged client IP per test so the 5-per-10-minutes limit never bleeds between tests.
let n = 0;
const ip = () => `172.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${(++n % 250) + 1}`;

const SUCCESS = /thank you for subscribing/i;
const STATUS = 'footer [role="status"]';

const form = (page: Page) => page.locator('footer form');
const emailInput = (page: Page) => form(page).getByLabel(/e-?mail/i).first();
const submit = (page: Page) => form(page).getByRole('button').first();

async function sub(page: Page, email: string) {
  await emailInput(page).fill(email);
  await submit(page).click();
}

test.describe('Footer newsletter (S7)', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.setExtraHTTPHeaders({ 'x-forwarded-for': ip() });
    await page.goto('/en');
  });

  test('S7: the footer has one newsletter form with a labelled email field and a submit button', async ({ page }) => {
    await expect(form(page)).toHaveCount(1);
    await expect(emailInput(page)).toBeVisible();
    await expect(submit(page)).toBeVisible();
  });

  test('S7: a valid email replaces the form with a success message that receives focus', async ({ page }) => {
    await sub(page, 'reader@example.com');
    const ok = page.locator('footer').getByText(SUCCESS).first();
    await expect(ok).toBeVisible();
    await expect(page.locator('footer form input[type="email"]')).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const a = document.activeElement;
          const f = document.querySelector('footer');
          return !!a && !!f && f.contains(a) && /thank you for subscribing/i.test(a.textContent ?? '');
        }),
      )
      .toBe(true);
  });

  test('S7: an invalid email shows an alert, marks the field aria-invalid and shows no success', async ({ page }) => {
    await sub(page, 'not-an-email');
    await expect(page.locator('footer').getByRole('alert').first()).toBeVisible();
    await expect(emailInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(STATUS).getByText(SUCCESS)).toHaveCount(0);
  });

  test('S7: an empty submit is an error, not a success', async ({ page }) => {
    await submit(page).click();
    await expect(emailInput(page)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(STATUS).getByText(SUCCESS)).toHaveCount(0);
  });

  test('S7: the honeypot is filled by a bot: it looks like success', async ({ page }) => {
    await emailInput(page).fill('bot@example.com');
    await form(page).locator('[name="website"]').evaluate((el) => {
      (el as HTMLInputElement).value = 'http://spam.example';
    });
    await submit(page).click();
    await expect(page.locator('footer').getByText(SUCCESS).first()).toBeVisible();
    await expect(page.locator('footer [aria-invalid="true"]')).toHaveCount(0);
  });

  test('S7: the same email twice (different case) shows success both times', async ({ page }) => {
    await sub(page, 'Twice@Example.com');
    await expect(page.locator('footer').getByText(SUCCESS).first()).toBeVisible();
    await page.goto('/en');
    await sub(page, 'twice@example.COM');
    await expect(page.locator('footer').getByText(SUCCESS).first()).toBeVisible();
    await expect(page.locator('footer').getByRole('alert')).toHaveCount(0);
  });

  test('S7: the 6th sign-up from one IP is rejected with a friendly message, not success', async ({ page }) => {
    test.setTimeout(90_000);
    for (let i = 1; i <= 5; i++) {
      await page.goto('/en');
      await sub(page, `limit${i}-${Date.now()}@example.com`);
      await expect(page.locator('footer').getByText(SUCCESS).first(), `sign-up ${i}`).toBeVisible();
    }
    await page.goto('/en');
    await sub(page, `limit6-${Date.now()}@example.com`);
    await expect(page.locator('footer').getByText(/too many|try again|later|slow down/i).first()).toBeVisible();
    await expect(page.locator(STATUS).getByText(SUCCESS)).toHaveCount(0);
  });

  test('S7: the newsletter limit is separate from the quote form limit', async ({ page }) => {
    test.setTimeout(120_000);
    for (let i = 1; i <= 5; i++) {
      await page.goto('/en');
      await sub(page, `sep${i}-${Date.now()}@example.com`);
      await expect(page.locator('footer').getByText(SUCCESS).first()).toBeVisible();
    }
    await page.goto('/en');
    const q = page.locator('#quote');
    await q.getByLabel(/first name/i).first().fill('An');
    await q.getByLabel(/last name/i).first().fill('Nguyen');
    await q.getByLabel(/email/i).first().fill('an@example.com');
    await q.getByLabel(/phone/i).first().fill('0901234567');
    await page.getByRole('button', { name: /request a quote/i }).click();
    await expect(q.getByText(/thank|success|received|submitted|we have your/i).first()).toBeVisible();
    await expect(q.getByText(/too many|slow down/i)).toHaveCount(0);
  });
});
