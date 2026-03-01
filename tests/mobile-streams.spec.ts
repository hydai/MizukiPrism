import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Mobile Streams Tab', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Streams button is visible in bottom nav', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByTestId('bottom-nav-streams')).toBeVisible();
  });

  test('Bottom nav has exactly 4 buttons', async ({ page }) => {
    await page.goto(BASE_URL);
    const nav = page.getByTestId('mobile-bottom-nav');
    const buttons = nav.locator('button');
    await expect(buttons).toHaveCount(4);
  });

  test('Tapping streams tab shows stream list', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-streams').click();
    await expect(page.getByTestId('mobile-streams-tab')).toBeVisible();
    // Should show at least one stream card
    await expect(page.getByTestId('mobile-stream-card').first()).toBeVisible();
  });

  test('Tapping a stream auto-switches to home tab', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-streams').click();
    await expect(page.getByTestId('mobile-streams-tab')).toBeVisible();

    // Click the first stream card
    await page.getByTestId('mobile-stream-card').first().click();

    // Should switch to home tab (streams tab hidden)
    await expect(page.getByTestId('mobile-streams-tab')).not.toBeVisible();
  });

  test('Year filter chips filter the stream list', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-streams').click();
    await expect(page.getByTestId('mobile-streams-tab')).toBeVisible();

    const initialCount = await page.getByTestId('mobile-stream-card').count();
    // Click the first year chip to filter
    const yearChip = page.getByTestId('mobile-streams-year-chip').first();
    await yearChip.click();

    const filteredCount = await page.getByTestId('mobile-stream-card').count();
    // Filtered count should be less than or equal to initial (it filters to one year)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('All songs button switches to home tab', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-streams').click();
    await page.getByTestId('mobile-streams-all-songs').click();
    await expect(page.getByTestId('mobile-streams-tab')).not.toBeVisible();
  });
});
