import { resources } from '@/i18n/resources';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(child, nextPrefix);
  });
}

describe('translation resources', () => {
  it('keeps English and Spanish keys in parity', () => {
    const enKeys = flattenKeys(resources.en.translation).sort();
    const esKeys = flattenKeys(resources.es.translation).sort();

    expect(esKeys).toEqual(enKeys);
  });

  it('contains copy for every reviewed screen group', () => {
    expect(resources.en.translation.tabs.home).toBe('Home');
    expect(resources.en.translation.onboarding.welcome.title).toBe('Welcome to your training');
    expect(resources.en.translation.settings.title).toBe('Settings');
    expect(resources.en.translation.routines.title).toBe('My Routines');
    expect(resources.en.translation.exercises.title).toBe('Exercises');
    expect(resources.en.translation.workout.active.addExercise).toBe('Add Exercise');
    expect(resources.en.translation.history.title).toBe('History');

    expect(resources.es.translation.tabs.home).toBe('Inicio');
    expect(resources.es.translation.onboarding.welcome.title).toBe(
      'Bienvenido a tu entrenamiento',
    );
    expect(resources.es.translation.settings.title).toBe('Ajustes');
    expect(resources.es.translation.routines.title).toBe('Mis Rutinas');
    expect(resources.es.translation.exercises.title).toBe('Ejercicios');
    expect(resources.es.translation.workout.active.addExercise).toBe('Agregar ejercicio');
    expect(resources.es.translation.history.title).toBe('Historial');
  });
});
