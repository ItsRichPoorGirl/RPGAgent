const { chromium } = require('playwright');

async function investigateToolActivity() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to dashboard...');
    await page.goto('https://v0-luciq-ai.vercel.app/dashboard', { waitUntil: 'networkidle' });
    
    // Check if we're on the login page
    const isLoginPage = await page.isVisible('input[type="email"]');
    if (isLoginPage) {
      console.log('Login page detected. Please log in manually...');
      // Wait for navigation after login
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
    }

    console.log('Looking for agent threads...');
    // Wait for agent threads to load
    await page.waitForSelector('[data-testid="agent-thread"]', { timeout: 30000 });
    
    console.log('Clicking first agent thread...');
    await page.click('[data-testid="agent-thread"]');
    
    // Wait for thread page to load
    await page.waitForLoadState('networkidle');
    
    console.log('Waiting for tool activity panel...');
    // Wait for tool activity panel with increased timeout
    await page.waitForSelector('.fixed.inset-y-0.right-0.border-l', { 
      timeout: 30000,
      state: 'visible'
    });
    
    console.log('Tool activity panel found!');
    
    // Wait for a few seconds to observe the panel
    await page.waitForTimeout(5000);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tool-activity-panel.png' });
    console.log('Screenshot saved as tool-activity-panel.png');
    
  } catch (error) {
    console.error('Error during investigation:', error);
    // Take a screenshot on error
    await page.screenshot({ path: 'error-state.png' });
    console.log('Error screenshot saved as error-state.png');
  } finally {
    await browser.close();
  }
}

investigateToolActivity(); 