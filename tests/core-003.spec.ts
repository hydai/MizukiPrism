import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

const screenshotsDir = path.join(process.cwd(), '.screenshots');

function screenshotPath(name: string): string {
  return path.join(screenshotsDir, `core-003-${name}.png`);
}

test.describe('CORE-003: Search & Filter', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Ensure we start in timeline view
    await page.click('[data-testid="view-toggle-timeline"]');
  });

  test('AC1: Search by song name filters results instantly (min 1 char, case-insensitive, fuzzy)', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');

    // Type one character and verify filtering happens
    await searchInput.fill('F');
    const rows = page.getByTestId('performance-row');
    const count1 = await rows.count();
    expect(count1).toBeGreaterThan(0);

    // All visible rows should have 'f' somewhere in them (case-insensitive)
    const allContents = await rows.allTextContents();
    for (const content of allContents) {
      expect(content.toLowerCase()).toContain('f');
    }

    // Type full song name "First Love"
    await searchInput.fill('First Love');
    const filteredRows = page.getByTestId('performance-row');
    const count2 = await filteredRows.count();
    expect(count2).toBeGreaterThan(0);
    expect(count2).toBeLessThan(8); // Should be fewer than all songs

    // Verify the result contains "First Love"
    const firstRowText = await filteredRows.first().textContent();
    expect(firstRowText?.toLowerCase()).toContain('first love');

    await page.screenshot({ path: screenshotPath('ac1-search-by-name') });
  });

  test('AC2: Clear search input restores full song list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    const allRows = page.getByTestId('performance-row');

    // Get total count initially
    const totalCount = await allRows.count();

    // Search for something
    await searchInput.fill('First Love');
    const filteredCount = await allRows.count();
    expect(filteredCount).toBeLessThan(totalCount);

    // Clear the search
    await searchInput.clear();
    const restoredCount = await allRows.count();
    expect(restoredCount).toBe(totalCount);

    await page.screenshot({ path: screenshotPath('ac2-clear-search') });
  });

  test('AC3: Search by original artist name filters results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');

    // Search by artist name "宇多田光"
    await searchInput.fill('宇多田光');

    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All results should be songs by 宇多田光
    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text).toContain('宇多田光');
    }

    await page.screenshot({ path: screenshotPath('ac3-search-by-artist') });
  });

  test('AC4: Artist dropdown filter shows only songs by that artist', async ({ page }) => {
    const artistFilter = page.getByTestId('artist-filter');

    // Verify the dropdown exists and has options
    await expect(artistFilter).toBeVisible();

    // Select an artist
    await artistFilter.selectOption('宇多田光');

    // Verify only songs by that artist are shown
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text).toContain('宇多田光');
    }

    // Verify songs by other artists are not shown
    const nonArtistRows = rows.filter({ hasText: 'YOASOBI' });
    expect(await nonArtistRows.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac4-artist-filter') });
  });

  test('AC5: Date range filter shows only performances within range', async ({ page }) => {
    const dateFrom = page.getByTestId('date-from');
    const dateTo = page.getByTestId('date-to');

    // Set date range: 2023-10-01 to 2023-12-31
    await dateFrom.fill('2023-10-01');
    await dateTo.fill('2023-12-31');

    // Verify only performances within date range are shown
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Get dates from the date cells (font-mono with date format)
    const dateCells = await page.locator('div.font-mono').filter({ hasText: /^\d{4}-\d{2}-\d{2}$/ }).allTextContents();
    for (const dateText of dateCells) {
      expect(dateText >= '2023-10-01').toBe(true);
      expect(dateText <= '2023-12-31').toBe(true);
    }

    await page.screenshot({ path: screenshotPath('ac5-date-range') });
  });

  test('AC6: Tag filter shows only songs with that tag', async ({ page }) => {
    // Click the "動漫歌" tag
    const animeSongTag = page.getByRole('button', { name: '#動漫歌' });
    await expect(animeSongTag).toBeVisible();
    await animeSongTag.click();

    // Verify only songs with 動漫歌 tag are shown
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Verify songs with 動漫歌 tag appear (YOASOBI or KICK BACK)
    const allTexts = await rows.allTextContents();
    const hasAnimeSongs = allTexts.some(text =>
      text.includes('Idol') || text.includes('KICK BACK')
    );
    expect(hasAnimeSongs).toBe(true);

    // Verify songs without 動漫歌 tag are hidden (e.g., "First Love")
    const nonAnimeRows = rows.filter({ hasText: 'First Love' });
    expect(await nonAnimeRows.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac6-tag-filter') });
  });

  test('AC7: Search text + tag filter applied simultaneously (AND logic)', async ({ page }) => {
    // Apply tag filter "動漫歌"
    await page.getByRole('button', { name: '#動漫歌' }).click();

    // Also type search "Idol"
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    await searchInput.fill('Idol');

    // Only songs matching BOTH criteria should show
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All results should contain "Idol"
    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text.toLowerCase()).toContain('idol');
    }

    // "KICK BACK" has 動漫歌 tag but doesn't match "Idol" search, so it should not appear
    const kickBackRows = rows.filter({ hasText: 'KICK BACK' });
    expect(await kickBackRows.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac7-search-and-tag') });
  });

  test('AC8: No results shows "找不到符合條件的歌曲" with clear filter suggestion', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜尋歌曲...');

    // Search for something that doesn't exist
    await searchInput.fill('xyznonexistent');

    // Verify empty state message
    await expect(page.getByText('找不到符合條件的歌曲')).toBeVisible();

    // Verify there's a clear filter button
    const clearButton = page.getByTestId('clear-filters-empty');
    await expect(clearButton).toBeVisible();

    // Click clear to verify it restores the list
    await clearButton.click();
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: screenshotPath('ac8-no-results-empty-state') });
  });

  test('AC9: Search works in grouped view', async ({ page }) => {
    // Switch to grouped view
    await page.click('[data-testid="view-toggle-grouped"]');

    // Enter search term
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    await searchInput.fill('First Love');

    // Verify song cards are filtered
    const songCards = page.getByTestId('song-card');
    const count = await songCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify "First Love" appears
    await expect(songCards.filter({ hasText: 'First Love' })).toHaveCount(1);

    // Verify other songs are hidden
    const otherSongs = songCards.filter({ hasText: 'KICK BACK' });
    expect(await otherSongs.count()).toBe(0);

    await page.screenshot({ path: screenshotPath('ac9-grouped-view-search') });
  });

  test('AC10: Search works in timeline view', async ({ page }) => {
    // Ensure we are in timeline view
    await expect(page.getByTestId('view-toggle-timeline')).toBeVisible();

    // Enter search term
    const searchInput = page.getByPlaceholder('搜尋歌曲...');
    await searchInput.fill('First Love');

    // Verify timeline rows are filtered
    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // All visible rows should contain "First Love"
    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text.toLowerCase()).toContain('first love');
    }

    // Switch to timeline view explicitly (ensure it works)
    await page.click('[data-testid="view-toggle-grouped"]');
    await page.click('[data-testid="view-toggle-timeline"]');

    // Search should persist
    const rowsAfterSwitch = page.getByTestId('performance-row');
    const countAfterSwitch = await rowsAfterSwitch.count();
    expect(countAfterSwitch).toBe(count);

    await page.screenshot({ path: screenshotPath('ac10-timeline-view-search') });
  });

  test('AC11: Mobile search input accessible via BottomNav Search tab', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    // The sidebar itself is hidden on mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();

    // BottomNav should be visible
    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    // Click the Search tab in BottomNav
    await page.locator('[data-testid="bottom-nav-search"]').click();
    await page.waitForTimeout(300);

    // Mobile search input should now be visible in the Search tab
    const mobileSearch = page.locator('[data-testid="mobile-search-input"]');
    await expect(mobileSearch).toBeVisible();

    // Mobile search should filter results
    await mobileSearch.fill('First Love');
    await page.waitForTimeout(300);

    const rows = page.getByTestId('performance-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    const allTexts = await rows.allTextContents();
    for (const text of allTexts) {
      expect(text.toLowerCase()).toContain('first love');
    }

    await page.screenshot({ path: screenshotPath('ac11-mobile-search') });
  });

  test('Clear all filters button resets all filter states', async ({ page }) => {
    // Apply multiple filters
    await page.getByTestId('artist-filter').selectOption('宇多田光');
    await page.getByTestId('date-from').fill('2023-01-01');
    await page.getByRole('button', { name: '#抒情' }).click();

    // Verify the clear all button appears
    const clearAllButton = page.getByTestId('clear-all-filters');
    await expect(clearAllButton).toBeVisible();

    // Get current filtered count
    const filteredRows = page.getByTestId('performance-row');
    const filteredCount = await filteredRows.count();

    // Click clear all
    await clearAllButton.click();

    // Verify all filters are cleared and full list is shown
    const allRows = page.getByTestId('performance-row');
    const totalCount = await allRows.count();
    expect(totalCount).toBeGreaterThan(filteredCount);

    // Verify the clear all button is hidden
    await expect(clearAllButton).toBeHidden();

    await page.screenshot({ path: screenshotPath('clear-all-filters') });
  });

});
