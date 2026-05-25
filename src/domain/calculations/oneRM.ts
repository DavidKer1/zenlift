import type { SetLog } from '@/domain/entities';

/**
 * Estimates one-rep max using the Epley formula: weight × (1 + reps/30).
 *
 * Formula is most accurate for 1–10 rep range. Accuracy degrades beyond 10 reps.
 *
 * @param weight The weight lifted in the set
 * @param reps The number of reps performed
 * @returns Estimated 1RM rounded to 2 decimal places
 */
export function estimate1RM(weight: number, reps: number): number {
  if (weight === 0 || reps === 0) return 0;
  if (reps === 1) return weight;

  const value = weight * (1 + reps / 30);
  return Math.round(value * 100) / 100;
}

/**
 * Finds the highest estimated 1RM among non-warmup, completed sets.
 *
 * Warmup sets (`set_type === 'warmup'`) and incomplete sets (`is_completed === 0`)
 * are excluded from estimation.
 *
 * @param sets Array of set logs to analyze
 * @returns The highest estimated 1RM, or null if no valid sets exist
 */
export function estimate1RMFromSets(sets: SetLog[]): number | null {
  let best: number | null = null;

  for (const set of sets) {
    if (set.set_type === 'warmup') continue;
    if (!set.is_completed) continue;

    const estimated = estimate1RM(set.weight, set.reps);
    if (best === null || estimated > best) {
      best = estimated;
    }
  }

  return best;
}

/**
 * Scans all historical sessions for an exercise and returns the absolute best
 * estimated 1RM with its weight, reps, and date.
 *
 * The history parameter should contain sets pre-filtered for the target exercise.
 * Warmup and incomplete sets are excluded from the scan.
 *
 * @param exerciseId The exercise to scan history for
 * @param history Array of sessions, each containing an array of set logs
 * @returns The best estimated 1RM record, or null if no valid data exists
 */
export function getBestEstimated1RM(
  exerciseId: string,
  history: SetLog[][],
): { value: number; weight: number; reps: number; date: string } | null {
  let best: { value: number; weight: number; reps: number; date: string } | null = null;

  for (const session of history) {
    for (const set of session) {
      if (set.set_type === 'warmup') continue;
      if (!set.is_completed) continue;

      const estimated = estimate1RM(set.weight, set.reps);
      if (best === null || estimated > best.value) {
        best = {
          value: estimated,
          weight: set.weight,
          reps: set.reps,
          date: set.completed_at ?? '',
        };
      }
    }
  }

  return best;
}
