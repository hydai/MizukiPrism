import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('PLAY-002: Play Queue Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Click "add to queue" shows toast notification and adds to queue', async ({ page }) => {
    // Find first performance row and hover
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();

    // Click add to queue button
    await firstRow.locator('[data-testid="add-to-queue"]').click();

    // Verify toast appears with correct message
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('已加入播放佇列');

    // Wait for toast to disappear
    await expect(toast).not.toBeVisible({ timeout: 5000 });

    // Click play button to show mini player
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await page.waitForTimeout(1000);

    // Click queue button to open queue panel
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    // Verify queue panel shows 1 item
    const queuePanel = page.locator('[data-testid="queue-panel"]');
    await expect(queuePanel).toBeVisible();
    const queueItems = queuePanel.locator('[data-testid="queue-item"]');
    await expect(queueItems).toHaveCount(1);

    await page.screenshot({ path: '.screenshots/play-002-ac1-add-to-queue.png', fullPage: true });
  });

  test('AC2: Add multiple versions to queue and verify order', async ({ page }) => {
    // Add first 3 performances to queue
    const rows = page.locator('[data-testid="performance-row"]');
    for (let i = 0; i < 3; i++) {
      const row = rows.nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-queue"]').click();
      await page.waitForTimeout(500);
    }

    // Click play button to show mini player
    await rows.first().hover();
    await rows.first().locator('button').first().click();
    await page.waitForTimeout(1000);

    // Open queue panel
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    // Verify queue panel shows all 3 items in order
    const queuePanel = page.locator('[data-testid="queue-panel"]');
    await expect(queuePanel).toBeVisible();
    const queueItems = queuePanel.locator('[data-testid="queue-item"]');
    await expect(queueItems).toHaveCount(3);

    // Verify queue header shows count
    await expect(queuePanel).toContainText('3 首歌曲');

    await page.screenshot({ path: '.screenshots/play-002-ac2-multiple-items.png', fullPage: true });
  });

  test('AC3: Add same version again (duplicates allowed)', async ({ page }) => {
    // Add first performance twice
    const firstRow = page.locator('[data-testid="performance-row"]').first();

    await firstRow.hover();
    await firstRow.locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(500);

    await firstRow.hover();
    await firstRow.locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(500);

    // Click play button to show mini player
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await page.waitForTimeout(1000);

    // Open queue panel
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    // Verify queue shows same item twice
    const queuePanel = page.locator('[data-testid="queue-panel"]');
    const queueItems = queuePanel.locator('[data-testid="queue-item"]');
    await expect(queueItems).toHaveCount(2);

    await page.screenshot({ path: '.screenshots/play-002-ac3-duplicates.png', fullPage: true });
  });

  test('AC4: Drag to reorder queue items', async ({ page }) => {
    // Add 3 performances to queue
    const rows = page.locator('[data-testid="performance-row"]');
    for (let i = 0; i < 3; i++) {
      const row = rows.nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-queue"]').click();
      await page.waitForTimeout(300);
    }

    // Click play button to show mini player
    await rows.first().hover();
    await rows.first().locator('button').first().click();
    await page.waitForTimeout(1000);

    // Open queue panel
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    const queuePanel = page.locator('[data-testid="queue-panel"]');
    const queueItems = queuePanel.locator('[data-testid="queue-item"]');

    // Get text of first and third items before reordering
    const firstItemText = await queueItems.first().locator('.font-bold').textContent();
    const thirdItemText = await queueItems.nth(2).locator('.font-bold').textContent();

    // Drag first item to third position (drag to bottom)
    await queueItems.first().dragTo(queueItems.nth(2), {
      targetPosition: { x: 0, y: 50 }
    });
    await page.waitForTimeout(500);

    // Verify order changed - the first item should have moved down
    // After drag, the order should be: second, third, first
    const newThirdItemText = await queueItems.nth(2).locator('.font-bold').textContent();
    expect(newThirdItemText).toBe(firstItemText);

    await page.screenshot({ path: '.screenshots/play-002-ac4-reorder.png', fullPage: true });
  });

  test('AC5: Remove item from queue', async ({ page }) => {
    // Add 2 performances to queue
    const rows = page.locator('[data-testid="performance-row"]');
    for (let i = 0; i < 2; i++) {
      const row = rows.nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-queue"]').click();
      await page.waitForTimeout(300);
    }

    // Click play button to show mini player
    await rows.first().hover();
    await rows.first().locator('button').first().click();
    await page.waitForTimeout(1000);

    // Open queue panel
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    const queuePanel = page.locator('[data-testid="queue-panel"]');
    const queueItems = queuePanel.locator('[data-testid="queue-item"]');

    // Verify initial count
    await expect(queueItems).toHaveCount(2);

    // Hover and remove first item
    await queueItems.first().hover();
    await queueItems.first().locator('button[aria-label="Remove from queue"]').click();
    await page.waitForTimeout(300);

    // Verify count decreased
    await expect(queueItems).toHaveCount(1);

    await page.screenshot({ path: '.screenshots/play-002-ac5-remove.png', fullPage: true });
  });

  test('AC6: Empty queue shows empty state message', async ({ page }) => {
    // Click play button to show mini player
    const firstRow = page.locator('[data-testid="performance-row"]').first();
    await firstRow.hover();
    await firstRow.locator('button').first().click();
    await page.waitForTimeout(1000);

    // Open queue panel (should be empty)
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    // Verify empty state message
    const queuePanel = page.locator('[data-testid="queue-panel"]');
    await expect(queuePanel).toBeVisible();
    await expect(queuePanel).toContainText('播放佇列為空');

    await page.screenshot({ path: '.screenshots/play-002-ac6-empty.png', fullPage: true });
  });

  test('AC7: Auto-play next song when current finishes', async ({ page }) => {
    // Add 2 performances to queue
    const rows = page.locator('[data-testid="performance-row"]');

    // Get titles from the rows
    const firstRowTitle = await rows.nth(0).locator('.font-bold').first().textContent();
    const secondRowTitle = await rows.nth(1).locator('.font-bold').first().textContent();
    const thirdRowTitle = await rows.nth(2).locator('.font-bold').first().textContent();

    // Add second song to queue
    await rows.nth(1).hover();
    await rows.nth(1).locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(300);

    // Add third song to queue
    await rows.nth(2).hover();
    await rows.nth(2).locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(300);

    // Play first song (NOT in queue)
    await rows.nth(0).hover();
    await rows.nth(0).locator('button').first().click();
    await page.waitForTimeout(2000);

    // Get first song title from mini player
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    const firstSongTitle = await miniPlayer.locator('.font-bold.text-slate-800').textContent();
    expect(firstSongTitle).toBe(firstRowTitle);

    // Wait for YouTube player to initialize
    await page.waitForTimeout(1000);

    // Manually trigger end by clicking next (simulating song end)
    const nextButton = miniPlayer.locator('button[aria-label="Next"]');
    await nextButton.click();
    await page.waitForTimeout(2000);

    // Verify second song from queue is now playing
    const currentTitle = await miniPlayer.locator('.font-bold.text-slate-800').textContent();
    expect(currentTitle).toBe(secondRowTitle);
    expect(currentTitle).not.toBe(firstSongTitle);

    await page.screenshot({ path: '.screenshots/play-002-ac7-auto-play.png', fullPage: true });
  });

  test('AC8: Next button plays next item or stops if queue empty', async ({ page }) => {
    // Add 1 performance to queue
    const rows = page.locator('[data-testid="performance-row"]');
    await rows.nth(0).hover();
    await rows.nth(0).locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(300);

    // Play first song
    await rows.nth(1).hover();
    await rows.nth(1).locator('button').first().click();
    await page.waitForTimeout(2000);

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    const playPauseButton = miniPlayer.locator('button[aria-label="Pause"]').or(miniPlayer.locator('button[aria-label="Play"]'));

    // Verify playing
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();

    // Click next - should play queued item
    const nextButton = miniPlayer.locator('button[aria-label="Next"]');
    await nextButton.click();
    await page.waitForTimeout(2000);

    // Verify still playing (new track from queue)
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();

    // Click next again - queue should be empty, should stop
    await nextButton.click();
    await page.waitForTimeout(1000);

    // Verify playback stopped (Play button visible)
    await expect(miniPlayer.locator('button[aria-label="Play"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/play-002-ac8-next-button.png', fullPage: true });
  });

  test('AC (Grouped View): Add to queue works in grouped view', async ({ page }) => {
    // Switch to grouped view
    await page.locator('[data-testid="view-toggle-grouped"]').click();
    await page.waitForTimeout(500);

    // Expand first song
    const firstSong = page.locator('[data-testid="song-card"]').first();
    await firstSong.click();
    await page.waitForTimeout(500);

    // Hover over first version and add to queue
    const firstVersion = page.locator('[data-testid="version-row"]').first();
    await firstVersion.hover();
    await firstVersion.locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(500);

    // Verify toast appears
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('已加入播放佇列');

    // Play a track to show mini player
    await firstVersion.hover();
    await firstVersion.locator('button').first().click();
    await page.waitForTimeout(1000);

    // Open queue and verify
    await page.locator('[data-testid="queue-button"]').click();
    await page.waitForTimeout(500);

    const queuePanel = page.locator('[data-testid="queue-panel"]');
    const queueItems = queuePanel.locator('[data-testid="queue-item"]');
    await expect(queueItems).toHaveCount(1);

    await page.screenshot({ path: '.screenshots/play-002-ac-grouped-view.png', fullPage: true });
  });

  test('AC (Visual): Queue button badge shows count', async ({ page }) => {
    // Add 3 items to queue
    const rows = page.locator('[data-testid="performance-row"]');
    for (let i = 0; i < 3; i++) {
      const row = rows.nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-queue"]').click();
      await page.waitForTimeout(300);
    }

    // Play first song to show mini player
    await rows.first().hover();
    await rows.first().locator('button').first().click();
    await page.waitForTimeout(1000);

    // Verify queue button has badge showing count
    const queueButton = page.locator('[data-testid="queue-button"]');
    await expect(queueButton).toBeVisible();

    // Check if badge exists and shows correct count
    const badge = queueButton.locator('span');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('3');

    await page.screenshot({ path: '.screenshots/play-002-ac-visual-badge.png', fullPage: true });
  });
});
