import { type FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ActiveWorkoutExpandedSurface } from '@/components/workout/ActiveWorkoutExpandedSurface';
import { ActiveWorkoutMinimizedHeader } from '@/components/workout/ActiveWorkoutMinimizedHeader';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { ThemedText } from '@/components/themed-text';
import { useActiveWorkoutStore } from '@/features/workout/stores/activeWorkoutStore';
import { createFinishWorkoutFlowCopy, finishWorkoutFlow } from '@/features/workout/FinishWorkoutFlow';
import { useSettings } from '@/features/settings/useSettings';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';
import type { WorkoutExerciseWithSets } from '@/domain/entities';

type PrevPerfEntry = { weight: number; reps: number };

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ActiveWorkoutModal() {
  const { colors } = useZenliftTheme();
  const { t } = useTranslation();
  const finishWorkoutCopy = createFinishWorkoutFlowCopy(t);
  const { weightUnit } = useSettings();

  const session = useActiveWorkoutStore((s) => s.session);
  const exercises = useActiveWorkoutStore((s) => s.exercises);

  const recoverSession = useActiveWorkoutStore((s) => s.recoverSession);
  const addSet = useActiveWorkoutStore((s) => s.addSet);
  const completeSet = useActiveWorkoutStore((s) => s.completeSet);
  const updateSet = useActiveWorkoutStore((s) => s.updateSet);
  const addExercise = useActiveWorkoutStore((s) => s.addExercise);
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout);

  // ---- Expand / minimize state ----
  const [isMinimized, setIsMinimized] = useState(false);

  // ---- Workout state (extracted from active.tsx) ----
  const [isRecovering, setIsRecovering] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [prevPerfMap, setPrevPerfMap] = useState<Map<string, PrevPerfEntry>>(new Map());
  const prevExCountRef = useRef(0);
  const activeSessionIdRef = useRef<string | null>(null);

  const flashListRef = useRef<FlashListRef<WorkoutExerciseWithSets>>(null);

  // ---- Session recovery ----
  useEffect(() => {
    async function init() {
      if (useActiveWorkoutStore.getState().session) {
        setIsRecovering(false);
        return;
      }
      try {
        await recoverSession();
      } catch (err) {
        console.error('[ActiveWorkoutModal] recoverSession failed:', err);
      }
      setIsRecovering(false);
    }
    init();
  }, [recoverSession]);

  // ---- New sessions should always open expanded ----
  useEffect(() => {
    const sessionId = session?.id ?? null;
    if (sessionId && sessionId !== activeSessionIdRef.current) {
      setIsMinimized(false);
      setPickerVisible(false);
    }
    activeSessionIdRef.current = sessionId;
  }, [session?.id]);

  // ---- Elapsed timer ----
  useEffect(() => {
    if (!session?.started_at) return;
    const tick = () => {
      setElapsedSeconds(
        Math.round((Date.now() - new Date(session.started_at!).getTime()) / 1000),
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.started_at]);

  // ---- Auto-expand first exercise ----
  useEffect(() => {
    if (exercises.length > 0 && expandedExerciseId === null) {
      setExpandedExerciseId(exercises[0].id);
    }
  }, [exercises, expandedExerciseId]);

  // ---- Previous performance ----
  useEffect(() => {
    if (exercises.length <= 0) {
      setPrevPerfMap(new Map());
      prevExCountRef.current = 0;
      return;
    }
    if (exercises.length === prevExCountRef.current) return;
    prevExCountRef.current = exercises.length;

    let cancelled = false;
    async function fetchPrev() {
      try {
        const db = await getDatabase();
        const repo = new WorkoutRepo(db);
        const map = new Map<string, PrevPerfEntry>();
        for (const ex of exercises) {
          const data = await repo.getLastWorkoutExerciseData(ex.exercise?.id);
          if (data) map.set(ex.id, data);
        }
        if (!cancelled) setPrevPerfMap(map);
      } catch {
        // Silently fail — previous performance is optional UI
      }
    }
    fetchPrev();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run only when exercise count changes
  }, [exercises.length]);

  // ---- Callbacks ----
  const handleToggleExercise = useCallback((exerciseId: string) => {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  }, []);

  const handleAddSet = useCallback(
    async (workoutExerciseId: string) => {
      const ex = exercises.find((e) => e.id === workoutExerciseId);
      const completed = ex?.sets.filter((s) => s.is_completed === 1);
      const lastCompleted = completed && completed.length > 0 ? completed[completed.length - 1] : null;
      const prevPerf = prevPerfMap.get(workoutExerciseId);
      const weight = lastCompleted?.weight ?? prevPerf?.weight ?? 0;
      const reps = lastCompleted?.reps ?? prevPerf?.reps ?? 0;
      await addSet(workoutExerciseId, { weight, reps });
    },
    [exercises, prevPerfMap, addSet],
  );

  const handleCompleteSet = useCallback(
    async (exerciseId: string, setId: string) => {
      await completeSet(exerciseId, setId);
      const updated = useActiveWorkoutStore.getState().exercises;
      const idx = updated.findIndex((e) => e.id === exerciseId);
      const currentEx = updated[idx];
      const allComplete = currentEx?.sets.every((s) => s.is_completed === 1);
      if (allComplete && idx >= 0 && idx < updated.length - 1) {
        const nextId = updated[idx + 1].id;
        setExpandedExerciseId(nextId);
        flashListRef.current?.scrollToIndex({ index: idx + 1, animated: true, viewPosition: 0.1 });
      }
    },
    [completeSet],
  );

  const handleWeightChange = useCallback((setId: string, weight: number) => {
    updateSet(setId, { weight });
  }, [updateSet]);

  const handleRepsChange = useCallback((setId: string, reps: number) => {
    updateSet(setId, { reps });
  }, [updateSet]);

  const handleCancel = useCallback(async () => {
    await cancelWorkout();
  }, [cancelWorkout]);

  const handleRequestCancel = useCallback(() => {
    Alert.alert(
      String(t('workout.active.cancelTitle')),
      String(t('workout.active.cancelBody')),
      [
        { text: String(t('workout.active.keepTraining')), style: 'cancel' },
        { text: String(t('common.cancel')), style: 'destructive', onPress: handleCancel },
      ],
    );
  }, [handleCancel, t]);

  const handleFinish = useCallback(async () => {
    await finishWorkoutFlow(finishWorkoutCopy);
  }, [finishWorkoutCopy]);

  const handleAddExercise = useCallback(() => {
    setPickerVisible(true);
  }, []);

  const handleClosePicker = useCallback(() => {
    setPickerVisible(false);
  }, []);

  const handleExerciseSelected = useCallback(
    async (selected: { id: string; name: string }) => {
      setPickerVisible(false);
      try {
        const addedExercise = await addExercise(selected.id);
        const updated = useActiveWorkoutStore.getState().exercises;
        const addedIndex = updated.findIndex((exercise) => exercise.id === addedExercise.id);

        setExpandedExerciseId(addedExercise.id);

        if (addedIndex >= 0) {
          requestAnimationFrame(() => {
            try {
              flashListRef.current?.scrollToIndex({
                index: addedIndex,
                animated: true,
                viewPosition: 0.1,
              });
            } catch {
              // FlashList may not have measured the new row yet; expansion still makes it actionable.
            }
          });
        }
      } catch {
        Alert.alert(String(t('common.error')), String(t('workout.active.addExerciseFailed')));
      }
    },
    [addExercise, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: WorkoutExerciseWithSets }) => (
      <WorkoutExerciseCard
        exercise={item}
        isExpanded={expandedExerciseId === item.id}
        onToggle={handleToggleExercise}
        onAddSet={handleAddSet}
        onCompleteSet={handleCompleteSet}
        onWeightChange={handleWeightChange}
        onRepsChange={handleRepsChange}
        unit={weightUnit}
        previousPerformance={prevPerfMap.get(item.id) ?? null}
      />
    ),
    [
      expandedExerciseId, handleToggleExercise, handleAddSet,
      handleCompleteSet, handleWeightChange, handleRepsChange,
      weightUnit, prevPerfMap,
    ],
  );

  const keyExtractor = useCallback((item: WorkoutExerciseWithSets) => item.id, []);

  // ---- Expand / minimize helpers ----
  const expand = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  // Compute session name for handle
  const sessionName = session?.name ?? String(t('workout.active.titleFallback'));

  // ---- Render ----
  if (isRecovering) {
    return (
      <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.center}>
          <ThemedText type="small" themeColor="mutedText">
            {t('workout.active.loadingSession')}
          </ThemedText>
        </SafeAreaView>
      </View>
    );
  }

  if (!session) return null;

  const elapsed = formatTime(elapsedSeconds);

  return (
    <View pointerEvents="box-none" style={styles.overlayRoot}>
      {isMinimized ? (
        <ActiveWorkoutMinimizedHeader
          elapsed={elapsed}
          onExpand={expand}
          sessionName={sessionName}
        />
      ) : (
        <ActiveWorkoutExpandedSurface
          elapsed={elapsed}
          exercises={exercises}
          finishDisabled={exercises.length === 0}
          flashListRef={flashListRef}
          keyExtractor={keyExtractor}
          onAddExercise={handleAddExercise}
          onClosePicker={handleClosePicker}
          onExerciseSelected={handleExerciseSelected}
          onFinish={handleFinish}
          onMinimize={minimize}
          onRequestCancel={handleRequestCancel}
          pickerVisible={pickerVisible}
          renderExercise={renderItem}
          sessionName={sessionName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
