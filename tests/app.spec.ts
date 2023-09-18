import { test, expect, type Page, type Locator } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
});

test.describe('app', () => {
  test('Page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Interval timer/);
  });

  test('Timer saves to URL', async ({ page }) => {
    await createSimpleTimer(page);

    const url = page.url();
    console.log('foo')
  })
});

async function createSimpleTimer (page: Page) {
  await page.getByTestId('customise-timer').click();

    await page.getByTestId('countdown').fill('10');

    await page.getByTestId('sets').fill('3');

    await page.getByTestId('setsrest').fill('60');

    await page.getByTestId('rounds').fill('4');

    await page.getByTestId('interval-name').fill('Crimp');
    await page.getByTestId('interval-duration').fill('7');
    await page.locator('[data-testid="interval-color"]').evaluate(input => {
      (<HTMLInputElement>input).value = '#222'; // Cast input to HTMLInputElement for TypeScript
      var event = new Event('input', {
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(event);
    });

    await page.getByTestId('save').click();
}
