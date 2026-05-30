import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { createMMKV } from 'react-native-mmkv';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { WorkoutRepo } from '@/storage/repositories/workoutRepo';
import type {
  WorkoutSummary,
  WorkoutSession,
  PersonalRecordType,
} from '@/domain/entities';
import { calculateSessionVolume } from '@/domain/calculations/volume';
import { SETTINGS_KEYS, SETTINGS_MMKV_ID, type WeightUnit } from '@/features/settings/constants';
import { useI18nFormatters } from '@/i18n/useI18nFormatters';

const ORANGE = '#F97316';
const GREEN = '#22C55E';
const PURPLE = '#8B5CF6';
const BLUE_ACCENT = '#3B82F6';
const AMBER = '#F59E0B';

const PR_COLORS: Record<PersonalRecordType, string> = {
  max_weight: ORANGE,
  max_volume: BLUE_ACCENT,
  max_reps: PURPLE,
  estimated_1rm: AMBER,
  max_session_volume: GREEN,
};

function formatPRValue(
  type: PersonalRecordType,
  value: number,
  weightUnit: WeightUnit,
  formatters: ReturnType<typeof useI18nFormatters>,
): string {
  switch (type) {
    case 'max_weight':
      return formatters.formatWeight(value, weightUnit);
    case 'max_volume':
    case 'max_session_volume':
      return formatters.formatVolume(value, weightUnit);
    case 'max_reps':
      return formatters.formatNumber(value);
    case 'estimated_1rm':
      return formatters.formatWeight(Math.round(value), weightUnit);
    default:
      return formatters.formatNumber(value);
  }
}

interface PreviousComparison {
  previousVolume: number;
  previousExerciseCount: number;
  previousSetCount: number;
  volumeDelta: number;
  exerciseDelta: number;
  setDelta: number;
}

