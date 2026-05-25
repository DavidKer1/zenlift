import type { FullSession, PersonalRecord, PersonalRecordType, SetLog } from '@/domain/entities';
import { calculateExerciseVolume, calculateSessionVolume } from '@/domain/calculations/volume';
import { estimate1RMFromSets } from '@/domain/calculations/oneRM';

export interface DetectedPR {
  exerciseId: string;
  exerciseName: string;
  type: PersonalRecordType;
  value: number;
  previousBest: number | null;
  improvement: number;
  improvementPercent: number;
}

function calculateImprovement(value: number, previousBest: number | null): {
  improvement: number;
  improvementPercent: number;
} {
  if (previousBest === null) {
    return { improvement: 0, improvementPercent: 0 };
  }
  const improvement = value - previousBest;
  const improvementPercent = Math.round((improvement / previousBest) * 100 * 100) / 100;
  return { improvement, improvementPercent };
}

function getQualifyingSets(sets: SetLog[]): SetLog[] {
  return sets.filter((s) => s.is_completed && s.set_type !== 'warmup');
}

export function detectPRs(
  session: FullSession,
  previousPRs: PersonalRecord[],
  allHistory: FullSession[],
): DetectedPR[] {
  const prMap = new Map<string, Map<PersonalRecordType, number>>();
  for (const pr of previousPRs) {
    if (!prMap.has(pr.exercise_id)) {
      prMap.set(pr.exercise_id, new Map());
    }
    const typeMap = prMap.get(pr.exercise_id)!;
    const current = typeMap.get(pr.type);
    if (current === undefined || pr.value > current) {
      typeMap.set(pr.type, pr.value);
    }
  }

  const results: DetectedPR[] = [];
  let hasQualifyingSets = false;

  for (const exercise of session.exercises) {
    const qualifyingSets = getQualifyingSets(exercise.sets);
    if (qualifyingSets.length === 0) continue;
    hasQualifyingSets = true;

    const exercisePRs = prMap.get(exercise.exercise_id);
    const exerciseId = exercise.exercise_id;
    const exerciseName = exercise.exercise.name;

    const maxWeight = Math.max(...qualifyingSets.map((s) => s.weight));
    const prevMaxWeight = exercisePRs?.get('max_weight') ?? null;
    if (prevMaxWeight === null || maxWeight > prevMaxWeight) {
      results.push({
        exerciseId,
        exerciseName,
        type: 'max_weight',
        value: maxWeight,
        previousBest: prevMaxWeight,
        ...calculateImprovement(maxWeight, prevMaxWeight),
      });
    }

    const exerciseVolume = calculateExerciseVolume(exercise.sets);
    const prevMaxVolume = exercisePRs?.get('max_volume') ?? null;
    if (prevMaxVolume === null || exerciseVolume > prevMaxVolume) {
      results.push({
        exerciseId,
        exerciseName,
        type: 'max_volume',
        value: exerciseVolume,
        previousBest: prevMaxVolume,
        ...calculateImprovement(exerciseVolume, prevMaxVolume),
      });
    }

    const maxReps = Math.max(...qualifyingSets.map((s) => s.reps));
    const prevMaxReps = exercisePRs?.get('max_reps') ?? null;
    if (prevMaxReps === null || maxReps > prevMaxReps) {
      results.push({
        exerciseId,
        exerciseName,
        type: 'max_reps',
        value: maxReps,
        previousBest: prevMaxReps,
        ...calculateImprovement(maxReps, prevMaxReps),
      });
    }

    const estimated1rm = estimate1RMFromSets(exercise.sets);
    if (estimated1rm !== null) {
      const prevEstimated1rm = exercisePRs?.get('estimated_1rm') ?? null;
      if (prevEstimated1rm === null || estimated1rm > prevEstimated1rm) {
        results.push({
          exerciseId,
          exerciseName,
          type: 'estimated_1rm',
          value: estimated1rm,
          previousBest: prevEstimated1rm,
          ...calculateImprovement(estimated1rm, prevEstimated1rm),
        });
      }
    }
  }

  const sessionVolume = calculateSessionVolume(session.exercises);

  let prevSessionVolume: number | null = null;
  for (const histSession of allHistory) {
    const vol = calculateSessionVolume(histSession.exercises);
    if (prevSessionVolume === null || vol > prevSessionVolume) {
      prevSessionVolume = vol;
    }
  }

  if (hasQualifyingSets && (prevSessionVolume === null || sessionVolume > prevSessionVolume)) {
    results.push({
      exerciseId: '',
      exerciseName: '',
      type: 'max_session_volume',
      value: sessionVolume,
      previousBest: prevSessionVolume,
      ...calculateImprovement(sessionVolume, prevSessionVolume),
    });
  }

  return results;
}
