import type { SetLog, WorkoutExerciseWithSets, MuscleGroup, FullSession } from '@/domain/entities';

export function calculateSetVolume(weight: number, reps: number): number {
  if (weight === 0 || reps === 0) return 0;
  return weight * reps;
}

export function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function formatISOWeek(year: number, week: number): string {
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function calculateExerciseVolume(sets: SetLog[]): number {
  return sets.reduce((total, set) => {
    if (set.is_completed && set.set_type !== 'warmup') {
      return total + calculateSetVolume(set.weight, set.reps);
    }
    return total;
  }, 0);
}

export function calculateSessionVolume(exercises: WorkoutExerciseWithSets[]): number {
  return exercises.reduce((total, ex) => total + calculateExerciseVolume(ex.sets), 0);
}

export function calculateMuscleVolume(
  exercises: WorkoutExerciseWithSets[],
  muscleMap: Map<string, MuscleGroup[]>,
): Map<string, number> {
  const result = new Map<string, number>();

  for (const exercise of exercises) {
    const muscles = muscleMap.get(exercise.exercise_id);
    if (!muscles || muscles.length === 0) continue;

    const volume = calculateExerciseVolume(exercise.sets);
    for (const muscle of muscles) {
      const current = result.get(muscle.id) ?? 0;
      result.set(muscle.id, current + volume);
    }
  }

  return result;
}

export function calculateWeeklyVolume(sessions: FullSession[]): { weekStart: string; volume: number }[] {
  const weekMap = new Map<string, number>();

  for (const session of sessions) {
    if (!session.started_at) continue;

    const date = new Date(session.started_at);
    if (isNaN(date.getTime())) continue;

    const { year, week } = getISOWeek(date);
    const key = formatISOWeek(year, week);

    const volume = calculateSessionVolume(session.exercises);
    weekMap.set(key, (weekMap.get(key) ?? 0) + volume);
  }

  return Array.from(weekMap.entries())
    .map(([weekStart, volume]) => ({ weekStart, volume }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}
