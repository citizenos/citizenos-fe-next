const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto('https://dev.citizenos.com:3001/en/account/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').fill('test@citizenos.com');
  await page.locator('input[type="password"]').fill('Teretere1');
  await page.locator('cos-button[type="submit"]').click();
  try {
    await page.waitForSelector('.error-banner', { state: 'visible', timeout: 5000 });
    const text = await page.locator('.error-banner').textContent();
    console.log("ERROR BANNER TEXT:", text);
  } catch (e) {
    console.log("No error banner, URL:", page.url());
  }
  await browser.close();
})();
