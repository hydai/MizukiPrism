import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Helper: Reset songs.json and streams.json to original state after tests
const originalSongsPath = path.join(process.cwd(), 'data', 'songs.json');
const originalStreamsPath = path.join(process.cwd(), 'data', 'streams.json');

let originalSongsContent: string;
let originalStreamsContent: string;

test.describe.serial('ADMIN-001: Curator Management Interface', () => {
  test.beforeAll(async () => {
    // Save original data
    originalSongsContent = fs.readFileSync(originalSongsPath, 'utf-8');
    originalStreamsContent = fs.readFileSync(originalStreamsPath, 'utf-8');
  });

  test.afterEach(async () => {
    // Restore original data after each test
    fs.writeFileSync(originalSongsPath, originalSongsContent, 'utf-8');
    fs.writeFileSync(originalStreamsPath, originalStreamsContent, 'utf-8');
  });

  test('AC1: Navigate to admin URL without login - redirects to login page', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/admin\/login/);

    // Login form should be visible
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();

    // Should show curator management text
    await expect(page.getByText('策展人管理介面')).toBeVisible();
  });

  test('AC2: Login with non-curator account - shows 您沒有管理權限', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');

    // Enter non-curator credentials
    await page.getByTestId('username-input').fill('wronguser');
    await page.getByTestId('password-input').fill('wrongpass');
    await page.getByTestId('login-button').click();

    // Should show error message
    const errorEl = page.getByTestId('login-error');
    await expect(errorEl).toBeVisible();
    await expect(errorEl).toContainText('您沒有管理權限');

    // Should still be on login page
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test('AC3: Login as curator - access to management interface', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');

    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();

    // Should redirect to admin dashboard
    await page.waitForURL('http://localhost:3000/admin', { timeout: 5000 });

    // Management interface should be visible
    await expect(page.getByText('管理介面')).toBeVisible();
    await expect(page.getByTestId('admin-tabs')).toBeVisible();
    await expect(page.getByTestId('streams-tab')).toBeVisible();
    await expect(page.getByTestId('songs-tab')).toBeVisible();
  });

  test('AC4: Add new stream - valid URL creates stream, invalid URL shows validation error', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Click add stream button
    await page.getByTestId('add-stream-button').click();

    // Stream form should appear
    const formContainer = page.getByTestId('stream-form-container');
    await expect(formContainer).toBeVisible();

    // Test invalid YouTube URL first
    await page.getByTestId('stream-title-input').fill('測試直播');
    await page.getByTestId('stream-date-input').fill('2024-03-01');
    await page.getByTestId('stream-url-input').fill('https://invalid-url.com/notvalid');
    await page.getByTestId('stream-submit-button').click();

    // Should show validation error
    const formError = page.getByTestId('stream-form-error');
    await expect(formError).toBeVisible();
    await expect(formError).toContainText('請輸入有效的 YouTube URL');

    // Clear and enter valid URL
    await page.getByTestId('stream-url-input').fill('https://www.youtube.com/watch?v=testVideoId123');
    await page.getByTestId('stream-submit-button').click();

    // Stream should be created - look for new stream in the list
    await page.waitForTimeout(1000);
    await expect(page.getByText('測試直播')).toBeVisible();
  });

  test('AC5: Add song version - creates version and appears in fan-facing catalog', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // First create a stream
    await page.getByTestId('add-stream-button').click();
    await page.getByTestId('stream-title-input').fill('新歌回直播');
    await page.getByTestId('stream-date-input').fill('2024-04-01');
    await page.getByTestId('stream-url-input').fill('https://www.youtube.com/watch?v=newStreamId456');
    await page.getByTestId('stream-submit-button').click();
    await page.waitForTimeout(1000);

    // The newly created stream should be auto-expanded
    // Look for "add version" button
    const addVersionBtn = page.getByRole('button', { name: '新增歌曲版本' }).first();
    await expect(addVersionBtn).toBeVisible({ timeout: 5000 });
    await addVersionBtn.click();

    // Fill in version form
    await page.getByTestId('version-song-title-input').fill('測試新歌');
    await page.getByTestId('version-artist-input').fill('測試歌手');
    await page.getByTestId('version-start-timestamp-input').fill('1:23:45');
    await page.getByTestId('version-note-input').fill('測試備註');
    await page.getByTestId('version-submit-button').click();
    await page.waitForTimeout(1000);

    // Version should be created - song should appear in the list
    await expect(page.getByText('測試新歌')).toBeVisible();

    // Verify it appears in the fan-facing catalog
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="performance-row"]', { timeout: 5000 });

    // The new song should be in the catalog
    await expect(page.getByText('測試新歌')).toBeVisible();
  });

  test('AC6: Invalid timestamp format - shows validation error', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Create a stream first
    await page.getByTestId('add-stream-button').click();
    await page.getByTestId('stream-title-input').fill('時間戳測試直播');
    await page.getByTestId('stream-date-input').fill('2024-04-02');
    await page.getByTestId('stream-url-input').fill('https://www.youtube.com/watch?v=tsTestId789');
    await page.getByTestId('stream-submit-button').click();
    await page.waitForTimeout(1000);

    // The newly created stream should be auto-expanded
    // Click add version button
    await page.getByRole('button', { name: '新增歌曲版本' }).first().click({ timeout: 5000 });

    // Fill with invalid timestamp
    await page.getByTestId('version-song-title-input').fill('時間戳測試歌曲');
    await page.getByTestId('version-artist-input').fill('測試歌手');
    await page.getByTestId('version-start-timestamp-input').fill('123456'); // Invalid format
    await page.getByTestId('version-submit-button').click();

    // Should show validation error
    const error = page.getByTestId('version-form-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('請輸入有效的時間戳格式（如 1:23:45 或 01:23:45）');
  });

  test('AC7: Add version with existing song name - associates with existing song', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Get initial songs count
    const initialRes = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const initialSongsCount = initialRes.length;

    // Create a stream
    await page.getByTestId('add-stream-button').click();
    await page.getByTestId('stream-title-input').fill('重複歌曲測試直播');
    await page.getByTestId('stream-date-input').fill('2024-04-03');
    await page.getByTestId('stream-url-input').fill('https://www.youtube.com/watch?v=duplicateTest');
    await page.getByTestId('stream-submit-button').click();
    await page.waitForTimeout(1000);

    // The newly created stream should be auto-expanded
    await page.getByRole('button', { name: '新增歌曲版本' }).first().click({ timeout: 5000 });

    // Use existing song name "First Love" with same artist
    await page.getByTestId('version-song-title-input').fill('First Love');
    await page.getByTestId('version-artist-input').fill('宇多田光');
    await page.getByTestId('version-start-timestamp-input').fill('0:30:00');
    await page.getByTestId('version-submit-button').click();
    await page.waitForTimeout(1000);

    // Check that no new song was created - songs count should remain the same
    const newSongs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    expect(newSongs.length).toBe(initialSongsCount);

    // The existing song "First Love" should now have 3 performances
    const firstLoveSong = newSongs.find((s: { title: string }) => s.title === 'First Love');
    expect(firstLoveSong.performances.length).toBe(3);
  });

  test('AC8: Add version with new song name - creates new song entry', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Get initial songs count
    const initialSongs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const initialCount = initialSongs.length;

    // Create a stream
    await page.getByTestId('add-stream-button').click();
    await page.getByTestId('stream-title-input').fill('新歌測試直播');
    await page.getByTestId('stream-date-input').fill('2024-04-04');
    await page.getByTestId('stream-url-input').fill('https://www.youtube.com/watch?v=newSongTest');
    await page.getByTestId('stream-submit-button').click();
    await page.waitForTimeout(1000);

    // The newly created stream should be auto-expanded
    await page.getByRole('button', { name: '新增歌曲版本' }).first().click({ timeout: 5000 });

    const newSongTitle = `全新測試歌曲-${Date.now()}`;
    await page.getByTestId('version-song-title-input').fill(newSongTitle);
    await page.getByTestId('version-artist-input').fill('新歌手');
    await page.getByTestId('version-tags-input').fill('測試標籤');
    await page.getByTestId('version-start-timestamp-input').fill('0:05:00');
    await page.getByTestId('version-submit-button').click();
    await page.waitForTimeout(1000);

    // New song should have been created
    const newSongs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    expect(newSongs.length).toBe(initialCount + 1);

    const newSong = newSongs.find((s: { title: string }) => s.title === newSongTitle);
    expect(newSong).toBeTruthy();
    expect(newSong.performances.length).toBe(1);
  });

  test('AC9: Edit version - changes reflected in fan-facing catalog', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Expand the first stream (秋日歌回)
    await page.getByTestId('streams-tab').click();
    await page.waitForTimeout(500);

    // Wait for streams to load
    const streamToggle = page.getByTestId('stream-toggle-stream-1');
    await expect(streamToggle).toBeVisible();
    await streamToggle.click();
    await page.waitForTimeout(500);

    // Click edit for performance p1-1
    const editBtn = page.getByTestId('edit-version-button-p1-1');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Edit form should appear
    const editForm = page.getByTestId('edit-version-form');
    await expect(editForm).toBeVisible();

    // Change timestamp and note
    const startInput = page.getByTestId('edit-start-timestamp-input');
    await startInput.fill('0:05:00');

    const noteInput = page.getByTestId('edit-note-input');
    await noteInput.fill('新備註內容');

    // Save
    await page.getByTestId('edit-version-save-button').click();
    await page.waitForTimeout(1000);

    // Verify in fan-facing catalog
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="performance-row"]', { timeout: 5000 });

    // The note should be updated in the catalog
    await expect(page.getByText('新備註內容')).toBeVisible();
  });

  test('AC10: Delete version - confirmation dialog with warning, then removes from catalog', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Expand stream 1
    await page.getByTestId('stream-toggle-stream-1').click();
    await page.waitForTimeout(500);

    // Click delete for performance p1-1
    await page.getByTestId('delete-version-button-p1-1').click();

    // Confirmation dialog should appear
    const dialog = page.getByTestId('delete-confirm-dialog');
    await expect(dialog).toBeVisible();

    // Warning should be shown
    const warning = page.getByTestId('delete-warning');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('此版本可能存在於粉絲的播放清單中');

    // Confirm deletion
    await page.getByTestId('confirm-delete-button').click();
    await page.waitForTimeout(1000);

    // Verify the performance is gone via API
    const songs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const firstLove = songs.find((s: { title: string }) => s.title === 'First Love');
    const perf = firstLove?.performances.find((p: { id: string }) => p.id === 'p1-1');
    expect(perf).toBeUndefined();

    // Verify it's not in the fan-facing catalog
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="performance-row"]', { timeout: 5000 });

    // 清唱版 note should be gone
    const clearSingText = page.getByText('清唱版');
    await expect(clearSingText).not.toBeVisible();
  });

  test('AC11: Delete last version of song - song entry remains with 0 versions', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Expand stream 6 (雙十一 - has only song 3 Betelgeuse with p3-1)
    await page.getByTestId('stream-toggle-stream-6').click();
    await page.waitForTimeout(500);

    // Delete the only performance
    await page.getByTestId('delete-version-button-p3-1').click();

    // Confirm deletion
    const dialog = page.getByTestId('delete-confirm-dialog');
    await expect(dialog).toBeVisible();
    await page.getByTestId('confirm-delete-button').click();
    await page.waitForTimeout(1000);

    // Check that song still exists but with 0 performances
    const songs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const betelgeuse = songs.find((s: { title: string }) => s.title === 'Betelgeuse (ベテルギウス)');
    expect(betelgeuse).toBeTruthy();
    expect(betelgeuse.performances.length).toBe(0);

    // In fan-facing catalog, song should still exist but show 0 versions
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="performance-row"]', { timeout: 5000 });

    // Switch to grouped view to see version counts
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(500);

    // Betelgeuse should still be visible with 0 versions
    await expect(page.getByText('Betelgeuse (ベテルギウス)')).toBeVisible();
  });

  test('AC12: Edit song metadata - changes apply without affecting versions', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Go to songs tab
    await page.getByTestId('songs-tab').click();
    await page.waitForTimeout(500);

    // Get initial song-1 performance count
    const initialSongs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const song1 = initialSongs.find((s: { id: string }) => s.id === 'song-1');
    const initialPerfCount = song1.performances.length;

    // Click edit for song-1 (First Love)
    await page.getByTestId('edit-song-button-song-1').click();

    // Edit song form should appear
    const editForm = page.getByTestId('edit-song-form');
    await expect(editForm).toBeVisible();

    // Change title and tags
    const titleInput = page.getByTestId('edit-song-title-input');
    await titleInput.fill('First Love（修改版）');

    const tagsInput = page.getByTestId('edit-song-tags-input');
    await tagsInput.fill('抒情, J-POP, 經典, 修改標籤');

    // Save
    await page.getByTestId('edit-song-save-button').click();
    await page.waitForTimeout(1000);

    // Verify changes
    const updatedSongs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const updatedSong = updatedSongs.find((s: { id: string }) => s.id === 'song-1');

    expect(updatedSong.title).toBe('First Love（修改版）');
    expect(updatedSong.tags).toContain('修改標籤');

    // Versions should be unaffected
    expect(updatedSong.performances.length).toBe(initialPerfCount);

    // Fan-facing catalog should show updated title
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="performance-row"]', { timeout: 5000 });
    await expect(page.getByText('First Love（修改版）').first()).toBeVisible();
  });

  test('AC13: Edit song metadata - duplicate name+artist rejected with error message', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/admin/login');
    await page.getByTestId('username-input').fill('curator');
    await page.getByTestId('password-input').fill('mizuki-admin');
    await page.getByTestId('login-button').click();
    await page.waitForURL('http://localhost:3000/admin');

    // Go to songs tab
    await page.getByTestId('songs-tab').click();
    await page.waitForTimeout(500);

    // Click edit for song-1 (First Love / 宇多田光)
    await page.getByTestId('edit-song-button-song-1').click();

    // Edit song form should appear
    const editForm = page.getByTestId('edit-song-form');
    await expect(editForm).toBeVisible();

    // Change title and artist to match song-2 (Idol / YOASOBI)
    const titleInput = page.getByTestId('edit-song-title-input');
    await titleInput.fill('Idol (アイドル)');
    const artistInput = page.getByTestId('edit-song-artist-input');
    await artistInput.fill('YOASOBI');

    // Attempt to save
    await page.getByTestId('edit-song-save-button').click();
    await page.waitForTimeout(1000);

    // Error message should appear
    await expect(editForm.getByText('已存在相同歌名與原唱者的歌曲')).toBeVisible();

    // Song-1 data should be unchanged
    const songs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const song1 = songs.find((s: { id: string }) => s.id === 'song-1');
    expect(song1.title).toBe('First Love');
    expect(song1.originalArtist).toBe('宇多田光');

    // Now fix the title to be unique and verify save succeeds
    await titleInput.fill('First Love - 唯一版');
    await artistInput.fill('宇多田光');
    await page.getByTestId('edit-song-save-button').click();
    await page.waitForTimeout(1000);

    // Form should close (error gone) and data should be updated
    const updatedSongs = await page.evaluate(() =>
      fetch('/api/songs').then(r => r.json())
    );
    const updatedSong1 = updatedSongs.find((s: { id: string }) => s.id === 'song-1');
    expect(updatedSong1.title).toBe('First Love - 唯一版');
  });
});
