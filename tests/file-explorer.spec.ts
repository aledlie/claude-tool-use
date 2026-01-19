import { test, expect } from '@playwright/test';

test.describe('File Explorer UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/index.html');
    // Wait for JavaScript to initialize
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.file-card');
      return cards.length > 0;
    }, { timeout: 5000 });
  });

  test('loads with correct title and header', async ({ page }) => {
    await expect(page).toHaveTitle('Repository File Explorer');
    await expect(page.locator('.app-bar h1')).toHaveText('Repository File Explorer');
    await expect(page.locator('.app-bar .subtitle')).toHaveText('claude-tool-use');
  });

  test('displays initial stats', async ({ page }) => {
    // Wait a bit for stats to calculate
    await page.waitForTimeout(200);

    const folderCount = await page.locator('#folderCount').textContent();
    const fileCount = await page.locator('#fileCount').textContent();

    expect(parseInt(folderCount || '0')).toBeGreaterThan(0);
    expect(parseInt(fileCount || '0')).toBeGreaterThan(0);
    await expect(page.locator('#totalSize')).toBeVisible();
  });

  test('shows grid view by default with file cards', async ({ page }) => {
    const fileCards = page.locator('.file-card');
    await expect(fileCards.first()).toBeVisible();

    const count = await fileCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('tree view hidden by default', async ({ page }) => {
    await expect(page.locator('#treeView')).toHaveCSS('display', 'none');
  });

  test('switches to tree view', async ({ page }) => {
    // Use exposed global function
    await page.evaluate(() => {
      (window as any).setView('tree');
    });
    await page.waitForTimeout(200);

    // Tree view should now be visible
    const treeView = page.locator('#treeView');
    await expect(treeView).not.toHaveCSS('display', 'none');

    // Should have tree items
    const treeItems = page.locator('.tree-item');
    const count = await treeItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('tree button becomes active when clicked', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).setView('tree');
    });
    await page.waitForTimeout(100);

    await expect(page.locator('.filter-btn[data-view="tree"]')).toHaveClass(/active/);
  });

  test('search filters content', async ({ page }) => {
    // Get initial count
    const initialCards = await page.locator('.file-card').count();

    // Search for something that won't match everything
    await page.fill('#searchInput', 'xyznonexistent123');
    await page.waitForTimeout(200);

    // Should show empty state
    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No matching files found');
  });

  test('clicking folder card navigates', async ({ page }) => {
    // Get initial breadcrumb
    const initialBreadcrumb = await page.locator('#breadcrumb').textContent();

    // Click the first file card (which should be a folder - folders come first)
    await page.locator('.file-card').first().click();
    await page.waitForTimeout(200);

    // Breadcrumb should have changed
    const newBreadcrumb = await page.locator('#breadcrumb').textContent();
    expect(newBreadcrumb).not.toBe(initialBreadcrumb);
  });

  test('breadcrumb root click returns to root', async ({ page }) => {
    // Navigate into a folder
    await page.locator('.file-card').first().click();
    await page.waitForTimeout(200);

    // Click root
    await page.locator('.breadcrumb-item').first().click();
    await page.waitForTimeout(200);

    // Should be back at root - breadcrumb should contain only "/"
    const breadcrumbText = await page.locator('#breadcrumb').textContent();
    expect(breadcrumbText?.trim()).toBe('/');
  });

  test('detail panel opens and closes', async ({ page }) => {
    // Navigate to find files
    await page.locator('.file-card').first().click();
    await page.waitForTimeout(100);

    // Keep navigating until we find a file (check for file-icon.file class)
    let attempts = 0;
    while (attempts < 5) {
      const fileIcon = page.locator('.file-card .file-icon.file').first();
      if (await fileIcon.isVisible()) {
        // Click the parent file-card
        await fileIcon.locator('..').locator('..').click();
        break;
      }
      // Navigate deeper
      const folder = page.locator('.file-card').first();
      if (await folder.isVisible()) {
        await folder.click();
        await page.waitForTimeout(100);
      }
      attempts++;
    }

    // Panel should be open
    await expect(page.locator('#detailPanel')).toHaveClass(/open/);

    // Close it
    await page.locator('.detail-close').click();
    await page.waitForTimeout(100);

    await expect(page.locator('#detailPanel')).not.toHaveClass(/open/);
  });
});
