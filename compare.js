const { chromium } = require('playwright');
const topicId = '0a19ee18-aa52-4776-86db-b04f45259e5f';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto(`https://localhost:4200/en/topics/${topicId}#ideation`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  
  await browser.close();
}
run();
