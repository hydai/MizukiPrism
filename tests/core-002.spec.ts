import { test, expect } from '@playwright/test';

test.describe('CORE-002: Song Grouped View & Dual View Toggle', () => {

  test.beforeEach(async ({ page }) => {
    // Clear sessionStorage to ensure default state
    await page.goto('http://localhost:3000');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
  });

  test('AC1: View mode toggle in action bar with two options', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify timeline toggle button exists and is visible
    const timelineToggle = page.getByTestId('view-toggle-timeline');
    await expect(timelineToggle).toBeVisible();
    await expect(timelineToggle).toContainText('時間序列');

    // Verify grouped view toggle button exists and is visible
    const groupedToggle = page.getByTestId('view-toggle-grouped');
    await expect(groupedToggle).toBeVisible();
    await expect(groupedToggle).toContainText('歌曲分組');
  });

  test('AC2: Default view on first load is timeline view', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify timeline toggle is active (has gradient background)
    const timelineToggle = page.getByTestId('view-toggle-timeline');
    await expect(timelineToggle).toHaveClass(/from-pink-400/);

    // Verify performance rows are visible (timeline view)
    const performanceRows = page.getByTestId('performance-row');
    await expect(performanceRows.first()).toBeVisible();

    // Verify song cards (grouped view) are NOT visible
    const songCards = page.getByTestId('song-card');
    await expect(songCards.first()).not.toBeVisible();
  });

  test('AC3: Click song-grouped view toggle shows songs grouped alphabetically', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click grouped view toggle
    const groupedToggle = page.getByTestId('view-toggle-grouped');
    await groupedToggle.click();

    // Wait for view to change
    await page.waitForTimeout(300);

    // Verify grouped toggle is now active
    await expect(groupedToggle).toHaveClass(/from-pink-400/);

    // Verify song cards are visible
    const songCards = page.getByTestId('song-card');
    await expect(songCards.first()).toBeVisible();

    // Count song cards (should be 18 songs from real VOD data)
    const cardCount = await songCards.count();
    expect(cardCount).toBe(18);

    // Verify first song card shows required information
    const firstCard = songCards.first();
    await expect(firstCard).toContainText('Dangerous Woman'); // First alphabetically (ASCII sort)
    await expect(firstCard).toContainText('Ariana Grande'); // Original artist
    await expect(firstCard).toContainText('1 個版本'); // Version count

    // Verify songs are sorted alphabetically
    const titles = [];
    for (let i = 0; i < cardCount; i++) {
      const card = songCards.nth(i);
      const titleElement = card.locator('h3');
      titles.push(await titleElement.textContent());
    }

    // Verify alphabetical order for first few (ASCII letters before CJK)
    expect(titles[0]).toBe('Dangerous Woman');
    expect(titles[1]).toBe('Dear');
    expect(titles[2]).toBe('Galaxy Anthem');
    expect(titles[3]).toBe('Havana');
    expect(titles[4]).toBe('Loveit?');
  });

  test('AC4: Click song card shows expanded version sorted by date', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Find and click "Dear" song card (has 1 version)
    const songCards = page.getByTestId('song-card');
    let dearCard = null;
    for (let i = 0; i < await songCards.count(); i++) {
      const card = songCards.nth(i);
      const text = await card.textContent();
      if (text?.includes('Dear')) {
        dearCard = card;
        break;
      }
    }

    expect(dearCard).not.toBeNull();
    await dearCard!.click();

    // Wait for expansion
    await page.waitForTimeout(300);

    // Verify versions list is visible
    const versionsList = dearCard!.getByTestId('versions-list');
    await expect(versionsList).toBeVisible();

    // Verify version row is visible
    const versionRows = versionsList.getByTestId('version-row');
    const versionCount = await versionRows.count();
    expect(versionCount).toBe(1);

    // Verify version shows stream date
    const firstVersion = versionRows.first();
    await expect(firstVersion).toContainText('2025-03-26');
  });

  test('AC5: Click same song card again collapses version list', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Find "Dear" song card
    const songCards = page.getByTestId('song-card');
    let dearCardIndex = -1;
    for (let i = 0; i < await songCards.count(); i++) {
      const card = songCards.nth(i);
      const text = await card.textContent();
      if (text?.includes('Dear')) {
        dearCardIndex = i;
        break;
      }
    }

    expect(dearCardIndex).toBeGreaterThanOrEqual(0);
    const dearCard = songCards.nth(dearCardIndex);

    // Get the header button specifically (not the entire card)
    const headerButton = dearCard.locator('button').first();

    // Click to expand
    await headerButton.click();
    await page.waitForTimeout(300);

    // Verify versions list is visible
    await expect(dearCard.getByTestId('versions-list')).toBeVisible();

    // Click again to collapse
    await headerButton.click();
    await page.waitForTimeout(300);

    // Verify versions list is no longer visible (should not exist in DOM)
    await expect(dearCard.getByTestId('versions-list')).toHaveCount(0);
  });

  test('AC6: Click song card with single version shows that version', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Find "紅蓮華" song card (has only 1 version)
    const songCards = page.getByTestId('song-card');
    let gurengeCard = null;
    for (let i = 0; i < await songCards.count(); i++) {
      const card = songCards.nth(i);
      const text = await card.textContent();
      if (text?.includes('紅蓮華')) {
        gurengeCard = card;
        break;
      }
    }

    expect(gurengeCard).not.toBeNull();

    // Verify it shows "1 個版本"
    await expect(gurengeCard!).toContainText('1 個版本');

    // Click to expand
    await gurengeCard!.click();
    await page.waitForTimeout(300);

    // Verify versions list is visible
    const versionsList = gurengeCard!.getByTestId('versions-list');
    await expect(versionsList).toBeVisible();

    // Verify exactly 1 version row is visible
    const versionRows = versionsList.getByTestId('version-row');
    const versionCount = await versionRows.count();
    expect(versionCount).toBe(1);

    // Verify the single version shows correct information
    const versionRow = versionRows.first();
    await expect(versionRow).toContainText('2025-03-26');
  });

  test('AC7: Switch back to timeline view restores flat timeline list', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for data to load from API
    await page.waitForSelector('[data-testid="performance-row"]', { timeout: 10000 });

    // Remember the initial state
    const initialRows = await page.getByTestId('performance-row').count();

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Verify grouped view is showing
    const songCards = page.getByTestId('song-card');
    await expect(songCards.first()).toBeVisible();

    // Switch back to timeline view
    await page.getByTestId('view-toggle-timeline').click();
    await page.waitForTimeout(300);

    // Verify timeline toggle is active
    const timelineToggle = page.getByTestId('view-toggle-timeline');
    await expect(timelineToggle).toHaveClass(/from-pink-400/);

    // Verify performance rows are visible again
    const performanceRows = page.getByTestId('performance-row');
    await expect(performanceRows.first()).toBeVisible();

    // Verify count matches initial state
    const finalRows = await performanceRows.count();
    expect(finalRows).toBe(initialRows);

    // Verify song cards are not visible
    await expect(songCards.first()).not.toBeVisible();
  });

  test('AC8: View mode preference persists during current session', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify default is timeline view
    let timelineToggle = page.getByTestId('view-toggle-timeline');
    await expect(timelineToggle).toHaveClass(/from-pink-400/);

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Verify grouped view is active
    let groupedToggle = page.getByTestId('view-toggle-grouped');
    await expect(groupedToggle).toHaveClass(/from-pink-400/);

    // Navigate away (simulate by reloading without clearing sessionStorage)
    await page.reload();

    // Verify grouped view is still active after reload
    groupedToggle = page.getByTestId('view-toggle-grouped');
    await expect(groupedToggle).toHaveClass(/from-pink-400/);

    // Verify grouped view is showing
    const songCards = page.getByTestId('song-card');
    await expect(songCards.first()).toBeVisible();

    // Switch to timeline
    await page.getByTestId('view-toggle-timeline').click();
    await page.waitForTimeout(300);

    // Reload again
    await page.reload();

    // Verify timeline view persists
    timelineToggle = page.getByTestId('view-toggle-timeline');
    await expect(timelineToggle).toHaveClass(/from-pink-400/);

    const performanceRows = page.getByTestId('performance-row');
    await expect(performanceRows.first()).toBeVisible();
  });

});
