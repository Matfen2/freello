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

async function createProjectAndNavigate(page: Page): Promise<string> {
  const projectName = `Projet Test ${Date.now()}`;
  await page.getByRole('button', { name: 'Nouveau projet' }).click();
  await page.getByPlaceholder('Ex : Refonte site web').fill(projectName);
  await page.getByRole('button', { name: 'Créer' }).click();
  await expect(page.getByRole('heading', { name: 'Nouveau projet' })).not.toBeVisible();
  await page.getByText(projectName).click();
  await expect(page).toHaveURL(/\/projects\//);
  return projectName;
}

test.describe('Page Projet', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('affiche le breadcrumb et le titre du projet', async ({ page }) => {
    const projectName = await createProjectAndNavigate(page);
    await expect(page.getByText('Projets')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(projectName);
  });

  test('affiche le bouton Nouvelle tâche', async ({ page }) => {
    await createProjectAndNavigate(page);
    await expect(page.getByRole('button', { name: 'Nouvelle tâche' })).toBeVisible();
  });

  test('crée une tâche et l\'affiche dans la liste', async ({ page }) => {
    await createProjectAndNavigate(page);
    const taskTitle = `Tâche E2E ${Date.now()}`;

    await page.getByRole('button', { name: 'Nouvelle tâche' }).click();
    await expect(page.getByRole('heading', { name: 'Nouvelle tâche' })).toBeVisible();

    await page.getByPlaceholder('Ex : Implémenter la page de login').fill(taskTitle);
    await page.getByRole('button', { name: 'Créer' }).click();

    await expect(page.getByRole('heading', { name: 'Nouvelle tâche' })).not.toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('filtre les tâches par statut', async ({ page }) => {
    await createProjectAndNavigate(page);

    // Créer une tâche "À faire"
    const taskTitle = `Tâche filtre ${Date.now()}`;
    await page.getByRole('button', { name: 'Nouvelle tâche' }).click();
    await page.getByPlaceholder('Ex : Implémenter la page de login').fill(taskTitle);
    await page.getByRole('button', { name: 'Créer' }).click();

    // Filtrer par "À faire" — tâche visible
    await page.getByRole('button', { name: 'À faire' }).click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Filtrer par "Terminé" — tâche absente
    await page.getByRole('button', { name: 'Terminé' }).click();
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('supprime une tâche avec confirmation', async ({ page }) => {
    await createProjectAndNavigate(page);
    const taskTitle = `Tâche à supprimer ${Date.now()}`;

    // Créer la tâche
    await page.getByRole('button', { name: 'Nouvelle tâche' }).click();
    await page.getByPlaceholder('Ex : Implémenter la page de login').fill(taskTitle);
    await page.getByRole('button', { name: 'Créer' }).click();

    // Hover sur la tâche pour faire apparaître les actions
    const taskRow = page.locator('div').filter({ hasText: taskTitle }).first();
    await taskRow.hover();

    // Clic sur Supprimer
    await taskRow.getByTitle('Supprimer').click();
    await expect(page.getByRole('heading', { name: 'Supprimer la tâche' })).toBeVisible();
    await expect(page.getByText(`"${taskTitle}"`)).toBeVisible();

    // Confirmer
    await page.getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('breadcrumb Projets ramène au dashboard', async ({ page }) => {
    await createProjectAndNavigate(page);
    await page.getByText('Projets').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});