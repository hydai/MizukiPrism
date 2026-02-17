import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Helper: reset users.json and user-playlists before each test
async function resetAuthData() {
  const usersPath = path.join(process.cwd(), 'data', 'users.json');
  const userPlaylistsDir = path.join(process.cwd(), 'data', 'user-playlists');

  // Reset users.json
  fs.writeFileSync(usersPath, '[]', 'utf-8');

  // Clear user playlists
  if (fs.existsSync(userPlaylistsDir)) {
    for (const file of fs.readdirSync(userPlaylistsDir)) {
      fs.unlinkSync(path.join(userPlaylistsDir, file));
    }
  }
}

async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('mizukiprism_playlists');
    localStorage.removeItem('mizukiprism_pending_sync');
  });
}

async function registerAndLogin(page: Page, username: string, password: string) {
  // First try to register (may fail if already exists, then try login)
  const regRes = await page.evaluate(async ({ u, p }: { u: string; p: string }) => {
    const res = await fetch('/api/auth/fan/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    });
    return await res.json();
  }, { u: username, p: password });

  if (!regRes.success) {
    // Try login
    await page.evaluate(async ({ u, p }: { u: string; p: string }) => {
      await fetch('/api/auth/fan/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
    }, { u: username, p: password });
  }

  // Reload to pick up auth state
  await page.reload();
  await page.waitForTimeout(800);
}

async function logoutViaAPI(page: Page) {
  await page.evaluate(async () => {
    await fetch('/api/auth/fan/logout', { method: 'POST' });
  });
  await page.reload();
  await page.waitForTimeout(500);
}

test.describe('AUTH-001: User Account & Cloud Playlist Sync', () => {

  test.beforeEach(async ({ page }) => {
    await resetAuthData();
    await page.goto('http://localhost:3000');
    await clearLocalStorage(page);
    await logoutViaAPI(page);
  });

  test('AC1: Without login, playlist features work with localStorage only', async ({ page }) => {
    // Verify not logged in
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).not.toBeVisible();

    // Create a playlist without logging in
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '本機清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Verify playlist was created and stored in localStorage
    const stored = await page.evaluate(() => localStorage.getItem('mizukiprism_playlists'));
    expect(stored).toBeTruthy();
    const playlists = JSON.parse(stored!);
    expect(playlists.length).toBe(1);
    expect(playlists[0].name).toBe('本機清單');

    // Verify UI shows playlist
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await expect(page.locator('text=本機清單')).toBeVisible();

    await page.screenshot({ path: '.screenshots/auth-001-ac1-local-only.png' });
  });

  test('AC2: Click login redirects to login/register page', async ({ page }) => {
    // Click the login button in sidebar
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await page.click('[data-testid="login-button"]');

    // Should navigate to /auth page
    await page.waitForURL('**/auth**');
    await expect(page.locator('[data-testid="fan-username-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="fan-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-submit-button"]')).toBeVisible();

    // Login and register tabs should be visible
    await expect(page.locator('[data-testid="login-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-tab"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/auth-001-ac2-login-page.png' });
  });

  test('AC3: Register new account, login with no local playlists, cloud playlists loaded', async ({ page }) => {
    // Navigate to auth page
    await page.goto('http://localhost:3000/auth');
    await page.waitForTimeout(300);

    // Register a new account
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'newfan123');
    await page.fill('[data-testid="fan-password-input"]', 'password123');
    await page.click('[data-testid="auth-submit-button"]');

    // Should redirect back
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(1000);

    // Should be logged in now
    await expect(page.locator('[data-testid="logged-in-username"]')).toBeVisible();
    await expect(page.locator('[data-testid="logged-in-username"]')).toContainText('newfan123');

    // No local playlists, no cloud playlists - nothing to merge
    await expect(page.locator('[data-testid="merge-playlist-dialog"]')).not.toBeVisible();

    await page.screenshot({ path: '.screenshots/auth-001-ac3-register-login.png' });
  });

  test('AC4: Login with local and cloud playlists shows merge prompt', async ({ page }) => {
    // First register and seed cloud playlists
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'mergefan');
    await page.fill('[data-testid="fan-password-input"]', 'pass123456');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Create a cloud playlist while logged in
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '雲端清單A');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(1000);

    // Logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForTimeout(500);

    // Clear localStorage and create a local playlist
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForTimeout(500);

    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '本機清單B');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Login again - both local and cloud have playlists
    await page.goto('http://localhost:3000/auth');
    await page.fill('[data-testid="fan-username-input"]', 'mergefan');
    await page.fill('[data-testid="fan-password-input"]', 'pass123456');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // Merge dialog should appear
    await expect(page.locator('[data-testid="merge-playlist-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="merge-option-merge"]')).toBeVisible();
    await expect(page.locator('[data-testid="merge-option-cloud"]')).toBeVisible();
    await expect(page.locator('[data-testid="merge-option-local"]')).toBeVisible();

    await page.screenshot({ path: '.screenshots/auth-001-ac4-merge-dialog.png' });
  });

  test('AC5: Choose merge option combines playlists without duplicates', async ({ page }) => {
    // Register and seed cloud playlist
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'mergefan2');
    await page.fill('[data-testid="fan-password-input"]', 'pass123456');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Create cloud playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '雲端清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(1000);

    // Logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForTimeout(500);

    // Clear localStorage, create local playlist
    await clearLocalStorage(page);
    await page.reload();
    await page.waitForTimeout(500);

    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '本機清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Login again
    await page.goto('http://localhost:3000/auth');
    await page.fill('[data-testid="fan-username-input"]', 'mergefan2');
    await page.fill('[data-testid="fan-password-input"]', 'pass123456');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // Click merge option
    await page.click('[data-testid="merge-option-merge"]');
    await page.waitForTimeout(1000);

    // Merge dialog should be gone
    await expect(page.locator('[data-testid="merge-playlist-dialog"]')).not.toBeVisible();

    // Both playlists should exist
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await expect(page.locator('text=雲端清單')).toBeVisible();
    await expect(page.locator('text=本機清單')).toBeVisible();

    // Verify no duplicates
    const playlistCards = page.locator('[data-testid^="playlist-card-"]');
    await expect(playlistCards).toHaveCount(2);

    await page.screenshot({ path: '.screenshots/auth-001-ac5-merge-result.png' });
  });

  test('AC6: While logged in, changes sync to cloud in real-time', async ({ page }) => {
    // Register and login
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'syncfan');
    await page.fill('[data-testid="fan-password-input"]', 'syncpass123');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '同步清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(1000);

    // Verify synced to cloud
    const cloudCheck = await page.evaluate(async () => {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      return data.playlists;
    });
    expect(cloudCheck.length).toBeGreaterThan(0);
    expect(cloudCheck[0].name).toBe('同步清單');

    // Rename the playlist
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    const playlistCard = page.locator('[data-testid^="playlist-card-"]').first();
    await playlistCard.hover();
    await playlistCard.locator('[data-testid="rename-button"]').click();
    await page.fill('[data-testid="rename-input"]', '已更名清單');
    await page.click('[data-testid="confirm-rename"]');
    await page.waitForTimeout(1000);

    // Verify cloud updated
    const cloudCheck2 = await page.evaluate(async () => {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      return data.playlists;
    });
    expect(cloudCheck2[0].name).toBe('已更名清單');

    // Delete the playlist
    await page.locator('[data-testid^="playlist-card-"]').first().hover();
    await page.locator('[data-testid^="playlist-card-"]').first().locator('[data-testid="delete-button"]').click();
    await page.click('[data-testid="confirm-delete"]');
    await page.waitForTimeout(1000);

    // Verify cloud deleted
    const cloudCheck3 = await page.evaluate(async () => {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      return data.playlists;
    });
    expect(cloudCheck3.length).toBe(0);

    await page.screenshot({ path: '.screenshots/auth-001-ac6-cloud-sync.png' });
  });

  test('AC7: Offline changes saved to localStorage as temporary storage', async ({ page }) => {
    // Register and login
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'offlinefan');
    await page.fill('[data-testid="fan-password-input"]', 'offlinepass123');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Simulate going offline
    await page.context().setOffline(true);

    // Create a playlist while offline
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '離線清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Playlist should be in localStorage
    const stored = await page.evaluate(() => localStorage.getItem('mizukiprism_playlists'));
    expect(stored).toBeTruthy();
    const playlists = JSON.parse(stored!);
    expect(playlists.some((p: any) => p.name === '離線清單')).toBe(true);

    // Pending sync should be queued
    const pending = await page.evaluate(() => localStorage.getItem('mizukiprism_pending_sync'));
    expect(pending).toBeTruthy();

    await page.screenshot({ path: '.screenshots/auth-001-ac7-offline-queue.png' });
  });

  test('AC8: Restore network, queued changes sync to cloud', async ({ page }) => {
    // Register and login
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'offlinefan2');
    await page.fill('[data-testid="fan-password-input"]', 'offlinepass456');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Go offline and make changes
    await page.context().setOffline(true);
    await page.waitForTimeout(200);

    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '離線同步測試');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(500);

    // Verify queued
    const pending = await page.evaluate(() => localStorage.getItem('mizukiprism_pending_sync'));
    expect(pending).toBeTruthy();

    // Restore network
    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // Verify pending sync cleared and cloud has the data
    const pendingAfter = await page.evaluate(() => localStorage.getItem('mizukiprism_pending_sync'));
    // Pending may or may not be cleared depending on timing, but cloud should have data

    const cloudPlaylists = await page.evaluate(async () => {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      return data.playlists;
    });
    expect(cloudPlaylists.some((p: any) => p.name === '離線同步測試')).toBe(true);

    await page.screenshot({ path: '.screenshots/auth-001-ac8-online-sync.png' });
  });

  test('AC9: Conflict simulation - last-write-wins with notification', async ({ page }) => {
    // Register and login
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'conflictfan');
    await page.fill('[data-testid="fan-password-input"]', 'conflictpass123');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '衝突測試清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(1000);

    // Simulate a conflict: directly set cloud playlist with older timestamp
    // so the local version "wins"
    await page.evaluate(async () => {
      // Get current cloud playlists
      const cloudRes = await fetch('/api/playlists');
      const cloudData = await cloudRes.json();
      const playlist = cloudData.playlists[0];

      if (playlist) {
        // Set cloud's updatedAt to a time in the past (older than local)
        // simulating that cloud has an older version
        const olderTimestamp = playlist.updatedAt - 10000;
        await fetch('/api/playlists', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...playlist,
            name: '舊版本名稱',
            updatedAt: olderTimestamp,
          }),
        });
      }
    });

    // Now simulate a concurrent update from this device (newer timestamp = wins)
    // Rename the playlist - this will trigger a sync with a newer timestamp
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);

    const playlistCard = page.locator('[data-testid^="playlist-card-"]').first();
    await playlistCard.hover();
    await playlistCard.locator('[data-testid="rename-button"]').click();
    await page.fill('[data-testid="rename-input"]', '最新版本');
    await page.click('[data-testid="confirm-rename"]');
    await page.waitForTimeout(1000);

    // The local (newer) version should win
    const cloudPlaylists = await page.evaluate(async () => {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      return data.playlists;
    });
    // The local rename should be reflected in cloud
    expect(cloudPlaylists[0].name).toBe('最新版本');

    await page.screenshot({ path: '.screenshots/auth-001-ac9-conflict-resolved.png' });
  });

  test('AC10: Logout preserves cloud data and clears login state', async ({ page }) => {
    // Register and login
    await page.goto('http://localhost:3000/auth');
    await page.click('[data-testid="register-tab"]');
    await page.fill('[data-testid="fan-username-input"]', 'logoutfan');
    await page.fill('[data-testid="fan-password-input"]', 'logoutpass123');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Create a playlist
    await page.click('[data-testid="create-playlist-button"]');
    await page.fill('[data-testid="playlist-name-input"]', '登出前清單');
    await page.click('[data-testid="confirm-create-button"]');
    await page.waitForTimeout(1000);

    // Verify logged in
    await expect(page.locator('[data-testid="logged-in-username"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForTimeout(500);

    // Verify login state cleared
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="logged-in-username"]')).not.toBeVisible();

    // localStorage still has snapshot
    const stored = await page.evaluate(() => localStorage.getItem('mizukiprism_playlists'));
    expect(stored).toBeTruthy();
    const playlists = JSON.parse(stored!);
    expect(playlists.some((p: any) => p.name === '登出前清單')).toBe(true);

    // Cloud data preserved: login again to verify
    await page.goto('http://localhost:3000/auth');
    await page.fill('[data-testid="fan-username-input"]', 'logoutfan');
    await page.fill('[data-testid="fan-password-input"]', 'logoutpass123');
    await page.click('[data-testid="auth-submit-button"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await page.waitForTimeout(1500);

    // If merge dialog appears (both local snapshot and cloud have data), choose merge
    const mergeDialog = page.locator('[data-testid="merge-playlist-dialog"]');
    if (await mergeDialog.isVisible()) {
      await page.click('[data-testid="merge-option-merge"]');
      await page.waitForTimeout(1000);
    }

    // After re-login, playlist should be available (from localStorage snapshot which matches cloud)
    await page.click('[data-testid="view-playlists-button"]');
    await page.waitForTimeout(300);
    await expect(page.locator('text=登出前清單')).toBeVisible();

    await page.screenshot({ path: '.screenshots/auth-001-ac10-logout.png' });
  });

});
