import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { StartWorkoutButton } from '@/components/home/StartWorkoutButton';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export type LastWorkoutCardData = {
  dateLabel: string;
  durationLabel: string;
  exerciseCount: number;
  routineName: string | null;
  sessionName: string;
};

type LastWorkoutCardProps = {
  isLoading: boolean;
  workout: LastWorkoutCardData | null;
};

export function LastWorkoutCard({ isLoading, workout }: LastWorkoutCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();

  return (
    <View
      accessible={isLoading || Boolean(workout)}
      accessibilityLabel="Last workout card"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: spacing.paddingCard,
        },
      ]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.textPrimary,
            fontSize: typography.headlineMd.fontSize,
            fontWeight: typography.headlineMd.fontWeight,
            lineHeight: typography.headlineMd.lineHeight,
          },
        ]}>
        Last workout
      </Text>

      {isLoading ? (
        <View style={[styles.loadingContainer, { minHeight: 96 }]}>
          <ActivityIndicator color={colors.textSecondary} />
        </View>
      ) : workout ? (
        <View style={{ gap: spacing.two }}>
          <View style={{ gap: spacing.one }}>
            <Text
              style={[
                styles.workoutName,
                {
                  color: colors.textBody,
                  fontSize: typography.bodyLg.fontSize,
                  fontWeight: typography.bodyLg.fontWeight,
                  lineHeight: typography.bodyLg.lineHeight,
                },
              ]}>
              {workout.sessionName}
            </Text>
            <Text
              style={[
                styles.mutedText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.bodyMd.fontSize,
                  lineHeight: typography.bodyMd.lineHeight,
                },
              ]}>
              {workout.routineName ?? 'Freestyle'} · {workout.dateLabel}
            </Text>
          </View>

          <View style={[styles.metricsRow, { gap: spacing.three }]}>
            <Metric label="Duration" value={workout.durationLabel} />
            <Metric label="Exercises" value={`${workout.exerciseCount}`} />
          </View>
        </View>
      ) : (
        <EmptyLastWorkout />
      )}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors, typography } = useZenliftTheme();

  return (
    <View style={styles.metric}>
      <Text
        style={[
          styles.metricLabel,
          {
            color: colors.textSecondary,
            fontSize: typography.labelCaps.fontSize,
            fontWeight: typography.labelCaps.fontWeight,
            lineHeight: typography.labelCaps.lineHeight,
            letterSpacing: typography.labelCaps.letterSpacing,
          },
        ]}>
        {label}
      </Text>
      <Text
        style={[
          styles.metricValue,
          {
            color: colors.textPrimary,
            fontSize: typography.bodyLg.fontSize,
            fontWeight: typography.bodyLg.fontWeight,
            lineHeight: typography.bodyLg.lineHeight,
          },
        ]}>
        {value}
      </Text>
    </View>
  );
}

function EmptyLastWorkout() {
  const { colors, spacing, typography } = useZenliftTheme();

  return (
    <View style={[styles.emptyContainer, { gap: spacing.two }]}>
      <SymbolView
        name={'dumbbell.fill' as SymbolViewProps['name']}
        size={28}
        tintColor={colors.textSecondary}
      />
      <View style={{ gap: spacing.one }}>
        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.textBody,
              fontSize: typography.bodyLg.fontSize,
              fontWeight: typography.bodyLg.fontWeight,
              lineHeight: typography.bodyLg.lineHeight,
            },
          ]}>
          No workouts yet
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            {
              color: colors.textSecondary,
              fontSize: typography.bodyMd.fontSize,
              lineHeight: typography.bodyMd.lineHeight,
            },
          ]}>
          Start your first workout
        </Text>
      </View>
      <StartWorkoutButton label="Start Workout" variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'flex-start',
  },
  emptySubtitle: {
    letterSpacing: 0,
  },
  emptyTitle: {
    letterSpacing: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  metricValue: {
    letterSpacing: 0,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  mutedText: {
    letterSpacing: 0,
  },
  sectionTitle: {
    letterSpacing: 0,
  },
  workoutName: {
    letterSpacing: 0,
  },
});
