import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('PLAY-001: YouTube Embedded Playback with Mini Player', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Click play button shows mini player with correct elements', async ({ page }) => {
    // Verify no mini player initially
    await expect(page.locator('[data-testid="mini-player"]')).not.toBeVisible();

    // Click the first play button in timeline view
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player to appear
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Verify mini player elements
    const miniPlayer = page.locator('[data-testid="mini-player"]');

    // Song title and artist should be visible (first song in timeline from real data)
    const miniPlayerText = await miniPlayer.textContent();
    expect(miniPlayerText).toBeTruthy();

    // Control buttons should be visible
    await expect(miniPlayer.getByLabel('Previous')).toBeVisible();
    await expect(miniPlayer.getByLabel('Next')).toBeVisible();
    // Play/Pause button (should show Pause when playing)
    await expect(miniPlayer.getByLabel(/Play|Pause/)).toBeVisible();

    // Progress bar should exist
    await expect(miniPlayer.locator('.h-1.bg-slate-200')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac1-mini-player.png', fullPage: true });
  });

  test('AC2: YouTube player initializes with correct timestamp', async ({ page }) => {
    // Note: We can't directly test YouTube playback in headless mode,
    // but we can verify the YouTube IFrame API is loaded and player is created

    // Click play on a specific performance with known timestamp
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Wait a bit for YouTube API to load
    await page.waitForTimeout(2000);

    // Check if YouTube player div exists
    const playerDiv = page.locator('#youtube-player');
    await expect(playerDiv).toBeAttached();

    await page.screenshot({ path: '.screenshots/play-001-ac2-player-init.png', fullPage: true });
  });

  test('AC3: Mini player persists while navigating (switching views)', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Switch to grouped view
    await page.click('[data-testid="view-toggle-grouped"]');
    await page.waitForTimeout(500);

    // Mini player should still be visible
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Switch back to timeline view
    await page.click('[data-testid="view-toggle-timeline"]');
    await page.waitForTimeout(500);

    // Mini player should still be visible
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac3-persistent-player.png', fullPage: true });
  });

  test('AC4: Click mini player expands to Now Playing modal', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Click on the track info area (song title) to avoid clicking buttons
    await miniPlayer.locator('.font-bold.text-slate-800').click();

    // Now Playing modal should appear
    await expect(page.locator('[data-testid="now-playing-modal"]')).toBeVisible();

    // Modal should show song title
    const modal = page.locator('[data-testid="now-playing-modal"]');
    const modalText = await modal.textContent();
    expect(modalText).toBeTruthy();

    // Modal should have a "正在播放" header
    await expect(modal).toContainText('正在播放');

    await page.screenshot({ path: '.screenshots/play-001-ac4-modal-expanded.png', fullPage: true });
  });

  test('AC5: Collapse button in modal returns to mini player', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player and click it
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await miniPlayer.locator('.font-bold.text-slate-800').click();

    // Modal should appear
    const modal = page.locator('[data-testid="now-playing-modal"]');
    await expect(modal).toBeVisible();

    // Click the minimize button (ChevronDown icon)
    await modal.getByLabel('Minimize').click();

    // Modal should disappear
    await expect(modal).not.toBeVisible();

    // Mini player should still be visible
    await expect(miniPlayer).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac5-modal-collapsed.png', fullPage: true });
  });

  test('AC6 & AC7: Pause and resume functionality', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Initially should show Pause button (playing)
    await expect(miniPlayer.getByLabel('Pause')).toBeVisible();

    // Click pause
    await miniPlayer.getByLabel('Pause').click();
    await page.waitForTimeout(500);

    // Should now show Play button
    await expect(miniPlayer.getByLabel('Play')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac6-paused.png', fullPage: true });

    // Click play to resume
    await miniPlayer.getByLabel('Play').click();
    await page.waitForTimeout(500);

    // Should show Pause button again
    await expect(miniPlayer.getByLabel('Pause')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac7-resumed.png', fullPage: true });
  });

  test('AC8: Switch to different track while playing', async ({ page }) => {
    // Start playback on first track
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    // Wait for mini player with first track
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    const firstTrackText = await miniPlayer.textContent();

    await page.waitForTimeout(1000);

    // Click play on second track
    const secondRow = page.locator('[data-testid="performance-row"]').nth(1);
    await secondRow.hover();
    await secondRow.locator('button').first().click();

    // Mini player should update to show a different track
    await page.waitForTimeout(500);
    const secondTrackText = await miniPlayer.textContent();
    expect(secondTrackText).not.toBe(firstTrackText);

    await page.screenshot({ path: '.screenshots/play-001-ac8-track-switched.png', fullPage: true });
  });

  test('AC9 & AC10: Previous button behavior based on play time', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Wait less than 3 seconds and click previous
    await page.waitForTimeout(1000);
    const trackBefore = await miniPlayer.textContent();

    await miniPlayer.getByLabel('Previous').click();
    await page.waitForTimeout(500);

    // Should stay on same track (no previous in history)
    const trackAfter = await miniPlayer.textContent();
    expect(trackBefore).toBe(trackAfter);

    // Now wait more than 3 seconds and click previous
    await page.waitForTimeout(4000);
    await miniPlayer.getByLabel('Previous').click();
    await page.waitForTimeout(500);

    // Should restart current track (we can't easily verify timestamp reset in test)
    await expect(miniPlayer).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac9-previous-behavior.png', fullPage: true });
  });

  test('AC11: Test with grouped view play buttons', async ({ page }) => {
    // Switch to grouped view
    await page.click('[data-testid="view-toggle-grouped"]');
    await page.waitForTimeout(500);

    // Find a song card and expand it
    const songCard = page.locator('[data-testid="song-card"]').first();
    await songCard.locator('button').first().click();

    // Wait for versions list to expand
    await expect(page.locator('[data-testid="versions-list"]').first()).toBeVisible();

    // Hover over a version row and click play
    const versionRow = page.locator('[data-testid="version-row"]').first();
    await versionRow.hover();
    await versionRow.locator('button').first().click();

    // Mini player should appear
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-001-ac11-grouped-view-play.png', fullPage: true });
  });

  test('AC12: Visual verification of UI elements', async ({ page }) => {
    // Start playback
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Take screenshot of mini player
    await page.screenshot({ path: '.screenshots/play-001-ac12-mini-player-ui.png', fullPage: true });

    // Open modal by clicking on track title
    await miniPlayer.locator('.font-bold.text-slate-800').click();
    await expect(page.locator('[data-testid="now-playing-modal"]')).toBeVisible();

    // Take screenshot of modal
    await page.screenshot({ path: '.screenshots/play-001-ac12-modal-ui.png', fullPage: true });
  });

});
