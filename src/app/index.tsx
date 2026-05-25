import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CurrentRoutineCard,
  type CurrentRoutineCardData,
} from '@/components/home/CurrentRoutineCard';
import { Greeting } from '@/components/home/Greeting';
import {
  LastWorkoutCard,
  type LastWorkoutCardData,
} from '@/components/home/LastWorkoutCard';
import { RecentPRsCard, type RecentPR } from '@/components/home/RecentPRsCard';
import { StartWorkoutButton } from '@/components/home/StartWorkoutButton';
import { WeeklyActivityCard } from '@/components/home/WeeklyActivityCard';
import type { FullWorkoutSession, WorkoutSession } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';

const EMPTY_WEEK = [false, false, false, false, false, false, false];

export default function HomeScreen() {
  const { colors, spacing } = useZenliftTheme();
  const [lastWorkout, setLastWorkout] = useState<LastWorkoutCardData | null>(null);
  const [isLastWorkoutLoading, setIsLastWorkoutLoading] = useState(true);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>(EMPTY_WEEK);
  const [currentRoutine, setCurrentRoutine] = useState<CurrentRoutineCardData | null>(null);
  const [recentPRs, setRecentPRs] = useState<RecentPR[]>([]);

  const fetchLastWorkout = useCallback(async () => {
    setIsLastWorkoutLoading(true);

    try {
      const db = await getDatabase();
      const workoutRepo = new WorkoutRepo(db);
      const [session] = await workoutRepo.getHistory(1, 0);

      if (!session || session.status !== 'completed') {
        setLastWorkout(null);
        return;
      }

      const fullSession = await workoutRepo.getFullSession(session.id);
      setLastWorkout(fullSession ? mapLastWorkout(fullSession) : mapSessionFallback(session));
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch last workout:', error);
      setLastWorkout(null);
    } finally {
      setIsLastWorkoutLoading(false);
    }
  }, []);

  const fetchWeeklyActivity = useCallback(async () => {
    try {
      const db = await getDatabase();
      const workoutRepo = new WorkoutRepo(db);
      const today = new Date();
      const weekStart = getWeekStart(today);
      const sessions = await workoutRepo.getHistoryByDateRange(
        formatDateOnly(weekStart),
        formatDateOnly(today),
      );

      setWeeklyActivity(mapWeeklyActivity(sessions));
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch weekly activity:', error);
      setWeeklyActivity(EMPTY_WEEK);
    }
  }, []);

  const fetchCurrentRoutine = useCallback(async () => {
    try {
      const db = await getDatabase();
      const routineRepo = new RoutineRepo(db);
      const [routine] = await routineRepo.getAll();

      if (!routine) {
        setCurrentRoutine(null);
        return;
      }

      const days = await routineRepo.getDays(routine.id);
      setCurrentRoutine({
        dayCount: days.length,
        id: routine.id,
        name: routine.name,
      });
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch current routine:', error);
      setCurrentRoutine(null);
    }
  }, []);

  const fetchRecentPRs = useCallback(async () => {
    try {
      const db = await getDatabase();
      const workoutRepo = new WorkoutRepo(db);
      const prs = await workoutRepo.getLatestPRs(3);
      setRecentPRs(prs);
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch recent PRs:', error);
      setRecentPRs([]);
    }
  }, []);

  useEffect(() => {
    void fetchLastWorkout();
    void fetchWeeklyActivity();
    void fetchCurrentRoutine();
    void fetchRecentPRs();
    // The OpenSpec task calls for mount-only fetching; each callback is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: spacing.three,
            paddingBottom: spacing.six + spacing.five,
            paddingHorizontal: spacing.three,
            paddingTop: spacing.three,
          },
        ]}
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <Greeting />
        <StartWorkoutButton />
        <LastWorkoutCard isLoading={isLastWorkoutLoading} workout={lastWorkout} />
        <WeeklyActivityCard activeDays={weeklyActivity} />
        <CurrentRoutineCard routine={currentRoutine} />
        <RecentPRsCard prs={recentPRs} />
      </ScrollView>
    </SafeAreaView>
  );
}

function mapLastWorkout(session: FullWorkoutSession): LastWorkoutCardData {
  return {
    dateLabel: formatDate(session.started_at),
    durationLabel: formatDuration(session.duration_seconds),
    exerciseCount: session.exercises.length,
    routineName: session.routine?.name ?? null,
    sessionName: session.name ?? session.routine_day?.name ?? 'Workout session',
  };
}

function mapSessionFallback(session: WorkoutSession): LastWorkoutCardData {
  return {
    dateLabel: formatDate(session.started_at),
    durationLabel: formatDuration(session.duration_seconds),
    exerciseCount: 0,
    routineName: null,
    sessionName: session.name ?? 'Workout session',
  };
}

function mapWeeklyActivity(sessions: WorkoutSession[]): boolean[] {
  const activeDays = [...EMPTY_WEEK];

  for (const session of sessions) {
    if (session.status !== 'completed') continue;

    const date = new Date(session.started_at);
    if (Number.isNaN(date.getTime())) continue;

    const mondayFirstIndex = (date.getDay() + 6) % 7;
    activeDays[mondayFirstIndex] = true;
  }

  return activeDays;
}

function getWeekStart(date: Date): Date {
  const start = new Date(date);
  const diffFromMonday = (start.getDay() + 6) % 7;

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diffFromMonday);

  return start;
}

function formatDateOnly(date: Date): string {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 1) return '0 min';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes} min`;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
