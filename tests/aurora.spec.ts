import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Aurora: Community Timestamping Tool', () => {

  test('URL input is shown on initial load', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await expect(page.getByTestId('vod-url-input')).toBeVisible();
    await expect(page.getByText('MizukiAurora')).toBeVisible();
    await expect(page.getByText('社群時間戳工具 — 為歌枠直播建立結構化的時間戳列表')).toBeVisible();
  });

  test('Invalid URL shows error message', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    const input = page.getByTestId('vod-url-input');
    await input.fill('not-a-youtube-url');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('url-error')).toBeVisible();
    await expect(page.getByTestId('url-error')).toContainText('有效的 YouTube');
  });

  test('Valid YouTube URL loads workspace', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    const input = page.getByTestId('vod-url-input');
    await input.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    // Workspace should appear (player + song list)
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('add-song-button')).toBeVisible();
    await expect(page.getByTestId('import-button')).toBeVisible();
  });

  test('Enter key submits URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    const input = page.getByTestId('vod-url-input');
    await input.fill('https://youtu.be/dQw4w9WgXcQ');
    await input.press('Enter');
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });
  });

  test('Add song button creates a new song row', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('add-song-button').click();
    await expect(page.getByTestId('song-row')).toHaveCount(1);

    await page.getByTestId('add-song-button').click();
    await expect(page.getByTestId('song-row')).toHaveCount(2);
  });

  test('Paste import: open modal, paste text, preview, import songs', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    // Open import modal
    await page.getByTestId('import-button').click();
    await expect(page.getByTestId('paste-import-textarea')).toBeVisible();

    // Paste timestamp text
    const text = '0:00 降雨的舒適圈 / 李友廷\n5:30 香水 / 瑛人\n10:15 紅蓮華 / LiSA';
    await page.getByTestId('paste-import-textarea').fill(text);

    // Verify preview shows 3 rows
    await expect(page.getByTestId('import-preview-row')).toHaveCount(3);

    // Import
    await page.getByTestId('import-confirm-button').click();

    // Verify songs were imported
    await expect(page.getByTestId('song-row')).toHaveCount(3);
  });

  test('Export: shows formatted output with VOD URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    // Import some songs first
    await page.getByTestId('import-button').click();
    await page.getByTestId('paste-import-textarea').fill('0:00 降雨的舒適圈 / 李友廷\n5:30 香水 / 瑛人');
    await page.getByTestId('import-confirm-button').click();
    await expect(page.getByTestId('song-row')).toHaveCount(2);

    // Open export modal
    await page.getByTestId('export-button').click();
    const exportText = await page.getByTestId('export-textarea').inputValue();

    // Verify format
    expect(exportText).toContain('youtu.be/dQw4w9WgXcQ');
    expect(exportText).toContain('01. 0:00:00 ~ 0:05:30 降雨的舒適圈 / 李友廷');
    expect(exportText).toContain('02. 0:05:30 ~ --:--:-- 香水 / 瑛人');
  });

  test('Inline editing of song name', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    // Import a song
    await page.getByTestId('import-button').click();
    await page.getByTestId('paste-import-textarea').fill('0:00 テスト曲 / テスト歌手');
    await page.getByTestId('import-confirm-button').click();

    // Double-click to edit song name
    const songRow = page.getByTestId('song-row').first();
    const nameCell = songRow.locator('span:has-text("テスト曲")');
    await nameCell.dblclick();

    // Should show input
    const input = songRow.locator('input').first();
    await expect(input).toBeVisible();
    await input.fill('新しい曲名');
    await input.press('Enter');

    // Verify name changed
    await expect(songRow).toContainText('新しい曲名');
  });

  test('Back link navigates to MizukiPrism', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    const backLink = page.locator('a', { hasText: 'MizukiPrism' });
    await expect(backLink).toHaveAttribute('href', '/');
  });

  test('Player control buttons visible after loading video', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('aurora-player-controls')).toBeVisible();
    await expect(page.getByTestId('toggle-play-button')).toBeVisible();
    await expect(page.getByTestId('seek-backward-button')).toBeVisible();
    await expect(page.getByTestId('seek-forward-button')).toBeVisible();
  });

  test('Stamp controls visible but disabled with no song selected', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('aurora-stamp-controls')).toBeVisible();
    await expect(page.getByTestId('set-start-button')).toBeDisabled();
    await expect(page.getByTestId('set-end-button')).toBeDisabled();
    await expect(page.getByTestId('seek-to-start-button')).toBeDisabled();
    await expect(page.getByTestId('seek-to-end-button')).toBeDisabled();
  });

  test('Stamp controls enabled after adding a song', async ({ page }) => {
    await page.goto(`${BASE_URL}/aurora`);
    await page.getByTestId('vod-url-input').fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByTestId('load-video-button').click();
    await expect(page.getByTestId('aurora-workspace')).toBeVisible({ timeout: 10000 });

    // Add a song — this selects it
    await page.getByTestId('add-song-button').click();
    await expect(page.getByTestId('song-row')).toHaveCount(1);

    // Stamp controls that require a selected song should now be enabled
    await expect(page.getByTestId('set-start-button')).toBeEnabled();
    await expect(page.getByTestId('set-end-button')).toBeEnabled();
    await expect(page.getByTestId('seek-to-start-button')).toBeEnabled();
    // seek-to-end remains disabled because endSeconds is null
    await expect(page.getByTestId('seek-to-end-button')).toBeDisabled();
  });
});
