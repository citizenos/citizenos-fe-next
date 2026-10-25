import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Account Profile & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(route('account'));
    await waitForApp(page);
  });

  test('should display account profile page with user details', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/account/);

    const nameInput = page.locator('input#name');
    const emailInput = page.locator('input#email');
    const companyInput = page.locator('input#company');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(companyInput).toBeVisible();

    // The name field should contain the current user's name
    const nameVal = await nameInput.inputValue();
    expect(nameVal.length).toBeGreaterThan(0);
  });

  test('should toggle password reset fields', async ({ page }) => {
    const newPasswordInput = page.locator('input#newPassword');
    const confirmPasswordInput = page.locator('input#password_confirm');

    // Initially password reset fields should not be present
    await expect(newPasswordInput).toBeHidden();
    await expect(confirmPasswordInput).toBeHidden();

    // Click toggle button
    const resetPasswordBtn = page.locator('button.btn_link').filter({ hasText: /Reset password/i });
    await expect(resetPasswordBtn).toBeVisible();
    await resetPasswordBtn.click();

    // Now they should be visible
    await expect(newPasswordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();

    // Toggle back
    await resetPasswordBtn.click();
    await expect(newPasswordInput).toBeHidden();
  });

  test('should switch between Profile and Notifications tabs', async ({ page }) => {
    const profileTabBtn = page.locator('.tabs_row button.tab_item').first();
    const notificationsTabBtn = page.locator('.tabs_row button.tab_item').nth(1);

    await expect(profileTabBtn).toHaveClass(/active/);

    // Switch to notifications tab
    await notificationsTabBtn.click();
    await expect(notificationsTabBtn).toHaveClass(/active/);
    await expect(profileTabBtn).not.toHaveClass(/active/);

    // Notifications section should be visible
    const notificationsHeading = page.locator('.profile_area_section h2.small_heading');
    await expect(notificationsHeading).toBeVisible();

    // Switch back to profile tab
    await profileTabBtn.click();
    await expect(profileTabBtn).toHaveClass(/active/);
    await expect(page.locator('input#name')).toBeVisible();
  });

  test('should display preferences including search visibility and language', async ({ page }) => {
    // Show in search toggle
    const toggle = page.locator('.prefrence_box cos-toggle').first();
    await expect(toggle).toBeVisible();

    // Language dropdown
    const langDropdown = page.locator('.prefrence_box cos-dropdown.toolbar-dropdown');
    await expect(langDropdown).toBeVisible();

    // Terms links
    const terms = page.locator('cos-terms-links');
    await expect(terms).toBeVisible();
  });

  test('should validate profile form input editing', async ({ page }) => {
    const nameInput = page.locator('input#name');
    const originalName = await nameInput.inputValue();

    // Clear and type new name
    await nameInput.fill('');
    await nameInput.fill(`${originalName} Edited`);

    const submitBtn = page.locator('#profile_form button.btn_big_submit');
    await expect(submitBtn).toBeEnabled();

    // Restore original name
    await nameInput.fill(originalName);
  });
});
