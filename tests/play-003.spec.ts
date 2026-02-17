import { test, expect, Page } from '@playwright/test';

test.describe('PLAY-003: Playlist Management with Local Storage', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('AC1: Create playlist with name', async ({ page }) => {
    // Click create playlist button
    await page.click('[data-testid="create-playlist-button"]');

    // Dialog should appear
    await expect(page.locator('[data-testid="create-playlist-dialog"]')).toBeVisible();

    // Enter playlist name
    await page.fill('[data-testid="playlist-name-input"]', '我的最愛');

    // Click create button
    await page.click('[data-testid="confirm-create-button"]');

    // Wait for dialog to close
    await expect(page.locator('[data-testid="create-playlist-dialog"]')).not.toBeVisible();

    // Verify playlist appears in list
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    const panel = page.locator('[data-testid="playlist-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel.getByText('我的最愛')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac1-create-playlist.png' });
  });

  test('AC2: Block empty playlist name', async ({ page }) => {
    // Click create playlist button
    await page.click('[data-testid="create-playlist-button"]');

    // Try to create with empty name
    await page.click('[data-testid="confirm-create-button"]');

    // Error message should appear
    await expect(page.locator('[data-testid="create-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-error-message"]')).toContainText('名稱不可為空');

    // Dialog should still be open
    await expect(page.locator('[data-testid="create-playlist-dialog"]')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac2-empty-name-blocked.png' });
  });

  test('AC3: Add performance to playlist', async ({ page }) => {
    // Create a playlist first
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '測試清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Find a performance row and hover to reveal buttons
    const performanceRow = page.locator('[data-testid="performance-row"]').first();
    await performanceRow.hover();

    // Click add to playlist button
    const addToPlaylistBtn = performanceRow.locator('[data-testid="add-to-playlist-button"]');
    await addToPlaylistBtn.click();

    // Dropdown should appear
    await expect(page.locator('[data-testid="playlist-dropdown"]')).toBeVisible();

    // Get the playlist ID from the first playlist option
    const playlistOption = page.locator('[data-testid^="playlist-option-"]').first();
    await playlistOption.click();

    // Toast should appear
    await expect(page.locator('[data-testid="toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast"]')).toContainText('已加入播放清單');

    // Open playlist panel to verify
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    // Click on the playlist to view versions
    await page.locator('[data-testid="playlist-panel"]').getByText('測試清單').click();
    await page.waitForTimeout(300);

    // Verify version appears in the list
    await expect(page.locator('[data-testid="playlist-versions"]')).toBeVisible();
    const versionItems = page.locator('[data-testid="playlist-version-item"]');
    await expect(versionItems).toHaveCount(1);

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac3-add-to-playlist.png' });
  });

  test('AC4: Block duplicate versions with message', async ({ page }) => {
    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '無重複清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Add first performance
    const performanceRow = page.locator('[data-testid="performance-row"]').first();
    await performanceRow.hover();
    const addToPlaylistBtn = performanceRow.locator('[data-testid="add-to-playlist-button"]');
    await addToPlaylistBtn.click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();
    await page.waitForTimeout(500);

    // Try to add the same performance again
    await performanceRow.hover();
    await addToPlaylistBtn.click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();

    // Error message should appear in dropdown
    await expect(page.locator('[data-testid="add-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-error-message"]')).toContainText('此版本已在播放清單中');

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac4-duplicate-blocked.png' });
  });

  test('AC5: Drag to reorder versions', async ({ page }) => {
    // Create a playlist and add 3 versions
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '排序測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Add 3 different performances
    for (let i = 0; i < 3; i++) {
      const row = page.locator('[data-testid="performance-row"]').nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-playlist-button"]').click();
      await page.locator('[data-testid^="playlist-option-"]').first().click();
      await page.waitForTimeout(500);
    }

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('排序測試').click();
    await page.waitForTimeout(300);

    // Get initial order
    const versionItems = page.locator('[data-testid="playlist-version-item"]');
    await expect(versionItems).toHaveCount(3);

    const firstVersionText = await versionItems.first().textContent();
    const thirdVersionText = await versionItems.nth(2).textContent();

    // Drag first item to third position
    const firstItem = versionItems.first();
    const thirdItem = versionItems.nth(2);

    await firstItem.dragTo(thirdItem);
    await page.waitForTimeout(300);

    // Verify order changed
    const updatedVersionItems = page.locator('[data-testid="playlist-version-item"]');
    const newThirdVersionText = await updatedVersionItems.nth(2).textContent();

    expect(newThirdVersionText).toBe(firstVersionText);

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac5-reorder.png' });
  });

  test('AC6: Remove version from playlist', async ({ page }) => {
    // Create a playlist and add 2 versions
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '移除測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    for (let i = 0; i < 2; i++) {
      const row = page.locator('[data-testid="performance-row"]').nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-playlist-button"]').click();
      await page.locator('[data-testid^="playlist-option-"]').first().click();
      await page.waitForTimeout(500);
    }

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('移除測試').click();
    await page.waitForTimeout(300);

    // Verify we have 2 items
    const versionItems = page.locator('[data-testid="playlist-version-item"]');
    await expect(versionItems).toHaveCount(2);

    // Click remove on first item
    await versionItems.first().locator('[data-testid="remove-version-button"]').click();
    await page.waitForTimeout(300);

    // Verify item was removed
    const updatedItems = page.locator('[data-testid="playlist-version-item"]');
    await expect(updatedItems).toHaveCount(1);

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac6-remove-version.png' });
  });

  test('AC7: Rename playlist with validation', async ({ page }) => {
    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '舊名稱');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    // Click rename button
    const playlistCard = page.locator('[data-testid^="playlist-card-"]').first();
    await playlistCard.hover();
    await playlistCard.locator('[data-testid="rename-button"]').click();

    // Rename input should appear
    await expect(page.locator('[data-testid="rename-input"]')).toBeVisible();

    // Change name
    await page.fill('[data-testid="rename-input"]', '新名稱');
    await page.click('[data-testid="confirm-rename"]');
    await page.waitForTimeout(300);

    // Verify name updated
    await expect(page.locator('[data-testid="playlist-panel"]').getByText('新名稱')).toBeVisible();

    // Try to rename to empty (should be blocked)
    const updatedCard = page.locator('[data-testid^="playlist-card-"]').first();
    await updatedCard.hover();
    await updatedCard.locator('[data-testid="rename-button"]').click();
    await page.fill('[data-testid="rename-input"]', '');
    await page.click('[data-testid="confirm-rename"]');

    // Error should appear - empty name blocked
    await expect(page.locator('[data-testid="rename-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="rename-error"]')).toContainText('名稱不可為空');

    // Cancel editing - verify name is still "新名稱"
    await page.keyboard.press('Escape');
    // Click cancel button
    const cancelBtn = page.locator('text=取消').first();
    await cancelBtn.click();
    await page.waitForTimeout(200);

    // Name should remain as "新名稱"
    await expect(page.locator('[data-testid="playlist-panel"]').getByText('新名稱')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac7-rename.png' });
  });

  test('AC8: Play playlist loads all versions to queue', async ({ page }) => {
    // Create a playlist and add 3 versions
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '播放測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    for (let i = 0; i < 3; i++) {
      const row = page.locator('[data-testid="performance-row"]').nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-playlist-button"]').click();
      await page.locator('[data-testid^="playlist-option-"]').first().click();
      await page.waitForTimeout(500);
    }

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('播放測試').click();
    await page.waitForTimeout(300);

    // Click play all button
    await page.click('[data-testid="play-all-button"]');
    await page.waitForTimeout(1000);

    // Mini player should appear
    await expect(page.locator('[data-testid="mini-player"]')).toBeVisible();

    // Queue should have 2 items (first is playing, rest in queue)
    await page.click('[data-testid="queue-button"]');
    await page.waitForTimeout(300);

    const queueItems = page.locator('[data-testid="queue-item"]');
    await expect(queueItems).toHaveCount(2);

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac8-play-playlist.png' });
  });

  test('AC9: Delete playlist with confirmation', async ({ page }) => {
    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '要刪除的清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    // Click delete button
    const playlistCard = page.locator('[data-testid^="playlist-card-"]').first();
    await playlistCard.hover();
    await playlistCard.locator('[data-testid="delete-button"]').click();

    // Confirmation dialog should appear
    await expect(page.locator('[data-testid="confirm-delete"]')).toBeVisible();

    // Click confirm
    await page.click('[data-testid="confirm-delete"]');
    await page.waitForTimeout(300);

    // Playlist should be removed
    const panelAfterDelete = page.locator('[data-testid="playlist-panel"]');
    await expect(panelAfterDelete.getByText('要刪除的清單')).not.toBeVisible();
    await expect(panelAfterDelete.getByText('尚無播放清單')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac9-delete-playlist.png' });
  });

  test('AC10: Playlists persist via localStorage', async ({ page }) => {
    // Create a playlist and add a version
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '持久化測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    const row = page.locator('[data-testid="performance-row"]').first();
    await row.hover();
    await row.locator('[data-testid="add-to-playlist-button"]').click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();
    await page.waitForTimeout(500);

    // Close and reopen browser (refresh page)
    await page.reload();
    await page.waitForTimeout(500);

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    // Verify playlist still exists
    const panelPersist = page.locator('[data-testid="playlist-panel"]');
    await expect(panelPersist.getByText('持久化測試')).toBeVisible();

    // Open playlist to verify version persists
    await panelPersist.getByText('持久化測試').click();
    await page.waitForTimeout(300);

    const versionItems = page.locator('[data-testid="playlist-version-item"]');
    await expect(versionItems).toHaveCount(1);

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac10-persistence.png' });
  });

  test('AC11: Mark deleted versions as unavailable', async ({ page }) => {
    // Create a playlist and add a version
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '刪除版本測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    const row = page.locator('[data-testid="performance-row"]').first();
    await row.hover();
    await row.locator('[data-testid="add-to-playlist-button"]').click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();
    await page.waitForTimeout(500);

    // Simulate a deleted version by adding a fake performanceId to localStorage
    await page.evaluate(() => {
      const stored = localStorage.getItem('mizukiprism_playlists');
      if (stored) {
        const playlists = JSON.parse(stored);
        if (playlists.length > 0) {
          playlists[0].versions.push({
            performanceId: 'deleted-performance-123',
            songTitle: '已刪除的歌曲',
            originalArtist: '未知藝人',
            videoId: 'fake-video-id',
            timestamp: 0,
          });
          localStorage.setItem('mizukiprism_playlists', JSON.stringify(playlists));
        }
      }
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('刪除版本測試').click();
    await page.waitForTimeout(300);

    // Verify the deleted version is marked
    await expect(page.locator('[data-testid="deleted-version-marker"]')).toBeVisible();
    await expect(page.locator('[data-testid="deleted-version-marker"]')).toContainText('此版本已無法播放');

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac11-deleted-version.png' });
  });

  test('AC12: Handle localStorage quota exceeded', async ({ page }) => {
    // Simulate localStorage quota exceeded by overriding setItem to throw
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());

    // Create a playlist first (before simulating quota error)
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '配額測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Now override localStorage.setItem to throw QuotaExceededError
    await page.evaluate(() => {
      const originalSetItem = localStorage.setItem.bind(localStorage);
      (window as any).__originalSetItem = originalSetItem;
      Storage.prototype.setItem = function(key: string, value: string) {
        // Allow reading but throw on writes to the playlist key
        if (key === 'mizukiprism_playlists') {
          const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
          (error as any).name = 'QuotaExceededError';
          throw error;
        }
        return originalSetItem(key, value);
      };
    });

    // Try to add a version to the playlist (will trigger quota error)
    const row = page.locator('[data-testid="performance-row"]').first();
    await row.hover();
    await row.locator('[data-testid="add-to-playlist-button"]').click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();
    await page.waitForTimeout(500);

    // Toast should show error message
    await expect(page.locator('[data-testid="toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast"]')).toContainText('本機儲存空間不足');

    // Take screenshot
    await page.screenshot({ path: '.screenshots/play-003-ac12-quota-exceeded.png' });
  });

});
