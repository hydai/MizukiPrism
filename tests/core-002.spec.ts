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

    // Count song cards (should be 5 songs from data)
    const cardCount = await songCards.count();
    expect(cardCount).toBe(5);

    // Verify first song card shows required information
    const firstCard = songCards.first();
    await expect(firstCard).toContainText('Betelgeuse'); // First alphabetically
    await expect(firstCard).toContainText('Yuuri'); // Original artist
    await expect(firstCard).toContainText('1 個版本'); // Version count

    // Verify songs are sorted alphabetically
    const songTitles = await songCards.allTextContents();
    // Extract actual titles from the card content
    const titles = [];
    for (let i = 0; i < cardCount; i++) {
      const card = songCards.nth(i);
      const titleElement = card.locator('h3');
      titles.push(await titleElement.textContent());
    }

    // Expected order based on Traditional Chinese stroke order / alphabetical
    // Betelgeuse, First Love, Idol, KICK BACK, Plastic Love
    expect(titles[0]).toBe('Betelgeuse (ベテルギウス)');
    expect(titles[1]).toBe('First Love');
    expect(titles[2]).toBe('Idol (アイドル)');
    expect(titles[3]).toBe('KICK BACK');
    expect(titles[4]).toBe('Plastic Love');
  });

  test('AC4: Click song card with multiple versions shows expanded versions sorted by date', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Find and click "Idol" song card (has 3 versions)
    const songCards = page.getByTestId('song-card');
    let idolCard = null;
    for (let i = 0; i < await songCards.count(); i++) {
      const card = songCards.nth(i);
      const text = await card.textContent();
      if (text?.includes('Idol')) {
        idolCard = card;
        break;
      }
    }

    expect(idolCard).not.toBeNull();
    await idolCard!.click();

    // Wait for expansion
    await page.waitForTimeout(300);

    // Verify versions list is visible
    const versionsList = idolCard!.getByTestId('versions-list');
    await expect(versionsList).toBeVisible();

    // Verify all version rows are visible
    const versionRows = versionsList.getByTestId('version-row');
    const versionCount = await versionRows.count();
    expect(versionCount).toBe(3);

    // Verify versions are sorted by date descending (newest first)
    const dates = [];
    for (let i = 0; i < versionCount; i++) {
      const row = versionRows.nth(i);
      const dateText = await row.locator('span.font-mono').first().textContent();
      dates.push(dateText);
    }

    expect(dates[0]).toBe('2024-02-14'); // Newest
    expect(dates[1]).toBe('2023-12-31');
    expect(dates[2]).toBe('2023-05-01'); // Oldest

    // Verify each version shows stream date and title
    const firstVersion = versionRows.first();
    await expect(firstVersion).toContainText('2024-02-14');
    await expect(firstVersion).toContainText('情人節特輯');
  });

  test('AC5: Click same song card again collapses version list', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Find "First Love" song card (has 2 versions)
    const songCards = page.getByTestId('song-card');
    let firstLoveCardIndex = -1;
    for (let i = 0; i < await songCards.count(); i++) {
      const card = songCards.nth(i);
      const text = await card.textContent();
      if (text?.includes('First Love')) {
        firstLoveCardIndex = i;
        break;
      }
    }

    expect(firstLoveCardIndex).toBeGreaterThanOrEqual(0);
    const firstLoveCard = songCards.nth(firstLoveCardIndex);

    // Get the header button specifically (not the entire card)
    const headerButton = firstLoveCard.locator('button').first();

    // Click to expand
    await headerButton.click();
    await page.waitForTimeout(300);

    // Verify versions list is visible
    await expect(firstLoveCard.getByTestId('versions-list')).toBeVisible();

    // Click again to collapse
    await headerButton.click();
    await page.waitForTimeout(300);

    // Verify versions list is no longer visible (should not exist in DOM)
    await expect(firstLoveCard.getByTestId('versions-list')).toHaveCount(0);
  });

  test('AC6: Click song card with single version shows that version', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Switch to grouped view
    await page.getByTestId('view-toggle-grouped').click();
    await page.waitForTimeout(300);

    // Find "KICK BACK" song card (has only 1 version)
    const songCards = page.getByTestId('song-card');
    let kickBackCard = null;
    for (let i = 0; i < await songCards.count(); i++) {
      const card = songCards.nth(i);
      const text = await card.textContent();
      if (text?.includes('KICK BACK')) {
        kickBackCard = card;
        break;
      }
    }

    expect(kickBackCard).not.toBeNull();

    // Verify it shows "1 個版本"
    await expect(kickBackCard!).toContainText('1 個版本');

    // Click to expand
    await kickBackCard!.click();
    await page.waitForTimeout(300);

    // Verify versions list is visible
    const versionsList = kickBackCard!.getByTestId('versions-list');
    await expect(versionsList).toBeVisible();

    // Verify exactly 1 version row is visible
    const versionRows = versionsList.getByTestId('version-row');
    const versionCount = await versionRows.count();
    expect(versionCount).toBe(1);

    // Verify the single version shows correct information
    const versionRow = versionRows.first();
    await expect(versionRow).toContainText('2023-09-09');
    await expect(versionRow).toContainText('深夜的暴走卡拉OK');
    await expect(versionRow).toContainText('喉嚨極限挑戰');
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

    // Verify performances are sorted by date descending
    const firstRow = performanceRows.first();
    await expect(firstRow).toContainText('Idol'); // Newest performance is Idol on 2024-02-14
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
