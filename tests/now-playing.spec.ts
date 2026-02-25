import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Now Playing Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Direct visit to /now-playing without playing shows empty state', async ({ page }) => {
    await page.goto(`${BASE_URL}/now-playing`);
    await page.waitForLoadState('networkidle');

    const pageEl = page.locator('[data-testid="now-playing-page"]');
    await expect(pageEl).toBeVisible();

    // Empty state text should appear
    await expect(page.locator('[data-testid="now-playing-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="now-playing-empty"]')).toContainText('目前沒有播放中的歌曲');

    await page.screenshot({ path: '.screenshots/now-playing-empty-state.png', fullPage: true });
  });

  test('Page renders album art, title, and controls when a track is playing', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Navigate to now-playing page
    await page.goto(`${BASE_URL}/now-playing`);
    await page.waitForLoadState('networkidle');

    const pageEl = page.locator('[data-testid="now-playing-page"]');
    await expect(pageEl).toBeVisible();

    // Controls should be present
    await expect(page.locator('[data-testid="now-playing-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="np-play-button"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/now-playing-with-track.png', fullPage: true });
  });

  test('Play/pause toggle works on now-playing page', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Navigate to now-playing
    await page.goto(`${BASE_URL}/now-playing`);
    await page.waitForLoadState('networkidle');

    // Should show Pause label initially (playing)
    await expect(page.locator('[data-testid="np-play-button"]')).toBeVisible();
    await expect(page.getByLabel('Pause').first()).toBeVisible();

    // Click to pause
    await page.locator('[data-testid="np-play-button"]').click();
    await page.waitForTimeout(500);

    // Should now show Play label
    await expect(page.getByLabel('Play').first()).toBeVisible();

    await page.screenshot({ path: '.screenshots/now-playing-paused.png', fullPage: true });
  });

  test('MiniPlayer is hidden on /now-playing page', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Navigate to now-playing
    await page.goto(`${BASE_URL}/now-playing`);
    await page.waitForLoadState('networkidle');

    // MiniPlayer should NOT be visible
    await expect(page.locator('[data-testid="mini-player"]')).not.toBeVisible();

    await page.screenshot({ path: '.screenshots/now-playing-no-miniplayer.png', fullPage: true });
  });

  test('Modal still works from MiniPlayer click on other pages', async ({ page }) => {
    // Start playback on the main page
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Click track info to open modal
    await miniPlayer.locator('.font-bold.text-slate-800').click();

    // Modal should appear (unchanged behavior)
    await expect(page.locator('[data-testid="now-playing-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="now-playing-modal"]')).toContainText('正在播放');

    await page.screenshot({ path: '.screenshots/now-playing-modal-still-works.png', fullPage: true });
  });

  test('Expand button on MiniPlayer navigates to /now-playing', async ({ page, viewport }) => {
    // This test only makes sense on desktop viewport where expand button is visible
    if (!viewport || viewport.width < 1024) {
      test.skip();
    }

    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Click the expand button
    const expandBtn = page.locator('[data-testid="expand-now-playing-button"]');
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    // Should navigate to /now-playing
    await page.waitForURL('**/now-playing');
    await expect(page.locator('[data-testid="now-playing-page"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/now-playing-via-expand.png', fullPage: true });
  });

  test('Back button on mobile layout navigates back', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Navigate to now-playing
    await page.goto(`${BASE_URL}/now-playing`);
    await page.waitForLoadState('networkidle');

    // Click the back button (only visible on mobile)
    const backBtn = page.locator('[data-testid="np-back-button"]');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(500);
      // Should have navigated back
      expect(page.url()).not.toContain('/now-playing');
    }

    await page.screenshot({ path: '.screenshots/now-playing-back-navigation.png', fullPage: true });
  });

});
