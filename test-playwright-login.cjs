const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to login...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  
  console.log('Filling form...');
  await page.fill('#email', 'admin@gmail.com');
  await page.fill('#password', 'Admin@123');
  
  console.log('Submitting...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for navigation...');
  // Wait for the URL to change to /admin (with 10s timeout)
  try {
    await page.waitForURL('http://localhost:5174/admin', { timeout: 10000 });
    console.log('SUCCESS! Navigated to /admin');
  } catch (e) {
    console.log('FAILED to navigate to /admin. Current URL:', page.url());
  }
  
  await page.screenshot({ path: 'playwright_admin_result.png' });
  
  const localStorage = await page.evaluate(() => window.localStorage.getItem('cardvault_state'));
  console.log('localStorage state:', localStorage);
  
  await browser.close();
})();
