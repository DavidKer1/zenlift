import type { MuscleGroup } from '@/domain/entities';
import {
  buildEquipmentFilterOptions,
  buildMuscleFilterOptions,
  getEquipmentFilterLabel,
  getMuscleFilterLabel,
} from '@/features/exercises/exerciseFilterOptions';

function makeMuscle(overrides: Partial<MuscleGroup> = {}): MuscleGroup {
  return {
    id: 'mg-1',
    name: 'Chest',
    display_name_es: 'Pecho',
    color: '#FFFFFF',
    ...overrides,
  };
}

const labels: Record<string, string> = {
  'exercises.all': 'Todos',
  'exercises.a11y.showAllEquipment': 'Mostrar todos los equipos',
  'exercises.a11y.showAllMuscles': 'Mostrar todos los musculos',
  'exercises.equipmentOptions.barbell': 'Barra',
  'exercises.equipmentOptions.dumbbell': 'Mancuernas',
  'exercises.equipmentOptions.machine': 'Maquina',
  'exercises.equipmentOptions.cable': 'Cable',
  'exercises.equipmentOptions.bodyweight': 'Peso corporal',
  'exercises.equipmentOptions.kettlebell': 'Kettlebell',
  'exercises.equipmentOptions.smith_machine': 'Smith',
  'exercises.equipmentOptions.ez_bar': 'Barra EZ',
  'exercises.equipmentOptions.cardio_machine': 'Cardio',
  'exercises.equipmentOptions.other': 'Otro',
};

function t(key: string, options?: Record<string, unknown>): string {
  if (key === 'exercises.a11y.filterByEquipment') {
    return `Filtrar por equipo ${options?.label}`;
  }
  if (key === 'exercises.a11y.filterByMuscle') {
    return `Filtrar por musculo ${options?.label}`;
  }

  return labels[key] ?? key;
}

describe('exerciseFilterOptions', () => {
  it('keeps equipment options in the expected display order with all first', () => {
    expect(buildEquipmentFilterOptions(t).map((option) => option.label)).toEqual([
      'Todos',
      'Barra',
      'Mancuernas',
      'Maquina',
      'Cable',
      'Peso corporal',
      'Kettlebell',
      'Smith',
      'Barra EZ',
      'Cardio',
      'Otro',
    ]);
  });

  it('returns selected equipment labels and falls back to Todos when empty', () => {
    expect(getEquipmentFilterLabel(null, t)).toBe('Todos');
    expect(getEquipmentFilterLabel('dumbbell', t)).toBe('Mancuernas');
  });

  it('builds muscle options with all first and readable labels', () => {
    const options = buildMuscleFilterOptions([
      makeMuscle({ id: 'mg-back', name: 'Back', display_name_es: 'Espalda' }),
      makeMuscle({ id: 'mg-legs', name: 'Legs', display_name_es: 'Pierna' }),
    ], 'es', t);

    expect(options.map((option) => ({ value: option.value, label: option.label }))).toEqual([
      { value: null, label: 'Todos' },
      { value: 'mg-back', label: 'Espalda' },
      { value: 'mg-legs', label: 'Pierna' },
    ]);
  });

  it('returns selected muscle labels and falls back to Todos when selection is missing', () => {
    const muscles = [
      makeMuscle({ id: 'mg-back', name: 'Back', display_name_es: 'Espalda' }),
      makeMuscle({ id: 'mg-legs', name: 'Legs', display_name_es: 'Pierna' }),
    ];

    expect(getMuscleFilterLabel(muscles, null, 'es', t)).toBe('Todos');
    expect(getMuscleFilterLabel(muscles, 'mg-legs', 'es', t)).toBe('Pierna');
    expect(getMuscleFilterLabel(muscles, 'missing', 'es', t)).toBe('Todos');
  });
});
