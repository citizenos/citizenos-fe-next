const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  await page.goto('https://localhost:4200/en/topics/9f207407-c8e8-4dfe-b7a2-77d4266064bb#ideation', { waitUntil: 'load' });
  
  // Wait a bit
  await page.waitForTimeout(3000);
  
  // Nuke modal
  await page.addStyleTag({ content: 'app-tour, cos-dialog, .cdk-overlay-container, .cdk-global-overlay-wrapper { display: none !important; opacity: 0 !important; }' });
  await page.evaluate(() => {
    const dialogs = document.querySelectorAll('cos-dialog, app-tour, dialog, .cdk-overlay-container, .overlay');
    dialogs.forEach(d => d.remove());
  });
  
  await page.screenshot({ path: '/home/ilmar/.gemini/antigravity-cli/brain/fea3d26b-1834-46bd-9233-2a5b062ccd0b/screenshot_ideation.png', fullPage: true });
  
  await browser.close();
})();
