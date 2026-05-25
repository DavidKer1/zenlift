import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import type { PersonalRecord, PersonalRecordType } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export type RecentPR = PersonalRecord & {
  exercise_name?: string;
};

type RecentPRsCardProps = {
  prs: RecentPR[];
};

const PR_TYPE_LABELS: Record<PersonalRecordType, string> = {
  estimated_1rm: 'Est. 1RM',
  max_reps: 'Max Reps',
  max_session_volume: 'Session Volume',
  max_volume: 'Max Volume',
  max_weight: 'Max Weight',
};

export function RecentPRsCard({ prs }: RecentPRsCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const latestPrs = prs.slice(0, 3);

  return (
    <View
      accessible
      accessibilityLabel="Recent personal records card"
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
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
        Recent PRs
      </Text>

      {latestPrs.length > 0 ? (
        <View style={{ gap: spacing.three }}>
          {latestPrs.map((pr) => (
            <View key={pr.id} style={[styles.prRow, { gap: spacing.two }]}>
              <View style={styles.prText}>
                <Text
                  style={[
                    styles.exerciseName,
                    {
                      color: colors.textBody,
                      fontSize: typography.bodyLg.fontSize,
                      fontWeight: typography.bodyLg.fontWeight,
                      lineHeight: typography.bodyLg.lineHeight,
                    },
                  ]}>
                  {pr.exercise_name ?? 'Exercise'}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.bodyMd.fontSize,
                      lineHeight: typography.bodyMd.lineHeight,
                    },
                  ]}>
                  {PR_TYPE_LABELS[pr.type]} · {formatDate(pr.achieved_at)}
                </Text>
              </View>
              <Text
                style={[
                  styles.prValue,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.families.mono,
                    fontSize: typography.dataMd.fontSize,
                    fontWeight: typography.dataMd.fontWeight,
                    lineHeight: typography.dataMd.lineHeight,
                  },
                ]}>
                {formatPRValue(pr)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyContainer, { gap: spacing.two }]}>
          <SymbolView
            name={'trophy.fill' as SymbolViewProps['name']}
            size={28}
            tintColor={colors.primary}
          />
          <View style={{ gap: spacing.one }}>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.md,
                  fontWeight: typography.weight.bold,
                  lineHeight: typography.lineHeight.md,
                },
              ]}>
              No personal records yet
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.mutedText,
                  fontFamily: typography.families.sans,
                  fontSize: typography.size.sm,
                  lineHeight: typography.lineHeight.sm,
                },
              ]}>
              Complete workouts to set new records
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function formatPRValue(pr: RecentPR): string {
  const value = Number.isInteger(pr.value) ? `${pr.value}` : pr.value.toFixed(1);

  if (pr.type === 'max_reps') return `${value} reps`;
  if (pr.type === 'max_weight' || pr.type === 'estimated_1rm') return `${value} kg`;
  return `${value} kg`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'flex-start',
  },
  emptyTitle: {
    letterSpacing: 0,
  },
  exerciseName: {
    letterSpacing: 0,
  },
  prRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  prText: {
    flex: 1,
  },
  prValue: {
    letterSpacing: 0,
    minWidth: 72,
    textAlign: 'right',
  },
  sectionTitle: {
    letterSpacing: 0,
  },
  subtitle: {
    letterSpacing: 0,
  },
});
