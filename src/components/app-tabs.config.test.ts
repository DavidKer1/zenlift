import { appTabs } from './app-tabs.config';

describe('appTabs', () => {
  it('keeps the primary mobile tab order with Ejercicios between Rutinas and Historial', () => {
    expect(appTabs.map((tab) => tab.href)).toEqual([
      '/',
      '/routines',
      '/exercise',
      '/history',
      '/settings',
    ]);
    expect(appTabs.map((tab) => tab.labelKey)).toEqual([
      'tabs.home',
      'tabs.routines',
      'tabs.exercises',
      'tabs.history',
      'tabs.settings',
    ]);
  });

  it('uses a dumbbell symbol for the Ejercicios tab', () => {
    const exercisesTab = appTabs.find((tab) => tab.href === '/exercise');

    expect(exercisesTab).toMatchObject({
      name: 'exercises',
      labelKey: 'tabs.exercises',
      icon: {
        type: 'symbol',
        inactive: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
        active: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
      },
    });
  });

  it('does not reuse the same icon identity across tabs', () => {
    const iconKeys = appTabs.map((tab) =>
      tab.icon.type === 'ionicon'
        ? `ionicon:${tab.icon.inactive}:${tab.icon.active}`
        : `symbol:${JSON.stringify(tab.icon.inactive)}:${JSON.stringify(tab.icon.active)}`,
    );

    expect(new Set(iconKeys).size).toBe(iconKeys.length);
  });
});
