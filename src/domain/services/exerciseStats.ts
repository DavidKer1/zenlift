import type { SetLog } from '@/domain/entities';
import { estimate1RM } from '@/domain/calculations/oneRM';
import { calculateSetVolume } from '@/domain/calculations/volume';

export interface BestMetrics {
  maxWeight: number;
  best1RM: number;
  bestVolume: number;
}

export interface SessionHistoryItem {
  sessionId: string;
  date: string;
  setCount: number;
  volume: number;
}

export interface ProgressDataPoint {
  x: string;
  y: number;
}

export interface SessionSets {
  sessionId: string;
  date: string;
  sets: SetLog[];
}

function isQualifyingSet(set: SetLog): boolean {
  return set.is_completed === 1 && set.set_type !== 'warmup';
}

export function getBestMetrics(sets: SetLog[]): BestMetrics {
  const qualifying = sets.filter(isQualifyingSet);

  if (qualifying.length === 0) {
    return { maxWeight: 0, best1RM: 0, bestVolume: 0 };
  }

  const maxWeight = Math.max(...qualifying.map((s) => s.weight));

  let best1RM = 0;
  let bestVolume = 0;

  for (const set of qualifying) {
    const e1rm = estimate1RM(set.weight, set.reps);
    if (e1rm > best1RM) {
      best1RM = e1rm;
    }

    const vol = calculateSetVolume(set.weight, set.reps);
    if (vol > bestVolume) {
      bestVolume = vol;
    }
  }

  return { maxWeight, best1RM, bestVolume };
}

export function getSessionHistory(
  sessionsData: SessionSets[],
): SessionHistoryItem[] {
  return sessionsData
    .filter((s) => s.sets.length > 0)
    .map((session) => {
      const qualifying = session.sets.filter(isQualifyingSet);
      const volume = qualifying.reduce(
        (sum, set) => sum + calculateSetVolume(set.weight, set.reps),
        0,
      );

      return {
        sessionId: session.sessionId,
        date: session.date,
        setCount: qualifying.length,
        volume,
      };
    })
    .filter((item) => item.setCount > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getProgressData(
  sessionHistory: SessionHistoryItem[],
  metric: 'volume' | 'estimated1rm',
): ProgressDataPoint[] {
  return sessionHistory
    .slice()
    .reverse()
    .slice(0, 10)
    .map((item) => ({
      x: formatShortDate(item.date),
      y: item.volume,
    }));
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return dateStr;
  }
}
