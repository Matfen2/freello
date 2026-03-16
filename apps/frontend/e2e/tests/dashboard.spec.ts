import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(
    process.env['E2E_USER_EMAIL'] ?? 'test@freello.com',
  );
  await page.getByPlaceholder('••••••••').fill(
    process.env['E2E_USER_PASSWORD'] ?? 'Test1234!',
  );
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('affiche le titre et le bouton Nouveau projet', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nouveau projet' })).toBeVisible();
  });

  test('ouvre le modal de création de projet', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    await expect(page.getByRole('heading', { name: 'Nouveau projet' })).toBeVisible();
    await expect(page.getByPlaceholder('Ex : Refonte site web')).toBeVisible();
  });

  test('ferme le modal avec Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    await expect(page.getByRole('heading', { name: 'Nouveau projet' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Nouveau projet' })).not.toBeVisible();
  });

  test('crée un projet et l\'affiche dans la liste', async ({ page }) => {
    const projectName = `Projet E2E ${Date.now()}`;

    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    await page.getByPlaceholder('Ex : Refonte site web').fill(projectName);
    await page.getByRole('button', { name: 'Créer' }).click();

    // Modal fermé
    await expect(page.getByRole('heading', { name: 'Nouveau projet' })).not.toBeVisible();
    // Projet visible dans la liste
    await expect(page.getByText(projectName)).toBeVisible();
  });

  test('le bouton Créer est désactivé si le nom est vide', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouveau projet' }).click();
    await expect(page.getByRole('button', { name: 'Créer' })).toBeDisabled();
  });
});