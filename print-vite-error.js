const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto('https://dev.citizenos.com:3001/en/account/login', { waitUntil: 'networkidle' });
  const overlay = page.locator('vite-error-overlay');
  if (await overlay.count() > 0) {
    const text = await overlay.evaluate(el => el.shadowRoot.innerHTML);
    console.log("VITE ERROR OVERLAY:", text);
  } else {
    console.log("No vite error overlay found.");
  }
  await browser.close();
})();
