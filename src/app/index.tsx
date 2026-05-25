import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CurrentRoutineCard,
  type CurrentRoutineCardData,
} from '@/components/home/CurrentRoutineCard';
import { Greeting } from '@/components/home/Greeting';
import { RecentPRsCard, type RecentPR } from '@/components/home/RecentPRsCard';
import { StartWorkoutButton } from '@/components/home/StartWorkoutButton';
import { WeeklyActivityCard } from '@/components/home/WeeklyActivityCard';
import { WorkoutCalendarWidget } from '@/components/home/WorkoutCalendarWidget';
import type { WorkoutSession } from '@/domain/entities';
import { startWorkoutFlow } from '@/features/workout/StartWorkoutFlow';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';
import {
  WorkoutRepo,
  type HomeCalendarRepeatParams,
  type HomeCalendarSummary,
} from '@/storage/repositories/workoutRepo';

const EMPTY_WEEK = [false, false, false, false, false, false, false];

export default function HomeScreen() {
  const { colors, spacing } = useZenliftTheme();
  const [calendarSummary, setCalendarSummary] = useState<HomeCalendarSummary | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [weeklyActivity, setWeeklyActivity] = useState<boolean[]>(EMPTY_WEEK);
  const [currentRoutine, setCurrentRoutine] = useState<CurrentRoutineCardData | null>(null);
  const [recentPRs, setRecentPRs] = useState<RecentPR[]>([]);

  const fetchCalendarSummary = useCallback(async () => {
    setIsCalendarLoading(true);

    try {
      const db = await getDatabase();
      const workoutRepo = new WorkoutRepo(db);
      const summary = await workoutRepo.getHomeCalendarSummary();
      setCalendarSummary(summary);
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch calendar summary:', error);
      setCalendarSummary(null);
    } finally {
      setIsCalendarLoading(false);
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

  const handleRepeatWorkout = useCallback((params: HomeCalendarRepeatParams) => {
    void startWorkoutFlow({
      name: params.name,
      routineDayId: params.routineDayId,
      routineId: params.routineId,
    });
  }, []);

  useEffect(() => {
    void fetchCalendarSummary();
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
        <StartWorkoutButton
          label="Quick Workout"
          variant="secondary"
          onPress={() => {
            void startWorkoutFlow({});
          }}
        />
        <WorkoutCalendarWidget
          isLoading={isCalendarLoading}
          onRepeatWorkout={handleRepeatWorkout}
          summary={calendarSummary}
        />
        <WeeklyActivityCard activeDays={weeklyActivity} />
        <CurrentRoutineCard routine={currentRoutine} />
        <RecentPRsCard prs={recentPRs} />
      </ScrollView>
    </SafeAreaView>
  );
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
