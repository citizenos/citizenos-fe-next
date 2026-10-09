const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/account/login');
  await page.waitForSelector('cos-button');
  const btnHtml = await page.evaluate(() => {
    return document.querySelector('cos-button').innerHTML;
  });
  console.log("cos-button HTML:", btnHtml);
  
  const outerHtml = await page.evaluate(() => {
    return document.querySelector('cos-button').outerHTML;
  });
  console.log("cos-button OUTER HTML:", outerHtml);
  
  const formHtml = await page.evaluate(() => {
    return document.querySelector('form').outerHTML;
  });
  console.log("form HTML:", formHtml);

  await browser.close();
})();
