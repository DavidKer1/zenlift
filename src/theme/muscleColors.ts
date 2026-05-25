export const muscleColors = {
  Chest: '#EF4444',
  Back: '#3B82F6',
  Shoulders: '#FB923C',
  Biceps: '#22C55E',
  Triceps: '#A855F7',
  Forearms: '#EC4899',
  Abs: '#FBBF24',
  Quads: '#06B6D4',
  Hamstrings: '#84CC16',
  Glutes: '#EAB308',
  Calves: '#14B8A6',
  'Full Body': '#6B7280',
  Cardio: '#F472B6',
} as const;

export type MuscleGroupName = keyof typeof muscleColors;
