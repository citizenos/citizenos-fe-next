import { test, expect } from '@playwright/test';

/**
 * Visual Parity Test: Legacy Angular vs Angular 22 (Next)
 * 
 * Töövoog:
 * 1. Genereeri "kuldne standard" vanast rakendusest:
 *    TARGET=legacy npx playwright test e2e/specs/migration-visual-parity.spec.ts --update-snapshots
 * 
 * 2. Võrdle uut rakendust vana piltidega:
 *    TARGET=next npx playwright test e2e/specs/migration-visual-parity.spec.ts
 */

const TARGET = process.env['TARGET'] || 'next';
const LEGACY_URL = process.env['LEGACY_FE_URL'] || 'http://localhost:3000';
const NEXT_URL = process.env['NEXT_FE_URL'] || 'https://localhost:4200';

const BASE_URL = TARGET === 'legacy' ? LEGACY_URL : NEXT_URL;

// Need on lehed, mis EI nõua sisselogimist
const PUBLIC_PAGES = [
  { name: 'home', path: '/' },
  { name: 'public-topics', path: '/public/topics' },
  { name: 'public-groups', path: '/public/groups' },
  { name: 'login', path: '/account/login' } // Vana kasutas /account/login või /?login
];

// Need on lehed, mis NÕUAVAD sisselogimist (nt armatuurlaud, privaatsete teemade vaated)
const AUTH_PAGES = [
  { name: 'dashboard', path: '/dashboard' },
  // Siia saab lisada konkreetseid privaatseid teemasid, nt:
  { name: 'topic-create', path: '/topics/create' },
  // { name: 'topic-view', path: '/topics/5a8e0f6c-8a1a-4d30-b98a-12c8b87d3a77' }
];

test.describe('Visual Parity: Legacy vs Next', () => {
  // Fikseeritud viewport
  test.use({ viewport: { width: 1280, height: 800 } });

  test.describe('Avalikud lehed (ilma sisselogimiseta)', () => {
    for (const pageInfo of PUBLIC_PAGES) {
      test(`Compare page: ${pageInfo.name}`, async ({ page }) => {
        console.log(`[${TARGET.toUpperCase()}] Navigating to: ${BASE_URL}${pageInfo.path}`);
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500); 

        await expect(page).toHaveScreenshot(`${pageInfo.name}-baseline.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.05,
          animations: 'disabled'
        });
      });
    }
  });

  test.describe('Sisselogitud lehed (autenditud)', () => {
    // Enne autenditud lehtede testimist logime sisse
    test.beforeEach(async ({ page }) => {
      const email = process.env['E2E_USER_EMAIL'];
      const password = process.env['E2E_USER_PASSWORD'];

      if (!email || !password) {
        test.skip(!email, 'E2E_USER_EMAIL and E2E_USER_PASSWORD must be set in env');
        return;
      }

      console.log(`[${TARGET.toUpperCase()}] Logging in...`);
      // Uuel on keele prefiks tavaliselt kohustuslik, proovime esmalt kontole minna
      const loginUrl = TARGET === 'legacy' ? `${BASE_URL}/account/login` : `${BASE_URL}/en/account/login`;
      
      await page.goto(loginUrl, { waitUntil: 'networkidle' });
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      
      // Vana kasutab button[type="submit"], uus cos-button[type="submit"]
      const btn = page.locator('button[type="submit"], cos-button[type="submit"]').first();
      await btn.click();

      // Ootame, et url muutuks (jõuaksime armatuurlauale)
      await page.waitForURL(url => !url.pathname.includes('/account/login'), { timeout: 15000 });
      
      // Peidame tuurid/onboardingud, et nad ei rikuks pilti
      await page.evaluate(() => {
        localStorage.setItem('onboarding_topic', 'true');
        localStorage.setItem('onboarding_ideation', 'true');
        localStorage.setItem('onboarding_group', 'true');
        localStorage.setItem('onboarding_dashboard', 'true');
        localStorage.setItem('show-topic-tour', 'true');
        localStorage.setItem('show-ideation-tour', 'true');
        localStorage.setItem('show-dashboard-tour', 'true');
      });
    });

    for (const pageInfo of AUTH_PAGES) {
      test(`Compare auth page: ${pageInfo.name}`, async ({ page }) => {
        // Uuel rakendusel lisame keele, kui see puudub
        const finalPath = (TARGET === 'next' && !pageInfo.path.startsWith('/en/')) 
          ? `/en${pageInfo.path}` 
          : pageInfo.path;

        console.log(`[${TARGET.toUpperCase()}] Navigating to auth page: ${BASE_URL}${finalPath}`);
        await page.goto(`${BASE_URL}${finalPath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        await expect(page).toHaveScreenshot(`auth-${pageInfo.name}-baseline.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.05,
          animations: 'disabled'
        });
      });
    }
  });
});
