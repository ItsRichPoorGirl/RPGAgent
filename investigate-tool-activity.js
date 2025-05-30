const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the application
  console.log('Navigating to https://v0-luciq-ai.vercel.app/dashboard...');
  await page.goto('https://v0-luciq-ai.vercel.app/dashboard');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if we need to log in
  const isLoginPage = await page.$('input[type="email"]');
  if (isLoginPage) {
    console.log('Login required. Please enter your credentials in the browser window...');
    // Wait for manual login
    await page.waitForURL('**/dashboard', { timeout: 120000 }); // 2 minute timeout for manual login
  }

  // Navigate to an agent thread (you'll need to update this with a valid thread ID)
  console.log('Navigating to an agent thread...');
  await page.goto('https://v0-luciq-ai.vercel.app/agents/some-thread-id');

  // Wait for the tool activity panel to be present
  console.log('Waiting for tool activity panel...');
  await page.waitForSelector('.fixed.inset-y-0.right-0.border-l', { timeout: 10000 });

  // Start an agent run
  console.log('Starting an agent run...');
  await page.fill('textarea[placeholder="Type your message..."]', 'Test message');
  await page.click('button[type="submit"]');

  // Monitor tool activity panel updates
  console.log('Monitoring tool activity panel...');
  
  // Check for "No tool activity" state
  const noToolActivity = await page.$('text="No tool activity"');
  if (noToolActivity) {
    console.log('Initial state: No tool activity');
  }

  // Wait for tool activity to start
  console.log('Waiting for tool activity to start...');
  await page.waitForSelector('.px-2\\.5.py-0\\.5.rounded-full.text-xs.font-medium.bg-blue-50', { timeout: 10000 });

  // Check for running state
  const runningState = await page.$('text="Running"');
  if (runningState) {
    console.log('Tool activity started: Running state detected');
  }

  // Wait for tool completion
  console.log('Waiting for tool completion...');
  await page.waitForSelector('.px-2\\.5.py-0\\.5.rounded-full.text-xs.font-medium.bg-emerald-50', { timeout: 30000 });

  // Check for success state
  const successState = await page.$('text="Success"');
  if (successState) {
    console.log('Tool activity completed: Success state detected');
  }

  // Take a screenshot for debugging
  await page.screenshot({ path: 'tool-activity-debug.png' });

  // Close browser
  await browser.close();
})(); 