export default function WorkoutSummaryScreen() {
  const { t } = useTranslation();
  const formatters = useI18nFormatters();
  const { colors, radius } = useZenliftTheme();
  const { summary: summaryParam } = useLocalSearchParams<{ summary?: string }>();

  const [notes, setNotes] = useState('');
  const [comparison, setComparison] = useState<PreviousComparison | null>(null);

  const summary: WorkoutSummary | null = useMemo(() => {
    if (!summaryParam) return null;
    try {
      const parsed = JSON.parse(summaryParam) as WorkoutSummary;
      if (!parsed || !parsed.session_id) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [summaryParam]);

  const weightUnit = useMemo(() => {
    const storage = createMMKV({ id: SETTINGS_MMKV_ID });
    const unit = storage.getString(SETTINGS_KEYS.weightUnit);
    return unit === 'lb' ? 'lb' : 'kg';
  }, []);

  useEffect(() => {
    if (!summary?.session_id) return;

    const sessionId = summary.session_id;
    const routineId = summary.routine_id;
    const totalVolume = summary.total_volume;
    const exerciseCount = summary.exercise_count;
    const completedSetCount = summary.completed_set_count;

    async function loadComparison() {
      try {
        const db = await getDatabase();
        const repo = new WorkoutRepo(db);

        const sessions = routineId
          ? await repo.getHistoryByRoutine(routineId)
          : await repo.getHistory(5, 0);

        const prev = sessions.find((s: WorkoutSession) => s.id !== sessionId);

        if (!prev) return;

        const prevFull = await repo.getFullSession(prev.id);
        if (!prevFull) return;

        const prevVolume = calculateSessionVolume(prevFull.exercises);
        const prevExCount = prevFull.exercises.length;
        const prevSetCount = prevFull.exercises.reduce(
          (acc, ex) =>
            acc + ex.sets.filter((s) => s.is_completed && s.set_type !== 'warmup').length,
          0,
        );

        setComparison({
          previousVolume: prevVolume,
          previousExerciseCount: prevExCount,
          previousSetCount: prevSetCount,
          volumeDelta: totalVolume - prevVolume,
          exerciseDelta: exerciseCount - prevExCount,
          setDelta: completedSetCount - prevSetCount,
        });
      } catch {
        // Comparison data is optional
      }
    }

    loadComparison();
  }, [summary?.session_id, summary?.routine_id, summary?.total_volume, summary?.exercise_count, summary?.completed_set_count]);

  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesRef = useRef('');

  const saveNotes = useCallback(
    async (value: string) => {
      if (!summary?.session_id) return;
      notesRef.current = value;
      try {
        const db = await getDatabase();
        const repo = new WorkoutRepo(db);
        await repo.updateSessionNotes(summary.session_id, value);
      } catch {
        // Notes save can fail silently
      }
    },
    [summary?.session_id],
  );

  const handleNotesBlur = useCallback(() => {
    if (notesRef.current !== notes) {
      setNotes(notesRef.current);
      saveNotes(notesRef.current);
    }
  }, [notes, saveNotes]);

  const handleNotesChange = useCallback((text: string) => {
    notesRef.current = text;
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      saveNotes(text);
      setNotes(text);
    }, 2000);
  }, [saveNotes]);

  useEffect(() => {
    return () => {
      if (notesTimerRef.current) {
        clearTimeout(notesTimerRef.current);
        notesTimerRef.current = null;
        void saveNotes(notesRef.current);
      }
    };
  }, [saveNotes]);

  const handleGoHome = useCallback(() => {
    router.replace('/');
  }, []);

  const handleGoHistory = useCallback(() => {
    router.replace('/history');
  }, []);

  if (!summary) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ThemedText type="title" style={styles.errorTitle}>
            {t('workout.summary.unavailableTitle')}
          </ThemedText>
          <ThemedText type="small" themeColor="mutedText" style={styles.errorText}>
            {t('workout.summary.unavailableBody')}
          </ThemedText>
          <Pressable
            accessibilityLabel={String(t('common.home'))}
            accessibilityRole="button"
            onPress={handleGoHome}
            style={({ pressed }) => [
              styles.errorButton,
              {
                backgroundColor: ORANGE,
                borderRadius: radius.pill,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <ThemedText style={styles.buttonLabel}>{t('common.home')}</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const prs = summary.prs ?? [];
  const hasPRs = prs.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Celebration Header */}
        <View style={styles.celebrationHeader} testID="workout-summary-complete">
          <SymbolView
            name={'checkmark.circle.fill' as SymbolViewProps['name']}
            size={64}
            tintColor={ORANGE}
            style={styles.checkmark}
          />
          <ThemedText style={styles.congratsText}>
            {t('workout.summary.completedTitle')}
          </ThemedText>
          <ThemedText style={styles.durationText}>
            {formatters.formatDuration(summary.duration_seconds)}
          </ThemedText>
          {summary.name ? (
            <ThemedText type="small" themeColor="mutedText" style={styles.sessionName}>
              {summary.name}
            </ThemedText>
          ) : null}
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.statValue}>
              {formatters.formatVolume(summary.total_volume, weightUnit)}
            </ThemedText>
            <ThemedText type="small" themeColor="mutedText">
              {t('workout.summary.totalVolume')}
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.statValue}>{summary.exercise_count}</ThemedText>
            <ThemedText type="small" themeColor="mutedText">
              {t('workout.summary.exercises')}
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.statValue}>{summary.completed_set_count}</ThemedText>
            <ThemedText type="small" themeColor="mutedText">
              {t('workout.summary.sets')}
            </ThemedText>
          </View>
        </View>

        {/* PRs Section */}
        {hasPRs ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              {t('workout.summary.personalRecords')}
            </ThemedText>
            {prs.map((pr, index) => (
              <View
                key={`${pr.exerciseId}-${pr.type}-${index}`}
                style={[styles.prCard, { backgroundColor: colors.surface, borderLeftColor: PR_COLORS[pr.type] }]}
              >
                <View style={styles.prHeader}>
                  <ThemedText style={styles.prExerciseName}>
                    {pr.type === 'max_session_volume' ? t('workout.summary.session') : pr.exerciseName}
                  </ThemedText>
                  <View
                    style={[
                      styles.prBadge,
                      { backgroundColor: PR_COLORS[pr.type] + '1A' },
                    ]}
                  >
                    <ThemedText style={[styles.prBadgeText, { color: PR_COLORS[pr.type] }]}>
                      {t(`workout.prTypes.${pr.type}`)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.prValues}>
                  <ThemedText style={[styles.prValue, { color: PR_COLORS[pr.type] }]}>
                    {formatPRValue(pr.type, pr.value, weightUnit, formatters)}
                  </ThemedText>
                  {pr.previousBest !== null ? (
                    <View style={styles.prImprovement}>
                      <ThemedText type="small" themeColor="mutedText">
                        {t('workout.summary.previous')}: {formatPRValue(pr.type, pr.previousBest, weightUnit, formatters)}
                      </ThemedText>
                      <ThemedText
                        style={[styles.prImprovementPercent, { color: GREEN }]}
                      >
                        {formatters.formatPercent(pr.improvementPercent)}
                      </ThemedText>
                    </View>
                  ) : (
                    <View style={styles.prImprovement}>
                      <ThemedText style={[styles.prFirstRecord, { color: AMBER }]}>
                        {t('workout.summary.firstRecord')}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Previous Session Comparison */}
        {comparison ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              {t('workout.summary.versusPrevious')}
            </ThemedText>
            <View style={styles.comparisonRow}>
              <View style={[styles.comparisonCard, { backgroundColor: colors.surface }]}>
                <ThemedText
                  style={[
                    styles.comparisonValue,
                    {
                      color:
                        comparison.volumeDelta >= 0
                          ? GREEN
                          : colors.danger,
                    },
                  ]}
                >
                  {comparison.volumeDelta >= 0 ? '+' : ''}
                  {comparison.volumeDelta >= 0
                    ? Math.round(
                        comparison.previousVolume > 0
                          ? (comparison.volumeDelta / comparison.previousVolume) * 100
                          : 0,
                      )
                    : Math.round(
                        comparison.previousVolume > 0
                          ? (Math.abs(comparison.volumeDelta) / comparison.previousVolume) * 100
                          : 0,
                      )}
                  {t('workout.summary.volumePercent')}
                </ThemedText>
              </View>
              <View style={[styles.comparisonCard, { backgroundColor: colors.surface }]}>
                <ThemedText
                  style={[
                    styles.comparisonValue,
                    {
                      color:
                        comparison.exerciseDelta >= 0
                          ? colors.text
                          : colors.danger,
                    },
                  ]}
                >
                  {comparison.exerciseDelta >= 0 ? '+' : ''}
                  {comparison.exerciseDelta} {t('workout.summary.exercises')}
                </ThemedText>
              </View>
              <View style={[styles.comparisonCard, { backgroundColor: colors.surface }]}>
                <ThemedText
                  style={[
                    styles.comparisonValue,
                    {
                      color:
                        comparison.setDelta >= 0 ? colors.text : colors.danger,
                    },
                  ]}
                >
                  {comparison.setDelta >= 0 ? '+' : ''}
                  {comparison.setDelta} {t('workout.summary.sets')}
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {/* Notes Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('workout.summary.notes')}</ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={String(t('workout.summary.notesPlaceholder'))}
            placeholderTextColor={colors.mutedText}
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={handleNotesChange}
            onBlur={handleNotesBlur}
          />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <Pressable
            accessibilityLabel={String(t('common.home'))}
            accessibilityRole="button"
            onPress={handleGoHome}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: ORANGE,
                borderRadius: radius.pill,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <ThemedText style={styles.buttonLabel}>{t('common.home')}</ThemedText>
          </Pressable>
          <Pressable
            accessibilityLabel={String(t('common.history'))}
            accessibilityRole="button"
            onPress={handleGoHistory}
            style={({ pressed }) => [
              styles.navButton,
              styles.navButtonSecondary,
              {
                backgroundColor: colors.backgroundElement,
                borderRadius: radius.pill,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <ThemedText style={[styles.buttonLabel, { color: colors.text }]}>
              {t('common.history')}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  celebrationHeader: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 24,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  checkmark: {
    marginBottom: 16,
  },
  comparisonCard: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    padding: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  container: {
    flex: 1,
  },
  durationText: {
    color: ORANGE,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  navButtonSecondary: {},
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    paddingBottom: 48,
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    minHeight: 80,
    padding: 14,
  },
  prBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  prBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
  },
  prExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  prFirstRecord: {
    color: AMBER,
    fontSize: 14,
    fontWeight: '600',
  },
  prHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  prImprovement: {
    flexDirection: 'row',
    gap: 8,
  },
  prImprovementPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  prValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  prValues: {},
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionName: {
    marginTop: 4,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
