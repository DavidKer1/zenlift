import { expect, test, type Locator, type Page } from '@playwright/test';

async function clickIfVisible(locator: Locator) {
  try {
    await locator.click({ timeout: 2_000 });
  } catch {
    // Optional first-run UI was not present.
  }
}

async function completeOnboardingIfNeeded(page: Page) {
  await page.goto('/');
  await clickIfVisible(page.getByLabel('Saltar onboarding'));
  await expect(page.getByLabel('Home')).toBeVisible();
}

test('agent mobile smoke completes the workout core loop', async ({ page }) => {
  const routineName = `Agent Smoke ${Date.now()}`;

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await completeOnboardingIfNeeded(page);

  await page.goto('/routine/create');
  await page.getByLabel('Nombre de la rutina').fill(routineName);
  await page.getByLabel('Agregar dia a la rutina').click();
  await page.getByLabel('Agregar ejercicio al dia 1').click();

  await page.getByLabel('Buscar ejercicios').fill('Bench Press');
  await page.getByLabel(/Seleccionar ejercicio Bench Press/).first().click();

  await expect(page.getByText('Configurar ejercicio')).toBeVisible();
  await page.getByLabel('Series objetivo').fill('2');
  await page.getByLabel('Repeticiones minimas').fill('8');
  await page.getByLabel('Repeticiones maximas').fill('10');
  await page.getByLabel('Confirmar configuracion de ejercicio').click();

  await page.getByLabel('Crear rutina').click();
  await expect(page.getByText(routineName)).toBeVisible();

  await page.getByLabel('Iniciar workout para Dia 1').click();
  await expect(page.getByLabel('Finalizar entrenamiento')).toBeVisible();

  await page.getByLabel('Agregar set').click();
  await page.getByLabel('Peso set 1').fill('40');
  await page.getByLabel('Repeticiones set 1').fill('8');
  await page.getByLabel('Completar set 1').click();

  await page.getByLabel('Agregar set').click();
  await page.getByLabel('Peso set 2').fill('42.5');
  await page.getByLabel('Repeticiones set 2').fill('8');
  await page.getByLabel('Completar set 2').click();

  await page.getByLabel('Finalizar entrenamiento').click();
  await expect(page.getByText('Entrenamiento completado', { exact: false })).toBeVisible();
});
