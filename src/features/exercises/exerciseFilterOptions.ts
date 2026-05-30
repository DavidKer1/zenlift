import type { ImageSourcePropType } from 'react-native';

import type { Equipment, ExerciseCategory, MuscleGroup } from '@/domain/entities';

export type ExerciseFilterOption<Value extends string = string> = {
  value: Value | null;
  label: string;
  imageSource: ImageSourcePropType;
  accessibilityLabel: string;
};

const filterOptionImage = require('../../../assets/images/filters/filter-option-temp.png') as ImageSourcePropType;

type Translate = (key: string, options?: Record<string, unknown>) => unknown;

export const equipmentValues = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'smith_machine',
  'ez_bar',
  'cardio_machine',
  'other',
] as const satisfies readonly Equipment[];

export const categoryValues = [
  'strength',
  'cardio',
  'mobility',
  'core',
] as const satisfies readonly ExerciseCategory[];

export function getEquipmentLabel(t: Translate, value: Equipment): string {
  return String(t(`exercises.equipmentOptions.${value}`));
}

export function getCategoryLabel(t: Translate, value: ExerciseCategory): string {
  return String(t(`exercises.categoryOptions.${value}`));
}

export function getMuscleDisplayName(muscle: MuscleGroup, language: string): string {
  if (language.startsWith('es')) return muscle.display_name_es;

  return muscle.name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildEquipmentFilterOptions(
  t: Translate,
): ExerciseFilterOption<Equipment>[] {
  const allLabel = String(t('exercises.all'));

  return [
    {
      value: null,
      label: allLabel,
      imageSource: filterOptionImage,
      accessibilityLabel: String(t('exercises.a11y.showAllEquipment')),
    },
    ...equipmentValues.map((value) => {
      const label = getEquipmentLabel(t, value);

      return {
        value,
        label,
        imageSource: filterOptionImage,
        accessibilityLabel: String(t('exercises.a11y.filterByEquipment', { label })),
      };
    }),
  ];
}

export function buildMuscleFilterOptions(
  muscles: MuscleGroup[],
  language: string,
  t: Translate,
): ExerciseFilterOption<string>[] {
  const allLabel = String(t('exercises.all'));

  return [
    {
      value: null,
      label: allLabel,
      imageSource: filterOptionImage,
      accessibilityLabel: String(t('exercises.a11y.showAllMuscles')),
    },
    ...muscles.map((muscle) => {
      const label = getMuscleDisplayName(muscle, language);

      return {
        value: muscle.id,
        label,
        imageSource: filterOptionImage,
        accessibilityLabel: String(t('exercises.a11y.filterByMuscle', { label })),
      };
    }),
  ];
}

export function getEquipmentFilterLabel(
  value: Equipment | null,
  t: Translate,
): string {
  if (!value) return String(t('exercises.all'));

  return getEquipmentLabel(t, value);
}

export function getMuscleFilterLabel(
  muscles: MuscleGroup[],
  selectedMuscleId: string | null,
  language: string,
  t: Translate,
): string {
  if (!selectedMuscleId) return String(t('exercises.all'));

  const muscle = muscles.find((item) => item.id === selectedMuscleId);

  return muscle ? getMuscleDisplayName(muscle, language) : String(t('exercises.all'));
}
