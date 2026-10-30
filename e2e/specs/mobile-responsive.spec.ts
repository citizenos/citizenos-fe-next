import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE (375x667)', width: 375, height: 667 },
  { name: 'iPhone 5 / Narrow (320x568)', width: 320, height: 568 },
];

test.describe('Mobile Responsive Layout & Z-Index Hierarchy', () => {
  // Use public context without saved credentials to test unauthenticated mobile elements
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const vp of MOBILE_VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      test('should have zero horizontal scroll overflow on home page', async ({ page }) => {
        await page.goto(route(''));
        await waitForApp(page);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('should have zero horizontal scroll overflow on public topics page', async ({ page }) => {
        await page.goto(route('public/topics'));
        await waitForApp(page);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('mobile nav-bar Login and Sign Up buttons should fit within screen bounds', async ({ page }) => {
        await page.goto(route(''));
        await waitForApp(page);

        const mobileLoginBar = page.locator('#mobile_login');
        await expect(mobileLoginBar).toBeVisible();

        const buttons = mobileLoginBar.locator('button');
        const count = await buttons.count();
        expect(count).toBeGreaterThanOrEqual(2);

        for (let i = 0; i < count; i++) {
          const btn = buttons.nth(i);
          await expect(btn).toBeVisible();

          const box = await btn.boundingBox();
          expect(box).not.toBeNull();
          if (box) {
            // Button must start within screen and not exceed viewport width
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1); // allow 1px rounding tolerance
          }
        }
      });

      test('login dialog and its action buttons should fit within screen width without overflow', async ({ page }) => {
        await page.goto(route(''));
        await waitForApp(page);

        // Click the Login button from mobile nav bar
        const loginBtn = page.locator('#mobile_login button').first();
        await expect(loginBtn).toBeVisible();
        await loginBtn.click();

        const loginDialog = page.locator('app-login-dialog');
        await expect(loginDialog).toBeVisible();

        // Check dialog card boundary
        const dialogCard = loginDialog.locator('.dialog-card, .auth-dialog-card').first();
        const cardBox = await dialogCard.boundingBox();
        expect(cardBox).not.toBeNull();
        if (cardBox) {
          expect(cardBox.x).toBeGreaterThanOrEqual(0);
          expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Check OAuth action buttons inside login form
        const oauthBtns = loginDialog.locator('.auth-icon-btn, .oauth-btn');
        const oauthCount = await oauthBtns.count();
        for (let i = 0; i < oauthCount; i++) {
          const obtn = oauthBtns.nth(i);
          const obox = await obtn.boundingBox();
          if (obox) {
            expect(obox.x).toBeGreaterThanOrEqual(0);
            expect(obox.x + obox.width).toBeLessThanOrEqual(vp.width + 1);
          }
        }

        // Check submit button
        const submitBtn = loginDialog.locator('button[type="submit"], cos-button button').first();
        const submitBox = await submitBtn.boundingBox();
        if (submitBox) {
          expect(submitBox.x).toBeGreaterThanOrEqual(0);
          expect(submitBox.x + submitBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Ensure no horizontal scroll is caused by open modal
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('mobile filter toolbar and dropdowns should have correct z-index and not overflow', async ({ page }) => {
        await page.goto(route('public/topics'));
        await waitForApp(page);

        const filterToolbar = page.locator('app-list-filter-toolbar');
        if (await filterToolbar.isVisible()) {
          // Check that dropdown or mobile filter section fits within screen
          const box = await filterToolbar.boundingBox();
          if (box) {
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
          }

          // Check cos-dropdown z-index stacking hierarchy
          const dropdowns = filterToolbar.locator('cos-dropdown');
          const ddCount = await dropdowns.count();
          if (ddCount > 0) {
            const firstDd = dropdowns.first();
            const selection = firstDd.locator('.dropdown-selection');
            if (await selection.isVisible()) {
              await selection.click();
              const options = firstDd.locator('.dropdown-options');
              if (await options.isVisible()) {
                const zIndex = await options.evaluate((el) => {
                  return window.getComputedStyle(el).zIndex;
                });
                // cos-dropdown options must have z-index >= 150
                expect(parseInt(zIndex, 10)).toBeGreaterThanOrEqual(150);

                const optBox = await options.boundingBox();
                if (optBox) {
                  expect(optBox.x).toBeGreaterThanOrEqual(0);
                  expect(optBox.x + optBox.width).toBeLessThanOrEqual(vp.width + 1);
                }
              }
            }
          }
        }
      });

      test('mobile discussion filter drawer (.mobile_filters_wrap) should stack with higher z-index than bottom tabs and footer', async ({ page }) => {
        // Evaluate the CSS stacking hierarchy defined for mobile tabs, bottom nav, and mobile filter sheet
        await page.goto(route(''));
        await waitForApp(page);

        const zIndices = await page.evaluate(() => {
          const testContainer = document.createElement('div');
          testContainer.id = 'z-index-audit-container';
          testContainer.innerHTML = `
            <div class="topic_tabs tablet"></div>
            <div class="mobile_filters_wrap active"></div>
            <div id="mobile_login"></div>
            <cos-dropdown class="open"><div class="dropdown-options"></div></cos-dropdown>
          `;
          document.body.appendChild(testContainer);

          const tabletTabs = testContainer.querySelector('.topic_tabs.tablet') as HTMLElement;
          const filterWrap = testContainer.querySelector('.mobile_filters_wrap') as HTMLElement;
          const mobileLogin = testContainer.querySelector('#mobile_login') as HTMLElement;
          const ddOptions = testContainer.querySelector('.dropdown-options') as HTMLElement;

          const getZ = (el: HTMLElement) => {
            const val = window.getComputedStyle(el).zIndex;
            return isNaN(parseInt(val, 10)) ? 0 : parseInt(val, 10);
          };

          const result = {
            tabletTabs: getZ(tabletTabs),
            filterWrap: getZ(filterWrap),
            mobileLogin: getZ(mobileLogin),
            ddOptions: getZ(ddOptions),
          };

          testContainer.remove();
          return result;
        });

        // Hierarchy rule:
        // .mobile_filters_wrap (slide-up drawer) must stack ABOVE .topic_tabs.tablet and #mobile_login
        // so drawer is never obscured by the fixed bottom bars.
        if (zIndices.filterWrap > 0 && zIndices.tabletTabs > 0) {
          expect(zIndices.filterWrap).toBeGreaterThan(zIndices.tabletTabs);
        }
        if (zIndices.filterWrap > 0 && zIndices.mobileLogin > 0) {
          expect(zIndices.filterWrap).toBeGreaterThan(zIndices.mobileLogin);
        }
      });
    });
  }
});
