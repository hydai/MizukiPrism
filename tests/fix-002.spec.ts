import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('FIX-002: Song Data API Load Failure Error Display', () => {

  test('AC1-AC2: Error message shown when /api/songs returns 500', async ({ page }) => {
    // Intercept the /api/songs endpoint and return a 500 error
    await page.route('**/api/songs', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verify error container is visible with correct test id
    const errorContainer = page.locator('[data-testid="song-load-error"]');
    await expect(errorContainer).toBeVisible();

    // Verify error message text
    await expect(errorContainer).toContainText('無法載入歌曲資料，請檢查網路連線後重新整理頁面');

    await page.screenshot({ path: '.screenshots/fix-002-api-error-500.png', fullPage: true });
  });

  test('AC3: Retry button is visible when API fails', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const retryButton = page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toContainText('重新整理');
  });

  test('AC4: Retry button re-fetches data and clears error state', async ({ page }) => {
    let callCount = 0;

    // First call returns error, second call returns valid data
    await page.route('**/api/songs', async route => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({ status: 500, body: 'Internal Server Error' });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'song-1',
              title: 'Test Song',
              originalArtist: 'Test Artist',
              tags: ['J-POP'],
              performances: [
                {
                  id: 'perf-1',
                  date: '2024-01-01',
                  streamTitle: 'Test Stream',
                  videoId: 'testVideoId',
                  timestamp: 60,
                  note: '',
                },
              ],
            },
          ]),
        });
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Error state should be visible
    await expect(page.locator('[data-testid="song-load-error"]')).toBeVisible();

    // Click retry
    await page.locator('[data-testid="retry-button"]').click();
    await page.waitForLoadState('networkidle');

    // Error state should disappear
    await expect(page.locator('[data-testid="song-load-error"]')).not.toBeVisible();

    // Song data should now be displayed
    await expect(page.locator('[data-testid="performance-row"]').first()).toBeVisible();

    await page.screenshot({ path: '.screenshots/fix-002-retry-success.png', fullPage: true });
  });

  test('AC5: Error state replaces song list area only — sidebar and hero remain visible', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Sidebar still visible
    await expect(page.getByText('MizukiPlay')).toBeVisible();
    await expect(page.getByRole('button', { name: '首頁' })).toBeVisible();

    // Hero section still visible
    await expect(page.getByRole('heading', { name: 'Mizuki' })).toBeVisible();

    // Error state is visible in the content area
    await expect(page.locator('[data-testid="song-load-error"]')).toBeVisible();

    // Song table rows should NOT be present
    await expect(page.locator('[data-testid="performance-row"]')).toHaveCount(0);
  });

  test('AC6: Network error (offline) shows same error message', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.abort('failed');
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const errorContainer = page.locator('[data-testid="song-load-error"]');
    await expect(errorContainer).toBeVisible();
    await expect(errorContainer).toContainText('無法載入歌曲資料，請檢查網路連線後重新整理頁面');

    await page.screenshot({ path: '.screenshots/fix-002-network-error.png', fullPage: true });
  });

  test('AC7: Normal load shows song list without error state', async ({ page }) => {
    // No route interception — use the real API
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Error state should NOT be visible
    await expect(page.locator('[data-testid="song-load-error"]')).not.toBeVisible();

    // Song rows should be visible
    await expect(page.locator('[data-testid="performance-row"]').first()).toBeVisible();
  });

  test('AC8: Error state is distinguishable from empty catalog state', async ({ page }) => {
    await page.route('**/api/songs', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Error state visible
    const errorContainer = page.locator('[data-testid="song-load-error"]');
    await expect(errorContainer).toBeVisible();

    // The error message is distinct from an empty catalog message
    await expect(errorContainer).toContainText('無法載入歌曲資料');
    // Should NOT contain the "empty state" text (which is handled by FIX-003 separately)
    await expect(errorContainer).not.toContainText('目前尚無歌曲資料');

    // The retry button is present (unique to error state)
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

});
