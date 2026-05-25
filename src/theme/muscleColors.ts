// ============================================================
// Muscle colors — now monochrome per DESIGN.md.
// All muscles use the same muted tone. Differentiation comes
// from labels and icons, not color coding.
// ============================================================

export const muscleColors = {
  Chest: 'rgba(255, 255, 255, 0.50)',
  Back: 'rgba(255, 255, 255, 0.50)',
  Shoulders: 'rgba(255, 255, 255, 0.50)',
  Biceps: 'rgba(255, 255, 255, 0.50)',
  Triceps: 'rgba(255, 255, 255, 0.50)',
  Forearms: 'rgba(255, 255, 255, 0.50)',
  Abs: 'rgba(255, 255, 255, 0.50)',
  Quads: 'rgba(255, 255, 255, 0.50)',
  Hamstrings: 'rgba(255, 255, 255, 0.50)',
  Glutes: 'rgba(255, 255, 255, 0.50)',
  Calves: 'rgba(255, 255, 255, 0.50)',
  'Full Body': 'rgba(255, 255, 255, 0.50)',
  Cardio: 'rgba(255, 255, 255, 0.50)',
} as const;

export type MuscleGroupName = keyof typeof muscleColors;
