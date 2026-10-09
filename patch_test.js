const fs = require('fs');
let file = fs.readFileSync('e2e/specs/ideation-visual.spec.ts', 'utf8');

file = `import { test, expect } from '@playwright/test';
import { BASE_URL, TARGET } from '../fixtures/test-fixtures';

test.use({ viewport: { width: 1280, height: 800 }, storageState: 'e2e/.auth/user.json' });

test('Compare topic create compose step', async ({ page }) => {
  // Navigate to create topic
  const createUrl = TARGET === 'legacy' ? \`\${BASE_URL}/topics/create\` : \`\${BASE_URL}/en/topics/create\`;
  await page.goto(createUrl, { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);

  // Take full page screenshot
  await expect(page).toHaveScreenshot(\`topic-create-compose-baseline.png\`, {
    fullPage: true,
    maxDiffPixelRatio: 0.1,
    animations: 'disabled'
  });
});
`;

fs.writeFileSync('e2e/specs/ideation-visual.spec.ts', file);
