const { test, expect } = require('@playwright/test');

test('Start a new agent and monitor console for errors', async ({ page }) => {
  // Collect console messages
  page.on('console', msg => {
    console.log(`[CONSOLE][${msg.type()}]`, msg.text());
  });

  // Collect page errors
  page.on('pageerror', error => {
    console.error('[PAGE ERROR]', error);
  });

  // Go to dashboard
  await page.goto('https://v0-luciq-ai.vercel.app/dashboard', { waitUntil: 'networkidle' });

  // If login is required, wait for user to log in
  if (await page.isVisible('input[type="email"]')) {
    console.log('Login page detected. Please log in manually...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });
  }

  // Click the button to start a new agent (update selector as needed)
  const newAgentSelector = '[data-testid="new-agent-button"], button:has-text("New Agent")';
  await page.waitForSelector(newAgentSelector, { timeout: 20000 });
  await page.click(newAgentSelector);
  console.log('Clicked to start a new agent.');

  // Wait for agent creation UI to appear (update selector as needed)
  await page.waitForTimeout(5000);

  // Optionally, take a screenshot for debugging
  await page.screenshot({ path: 'new-agent-state.png' });
  console.log('Screenshot saved as new-agent-state.png');

  // Wait and monitor for errors
  await page.waitForTimeout(10000);
}); 