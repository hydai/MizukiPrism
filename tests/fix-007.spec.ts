import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('FIX-007: Auto-skip deleted versions during playlist continuous playback', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('AC: Play playlist with deleted middle version - deleted track marked in UI', async ({ page }) => {
    // Create a playlist and add 2 real versions
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', 'FIX007測試清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Add 2 real performance rows
    for (let i = 0; i < 2; i++) {
      const row = page.locator('[data-testid="performance-row"]').nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-playlist-button"]').click();
      await page.locator('[data-testid^="playlist-option-"]').first().click();
      await page.waitForTimeout(400);
    }

    // Now inject a deleted version in between via localStorage
    await page.evaluate(() => {
      const stored = localStorage.getItem('mizukiprism_playlists');
      if (stored) {
        const playlists = JSON.parse(stored);
        if (playlists.length > 0) {
          // Insert deleted version as second item (index 1)
          const deletedVersion = {
            performanceId: 'deleted-fix007-perf',
            songTitle: '已刪除的歌曲',
            originalArtist: '未知藝人',
            videoId: 'fake-deleted-video',
            timestamp: 0,
          };
          playlists[0].versions.splice(1, 0, deletedVersion);
          localStorage.setItem('mizukiprism_playlists', JSON.stringify(playlists));
        }
      }
    });

    // Reload so the app picks up the new localStorage state
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open playlist panel
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    // Navigate into the playlist
    await page.locator('[data-testid="playlist-panel"]').getByText('FIX007測試清單').click();
    await page.waitForTimeout(300);

    // Verify the deleted version is marked as unavailable
    const deletedMarker = page.locator('[data-testid="deleted-version-marker"]');
    await expect(deletedMarker).toBeVisible();
    await expect(deletedMarker).toContainText('此版本已無法播放');

    await page.screenshot({ path: '.screenshots/fix-007-deleted-version-marked.png', fullPage: true });
  });

  test('AC: Play playlist - deleted first version is skipped, next playable starts', async ({ page }) => {
    // Create playlist with one real version
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', 'FIX007跳過首曲');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Add one real version
    const row = page.locator('[data-testid="performance-row"]').first();
    await row.hover();
    await row.locator('[data-testid="add-to-playlist-button"]').click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();
    await page.waitForTimeout(400);

    // Get the title of the real song for later comparison
    const realSongTitle = await page.locator('[data-testid="performance-row"]').first()
      .locator('.font-bold').first().textContent();

    // Prepend a deleted version to the front of the playlist
    await page.evaluate(() => {
      const stored = localStorage.getItem('mizukiprism_playlists');
      if (stored) {
        const playlists = JSON.parse(stored);
        if (playlists.length > 0) {
          const deletedVersion = {
            performanceId: 'deleted-fix007-first',
            songTitle: '排在前面但已刪除',
            originalArtist: '未知藝人',
            videoId: 'fake-deleted-first',
            timestamp: 0,
          };
          // Put deleted version first
          playlists[0].versions.unshift(deletedVersion);
          localStorage.setItem('mizukiprism_playlists', JSON.stringify(playlists));
        }
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open playlist panel and navigate to the playlist
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('FIX007跳過首曲').click();
    await page.waitForTimeout(300);

    // Click "播放全部" - the first version is deleted so playback should start with the real track
    await page.click('[data-testid="play-all-button"]');
    await page.waitForTimeout(1500);

    // Mini player should appear
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // The playing track should be the real song (not the deleted one)
    const playingTitle = await miniPlayer.locator('.font-bold').first().textContent();
    expect(playingTitle).toBe(realSongTitle);

    await page.screenshot({ path: '.screenshots/fix-007-skip-deleted-first.png', fullPage: true });
  });

  test('AC: Next button skips deleted versions and shows toast', async ({ page }) => {
    // Create a playlist with 3 real versions
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', 'FIX007下一首跳過');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Add 3 real versions
    for (let i = 0; i < 3; i++) {
      const row = page.locator('[data-testid="performance-row"]').nth(i);
      await row.hover();
      await row.locator('[data-testid="add-to-playlist-button"]').click();
      await page.locator('[data-testid^="playlist-option-"]').first().click();
      await page.waitForTimeout(400);
    }

    // Get real song titles for reference
    const thirdSongTitle = await page.locator('[data-testid="performance-row"]').nth(2)
      .locator('.font-bold').first().textContent();

    // Replace the second version with a deleted version in localStorage
    await page.evaluate(() => {
      const stored = localStorage.getItem('mizukiprism_playlists');
      if (stored) {
        const playlists = JSON.parse(stored);
        if (playlists.length > 0 && playlists[0].versions.length >= 2) {
          // Replace index 1 (second version) with a deleted one
          playlists[0].versions[1] = {
            performanceId: 'deleted-fix007-middle',
            songTitle: '中間已刪除的歌曲',
            originalArtist: '未知藝人',
            videoId: 'fake-deleted-middle',
            timestamp: 0,
          };
          localStorage.setItem('mizukiprism_playlists', JSON.stringify(playlists));
        }
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open playlist and play all
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('FIX007下一首跳過').click();
    await page.waitForTimeout(300);
    await page.click('[data-testid="play-all-button"]');
    await page.waitForTimeout(1000);

    // Close playlist panel
    await page.click('[data-testid="close-playlist-panel"]');
    await page.waitForTimeout(300);

    // Mini player should be visible (first song playing)
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();

    // Click next - should skip the deleted middle version and go to the 3rd version
    await miniPlayer.locator('button[aria-label="Next"]').click();
    await page.waitForTimeout(1000);

    // Toast should appear indicating a version was skipped
    const toast = page.locator('[data-testid="toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('已跳過無法播放的版本');

    // The currently playing track should now be the 3rd real song (skipping the deleted 2nd)
    const currentTitle = await miniPlayer.locator('.font-bold').first().textContent();
    expect(currentTitle).toBe(thirdSongTitle);

    await page.screenshot({ path: '.screenshots/fix-007-skip-toast.png', fullPage: true });
  });

  test('AC: All versions deleted - play button does nothing', async ({ page }) => {
    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', 'FIX007全刪清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Add one real version then replace it with a deleted one
    const row = page.locator('[data-testid="performance-row"]').first();
    await row.hover();
    await row.locator('[data-testid="add-to-playlist-button"]').click();
    await page.locator('[data-testid^="playlist-option-"]').first().click();
    await page.waitForTimeout(400);

    // Replace all versions with deleted ones
    await page.evaluate(() => {
      const stored = localStorage.getItem('mizukiprism_playlists');
      if (stored) {
        const playlists = JSON.parse(stored);
        if (playlists.length > 0) {
          playlists[0].versions = [
            {
              performanceId: 'deleted-fix007-all-1',
              songTitle: '全部已刪除1',
              originalArtist: '未知藝人',
              videoId: 'fake-deleted-all-1',
              timestamp: 0,
            },
            {
              performanceId: 'deleted-fix007-all-2',
              songTitle: '全部已刪除2',
              originalArtist: '未知藝人',
              videoId: 'fake-deleted-all-2',
              timestamp: 0,
            },
          ];
          localStorage.setItem('mizukiprism_playlists', JSON.stringify(playlists));
        }
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open playlist and verify all versions are marked as deleted
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await page.locator('[data-testid="playlist-panel"]').getByText('FIX007全刪清單').click();
    await page.waitForTimeout(300);

    // Both versions should show the deleted marker
    const deletedMarkers = page.locator('[data-testid="deleted-version-marker"]');
    await expect(deletedMarkers).toHaveCount(2);

    // Click "播放全部" - nothing should happen (no playable tracks)
    await page.click('[data-testid="play-all-button"]');
    await page.waitForTimeout(1000);

    // Mini player should NOT appear since all tracks are deleted
    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).not.toBeVisible();

    await page.screenshot({ path: '.screenshots/fix-007-all-deleted.png', fullPage: true });
  });

});
