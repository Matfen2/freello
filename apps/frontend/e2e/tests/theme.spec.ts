import { test, expect } from '@playwright/test';

test.describe('Toggle Dark/Light', () => {
  test('bascule en dark mode depuis la page login', async ({ page }) => {
    await page.goto('/login');

    const html = page.locator('html');
    const toggleBtn = page.getByRole('button', { name: 'Toggle theme' });

    // État initial — on détermine le thème actuel
    const isDark = await html.evaluate(el => el.classList.contains('dark'));

    await toggleBtn.click();

    if (isDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }
  });
});