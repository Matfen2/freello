import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('redirige vers /login si non authentifié', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('affiche le formulaire de connexion', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('affiche une erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('wrong@example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible();
  });

  test('connexion réussie redirige vers /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(process.env['E2E_USER_EMAIL'] ?? 'test@freello.com');
    await page.getByPlaceholder('••••••••').fill(process.env['E2E_USER_PASSWORD'] ?? 'Test1234!');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible();
  });

  test('déconnexion redirige vers /login', async ({ page }) => {
    // Login d'abord
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(process.env['E2E_USER_EMAIL'] ?? 'test@freello.com');
    await page.getByPlaceholder('••••••••').fill(process.env['E2E_USER_PASSWORD'] ?? 'Test1234!');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Déconnexion
    await page.getByRole('button', { name: 'Déconnexion' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});