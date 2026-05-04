import { test, expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const CLIPPED_CURRENT_FIXTURE = {
  search: '我回來啦',
  title: '誰',
  date: '2026-04-10',
  endTimestamp: 5022,
};
const CLIPPED_QUEUE_FIXTURE = {
  search: '我回來啦',
  title: 'ラブカ?',
  date: '2026-04-10',
  endTimestamp: 1345,
};
const FULL_LENGTH_FIXTURE = {
  search: 'Jump Up Super Star!',
  title: 'Jump Up Super Star!',
  date: '2022-01-01',
  endTimestamp: null,
};

interface PerformanceFixture {
  search: string;
  title: string;
  date: string;
  endTimestamp: number | null;
}

interface CatalogPerformanceFixture {
  id: string;
  streamId: string;
  date: string;
  streamTitle: string;
  videoId: string;
  timestamp: number;
  endTimestamp?: number | null;
  note: string;
}

interface CatalogSongFixture {
  id: string;
  title: string;
  originalArtist: string;
  tags: string[];
  performances: CatalogPerformanceFixture[];
}

const TEST_CATALOG_SONGS: CatalogSongFixture[] = [
  {
    id: 'song-fixture-1',
    title: CLIPPED_CURRENT_FIXTURE.title,
    originalArtist: 'Fixture Artist A',
    tags: [],
    performances: [{
      id: 'performance-fixture-1',
      streamId: 'stream-fixture-2026-04-10',
      date: CLIPPED_CURRENT_FIXTURE.date,
      streamTitle: '我回來啦 Fixture Karaoke Stream A',
      videoId: 'fixture-video-a',
      timestamp: 4763,
      endTimestamp: CLIPPED_CURRENT_FIXTURE.endTimestamp,
      note: '',
    }],
  },
  {
    id: 'song-fixture-2',
    title: CLIPPED_QUEUE_FIXTURE.title,
    originalArtist: 'Fixture Artist B',
    tags: [],
    performances: [{
      id: 'performance-fixture-2',
      streamId: 'stream-fixture-2026-04-09',
      date: CLIPPED_QUEUE_FIXTURE.date,
      streamTitle: '我回來啦 Fixture Karaoke Stream B',
      videoId: 'fixture-video-b',
      timestamp: 1160,
      endTimestamp: CLIPPED_QUEUE_FIXTURE.endTimestamp,
      note: '',
    }],
  },
  {
    id: 'song-fixture-3',
    title: 'Keep Cold',
    originalArtist: 'Fixture Artist C',
    tags: [],
    performances: [{
      id: 'performance-fixture-3',
      streamId: 'stream-fixture-2026-04-08',
      date: '2026-04-08',
      streamTitle: 'Fixture Karaoke Stream C',
      videoId: 'fixture-video-c',
      timestamp: 2478,
      endTimestamp: 2712,
      note: '',
    }],
  },
  {
    id: 'song-fixture-4',
    title: FULL_LENGTH_FIXTURE.title,
    originalArtist: 'Fixture Artist D',
    tags: [],
    performances: [{
      id: 'performance-fixture-4',
      streamId: 'stream-fixture-2022-01-01',
      date: FULL_LENGTH_FIXTURE.date,
      streamTitle: 'Fixture Full Length Stream',
      videoId: 'fixture-video-d',
      timestamp: 781,
      endTimestamp: FULL_LENGTH_FIXTURE.endTimestamp,
      note: '',
    }],
  },
];

declare global {
  interface Window {
    __mockYouTubePlayer?: {
      currentTime: number;
      isPlaying: boolean;
      emitStateChange: (stateCode: number) => void;
      setCurrentTime: (seconds: number) => void;
      setDuration: (seconds: number) => void;
    };
  }
}

async function mockYouTubeIframeApi(page: Page) {
  await page.route('https://www.youtube.com/iframe_api', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        (() => {
          class MockYouTubePlayer {
            constructor(_elementId, options) {
              this.options = options;
              this.currentTime = Number(options?.playerVars?.start ?? 0);
              this.duration = 999999;
              this.isPlaying = false;
              window.__mockYouTubePlayer = this;
              setTimeout(() => this.options?.events?.onReady?.({ target: this }), 0);
            }
            getCurrentTime() { return this.currentTime; }
            getDuration() { return this.duration; }
            seekTo(seconds) { this.currentTime = seconds; }
            playVideo() {
              this.isPlaying = true;
              this.options?.events?.onStateChange?.({ target: this, data: 1 });
            }
            pauseVideo() {
              this.isPlaying = false;
              this.options?.events?.onStateChange?.({ target: this, data: 2 });
            }
            loadVideoById(input) {
              this.currentTime = typeof input === 'object' && input !== null
                ? Number(input.startSeconds ?? 0)
                : 0;
              this.playVideo();
            }
            destroy() { this.isPlaying = false; }
            getPlayerState() { return this.isPlaying ? 1 : 2; }
            emitStateChange(stateCode) {
              if (stateCode === 0) {
                this.isPlaying = false;
              }
              this.options?.events?.onStateChange?.({ target: this, data: stateCode });
            }
            setCurrentTime(seconds) { this.currentTime = seconds; }
            setDuration(seconds) { this.duration = seconds; }
          }

          window.YT = { Player: MockYouTubePlayer };
          setTimeout(() => window.onYouTubeIframeAPIReady?.(), 0);
        })();
      `,
    });
  });
}

async function mockCatalogSongsApi(page: Page) {
  await page.route('**/api/songs', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_CATALOG_SONGS),
    });
  });
}

async function expectProductionSongsApiEndTimestamp(request: APIRequestContext): Promise<void> {
  const response = await request.get(`${BASE_URL}/api/songs`);
  expect(response.ok()).toBe(true);

  const songs = await response.json() as CatalogSongFixture[];
  const serializedEndTimestamp = songs
    .flatMap((song) => song.performances)
    .find((performance) => typeof performance.endTimestamp === 'number')
    ?.endTimestamp;

  expect(
    serializedEndTimestamp,
    'production /api/songs should preserve numeric endTimestamp values',
  ).toEqual(expect.any(Number));
}

async function expectCatalogPerformanceFixture(page: Page, fixture: PerformanceFixture): Promise<void> {
  const actual = await page.evaluate(async ({ title, date }) => {
    const response = await fetch('/api/songs');
    const songs = await response.json() as CatalogSongFixture[];
    const performance = songs
      .find((song) => song.title === title && song.performances.some((candidate) => candidate.date === date))
      ?.performances
      .find((candidate) => candidate.date === date);

    if (!performance) return null;
    return { endTimestamp: performance.endTimestamp ?? null };
  }, { title: fixture.title, date: fixture.date });

  expect(actual).not.toBeNull();
  expect(actual?.endTimestamp ?? null).toBe(fixture.endTimestamp);
}

async function findPerformanceRow(page: Page, fixture: PerformanceFixture): Promise<Locator> {
  const searchInput = page.getByPlaceholder('搜尋歌曲...');
  await searchInput.fill(fixture.search);

  const row = page
    .locator('[data-testid="performance-row"]')
    .filter({ hasText: fixture.title })
    .filter({ hasText: fixture.date })
    .first();

  await expect(row).toBeVisible();
  return row;
}

async function waitForMockPlayback(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__mockYouTubePlayer?.isPlaying === true);
}

async function useDesktopViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 720 });
}

test('PLAY-002 contract: production /api/songs serializes endTimestamp', async ({ request }) => {
  await expectProductionSongsApiEndTimestamp(request);
});

test.describe('PLAY-002: Play Queue Management', () => {

  test.beforeEach(async ({ page }) => {
    await mockYouTubeIframeApi(page);
    await mockCatalogSongsApi(page);
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
    await expect(queuePanel.locator('h2')).toHaveText('播放佇列 · 3 首');

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

  test('AC7b: Polling interval advances when track end is reached', async ({ page }) => {
    await expectCatalogPerformanceFixture(page, CLIPPED_CURRENT_FIXTURE);
    await expectCatalogPerformanceFixture(page, CLIPPED_QUEUE_FIXTURE);

    const queuedRow = await findPerformanceRow(page, CLIPPED_QUEUE_FIXTURE);
    await queuedRow.hover();
    await queuedRow.locator('[data-testid="add-to-queue"]').click();
    await page.waitForTimeout(300);

    const currentRow = await findPerformanceRow(page, CLIPPED_CURRENT_FIXTURE);
    await currentRow.hover();
    await currentRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await waitForMockPlayback(page);

    await page.evaluate(() => {
      window.__mockYouTubePlayer?.setCurrentTime(999999);
    });

    await expect(miniPlayer.locator('.font-bold.text-slate-800')).toHaveText(
      CLIPPED_QUEUE_FIXTURE.title,
      { timeout: 3000 },
    );
  });

  test('AC7c: Polling interval pauses player when no next track remains', async ({ page }) => {
    await expectCatalogPerformanceFixture(page, CLIPPED_CURRENT_FIXTURE);

    const currentRow = await findPerformanceRow(page, CLIPPED_CURRENT_FIXTURE);
    await currentRow.hover();
    await currentRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await waitForMockPlayback(page);

    await page.evaluate(() => {
      window.__mockYouTubePlayer?.setCurrentTime(999999);
    });

    await page.waitForFunction(() => window.__mockYouTubePlayer?.isPlaying === false);
    await expect(miniPlayer.locator('button[aria-label="Play"]')).toBeVisible();
  });

  test('AC7d: Native ended event loops current track with repeat-one enabled', async ({ page }) => {
    await useDesktopViewport(page);

    const currentRow = await findPerformanceRow(page, CLIPPED_CURRENT_FIXTURE);

    await currentRow.hover();
    await currentRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();
    await page.waitForFunction(() => Boolean(window.__mockYouTubePlayer));

    const repeatButton = miniPlayer.locator('[data-testid="desktop-repeat-button"]');
    await expect(repeatButton).toBeVisible();
    await repeatButton.click();
    await repeatButton.click();

    const trackStartTime = await page.evaluate(() => window.__mockYouTubePlayer?.currentTime ?? 0);
    await page.evaluate(() => {
      window.__mockYouTubePlayer?.setCurrentTime(999999);
      window.__mockYouTubePlayer?.emitStateChange(0);
    });

    await page.waitForFunction((expectedStartTime) => (
      window.__mockYouTubePlayer?.isPlaying === true
        && window.__mockYouTubePlayer?.currentTime === expectedStartTime
    ), trackStartTime);
    await expect(miniPlayer.locator('.font-bold.text-slate-800')).toHaveText(CLIPPED_CURRENT_FIXTURE.title);
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();
  });

  test('AC7e: Native ended event stops playback when a full-length track ends', async ({ page }) => {
    await expectCatalogPerformanceFixture(page, FULL_LENGTH_FIXTURE);

    const currentRow = await findPerformanceRow(page, FULL_LENGTH_FIXTURE);
    await currentRow.hover();
    await currentRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();
    await page.waitForFunction(() => Boolean(window.__mockYouTubePlayer));

    await page.evaluate(() => {
      window.__mockYouTubePlayer?.emitStateChange(0);
    });

    await page.waitForFunction(() => window.__mockYouTubePlayer?.isPlaying === false);
    await expect(miniPlayer.locator('button[aria-label="Play"]')).toBeVisible();
  });

  test('AC7f: Repeat-one native ended event clamps out-of-bounds restart and warns once', async ({ page }) => {
    await useDesktopViewport(page);

    const currentRow = await findPerformanceRow(page, CLIPPED_CURRENT_FIXTURE);

    await currentRow.hover();
    await currentRow.locator('button').first().click();

    const miniPlayer = page.locator('[data-testid="mini-player"]');
    await expect(miniPlayer).toBeVisible();
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();
    await page.waitForFunction(() => Boolean(window.__mockYouTubePlayer));

    const repeatButton = miniPlayer.locator('[data-testid="desktop-repeat-button"]');
    await expect(repeatButton).toBeVisible();
    await repeatButton.click();
    await repeatButton.click();

    await page.evaluate(() => {
      window.__mockYouTubePlayer?.setDuration(1);
      window.__mockYouTubePlayer?.setCurrentTime(999999);
      window.__mockYouTubePlayer?.emitStateChange(0);
    });

    await page.waitForFunction(() => (
      window.__mockYouTubePlayer?.isPlaying === true
        && window.__mockYouTubePlayer?.currentTime === 0
    ));
    const timestampWarningToast = page.locator('[data-testid="toast"]').filter({ hasText: '時間戳可能有誤' });
    await expect(timestampWarningToast).toBeVisible();
    await expect(timestampWarningToast).not.toBeVisible({ timeout: 5000 });

    await page.evaluate(() => {
      window.__mockYouTubePlayer?.setCurrentTime(999999);
      window.__mockYouTubePlayer?.emitStateChange(0);
    });
    await page.waitForFunction(() => (
      window.__mockYouTubePlayer?.isPlaying === true
        && window.__mockYouTubePlayer?.currentTime === 0
    ));
    await page.waitForTimeout(1000);
    await expect(timestampWarningToast).toHaveCount(0);

    await currentRow.hover();
    await currentRow.locator('button').first().click();
    await expect(timestampWarningToast).toBeVisible();
    await expect(miniPlayer.locator('button[aria-label="Pause"]')).toBeVisible();
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
