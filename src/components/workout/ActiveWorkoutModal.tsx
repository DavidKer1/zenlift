import { FlashList, type FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, {
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import ActiveWorkoutHandle from '@/components/workout/ActiveWorkoutHandle';
import { BottomBar } from '@/components/workout/BottomBar';
import { RestTimer } from '@/components/workout/RestTimer';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { ThemedText } from '@/components/themed-text';
import { ExercisePicker } from '@/components/routine/ExercisePicker';
import { useActiveWorkoutStore } from '@/features/workout/stores/activeWorkoutStore';
import { finishWorkoutFlow } from '@/features/workout/FinishWorkoutFlow';
import { useSettings } from '@/features/settings/useSettings';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';
import { getIncrement } from '@/utils/units';
import type { WorkoutExerciseWithSets } from '@/domain/entities';

type PrevPerfEntry = { weight: number; reps: number };

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ActiveWorkoutModal() {
  const { colors } = useZenliftTheme();
  const { weightUnit } = useSettings();
  const insets = useSafeAreaInsets();

  const session = useActiveWorkoutStore((s) => s.session);
  const exercises = useActiveWorkoutStore((s) => s.exercises);
  const timerTargetEnd = useActiveWorkoutStore((s) => s.timerTargetEnd);

  const recoverSession = useActiveWorkoutStore((s) => s.recoverSession);
  const addSet = useActiveWorkoutStore((s) => s.addSet);
  const completeSet = useActiveWorkoutStore((s) => s.completeSet);
  const updateSet = useActiveWorkoutStore((s) => s.updateSet);
  const addExercise = useActiveWorkoutStore((s) => s.addExercise);
  const cancelWorkout = useActiveWorkoutStore((s) => s.cancelWorkout);
  const startTimer = useActiveWorkoutStore((s) => s.startTimer);
  const skipTimer = useActiveWorkoutStore((s) => s.skipTimer);

  // ---- Expand / minimize state ----
  const [currentIndex, setCurrentIndex] = useState(1);
  const sheetRef = useRef<BottomSheet>(null);

  // ---- Workout state (extracted from active.tsx) ----
  const [isRecovering, setIsRecovering] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [prevPerfMap, setPrevPerfMap] = useState<Map<string, PrevPerfEntry>>(new Map());
  const prevExCountRef = useRef(0);

  const flashListRef = useRef<FlashListRef<WorkoutExerciseWithSets>>(null);
  const increment = useMemo(() => getIncrement(weightUnit), [weightUnit]);

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

  const handleFinish = useCallback(async () => {
    await finishWorkoutFlow();
  }, []);

  const handleAddExercise = useCallback(() => {
    setPickerVisible(true);
  }, []);

  const handleExerciseSelected = useCallback(
    async (selected: { id: string; name: string }) => {
      setPickerVisible(false);
      try {
        await addExercise(selected.id);
        const updated = useActiveWorkoutStore.getState().exercises;
        if (updated.length === 1) setExpandedExerciseId(updated[0].id);
      } catch {
        Alert.alert('Error', 'No se pudo agregar el ejercicio.');
      }
    },
    [addExercise],
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
        increment={increment}
        previousPerformance={prevPerfMap.get(item.id) ?? null}
      />
    ),
    [
      expandedExerciseId, handleToggleExercise, handleAddSet,
      handleCompleteSet, handleWeightChange, handleRepsChange,
      weightUnit, increment, prevPerfMap,
    ],
  );

  const keyExtractor = useCallback((item: WorkoutExerciseWithSets) => item.id, []);

  // ---- Expand / minimize helpers ----
  const expand = useCallback(() => {
    sheetRef.current?.snapToIndex(1);
  }, []);

  const minimize = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // ---- Snap points ----
  const snapPoints = useMemo(() => ['15%', '95%'], []);

  // Compute session name for handle
  const sessionName = session?.name ?? 'Quick Workout';

  // ---- Custom handle (miniplayer row) ----
  const renderHandle = useCallback(
    () => (
      <ActiveWorkoutHandle
        sessionName={sessionName}
        elapsed={formatTime(elapsedSeconds)}
        isExpanded={currentIndex > 0}
        surfaceColor={colors.surface}
        mutedTextColor={colors.mutedText}
        onExpand={expand}
        onMinimize={minimize}
      />
    ),
    [colors, elapsedSeconds, currentIndex, expand, minimize, sessionName],
  );

  // ---- Render ----
  if (isRecovering) {
    return (
      <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.center}>
          <ThemedText type="small" themeColor="mutedText">
            Cargando sesión...
          </ThemedText>
        </SafeAreaView>
      </View>
    );
  }

  if (!session) return null;

  return (
    <View pointerEvents="box-none" style={styles.gestureRoot}>
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        handleComponent={renderHandle}
        topInset={insets.top}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: 'transparent' }}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Cancel button */}
          <View style={styles.cancelRow}>
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Cancelar entrenamiento?',
                  'Los datos registrados se conservaran.',
                  [
                    { text: 'Seguir entrenando', style: 'cancel' },
                    { text: 'Cancelar', style: 'destructive', onPress: handleCancel },
                  ],
                );
              }}
              hitSlop={12}
              accessibilityLabel="Cancelar entrenamiento"
            >
              <ThemedText type="small" themeColor="danger">
                Cancel
              </ThemedText>
            </Pressable>
          </View>

          {/* Rest timer */}
          <RestTimer
            targetEnd={timerTargetEnd}
            onComplete={skipTimer}
            onSkip={skipTimer}
            onAddTime={(seconds) => {
              const store = useActiveWorkoutStore.getState();
              if (!store.timerTargetEnd) return;
              const remaining = Math.max(0, Math.ceil((store.timerTargetEnd - Date.now()) / 1000));
              startTimer(remaining + seconds);
            }}
            exerciseName={exercises.length > 0 ? exercises[0].exercise?.name : undefined}
          />

          {/* Exercise list */}
          <FlashList
            ref={flashListRef}
            data={exercises}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <ThemedText type="small" themeColor="mutedText">
                  No hay ejercicios aún.
                </ThemedText>
                <ThemedText type="small" themeColor="mutedText">
                  Toca &quot;Add Exercise&quot; para empezar.
                </ThemedText>
              </View>
            }
          />

          {/* Bottom bar */}
          <BottomBar
            onAddExercise={handleAddExercise}
            onFinish={handleFinish}
            finishDisabled={exercises.length === 0}
          />

          {/* Exercise picker modal */}
          <ExercisePicker
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            onSelect={handleExerciseSelected}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // ---- Content ----
  contentContainer: {
    flex: 1,
  },
  cancelRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 48,
  },
  listContent: {
    paddingBottom: 8,
    paddingTop: 12,
  },
});
