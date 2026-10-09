const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/en/account/login');
    
    await page.waitForSelector('cos-button', {timeout: 10000});
    
    // Check form validity and inputs
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Give Angular time to update signal
    await page.waitForTimeout(500);
    
    const isBtnDisabled = await page.evaluate(() => {
      return document.querySelector('cos-button button').disabled;
    });
    console.log("Is button disabled after typing:", isBtnDisabled);
    
    const btnType = await page.evaluate(() => {
      return document.querySelector('cos-button button').type;
    });
    console.log("Button type:", btnType);

    await browser.close();
  } catch(e) {
    console.log(e);
  }
})();
