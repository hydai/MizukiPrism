import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Mobile Library Tab', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Library button opens the mobile library tab', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-library').click();

    await expect(page.getByTestId('mobile-library-tab')).toBeVisible();
    await expect(page.getByTestId('mobile-liked-songs-button')).toBeVisible();
    await expect(page.getByTestId('mobile-recently-played-button')).toBeVisible();
    await expect(page.getByTestId('mobile-create-playlist-button')).toBeVisible();
  });

  test('Library actions open their panels', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-library').click();

    await page.getByTestId('mobile-liked-songs-button').click();
    await expect(page.getByTestId('liked-songs-panel-mobile')).toBeVisible();
    await page.getByTestId('liked-songs-panel-backdrop').click();

    await page.getByTestId('mobile-recently-played-button').click();
    await expect(page.getByTestId('recently-played-panel-mobile')).toBeVisible();
  });

  test('Create playlist action opens the dialog', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByTestId('bottom-nav-library').click();
    await page.getByTestId('mobile-create-playlist-button').click();

    await expect(page.getByTestId('create-playlist-dialog')).toBeVisible();
  });
});
