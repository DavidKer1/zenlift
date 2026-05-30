import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useI18nFormatters } from '@/i18n/useI18nFormatters';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type { PersonalRecord } from '@/domain/entities';

type ExercisePRListProps = {
  prs: PersonalRecord[];
};

export function ExercisePRList({ prs }: ExercisePRListProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
  const { formatShortDate, formatWeight, formatVolume } = useI18nFormatters();

  return (
    <View
      accessibilityLabel={String(t('exercises.stats.personalRecords'))}
      accessibilityRole="summary"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.three,
        },
      ]}>
      <ThemedText type="smallBold" themeColor="mutedText" style={styles.title}>
        {t('exercises.stats.personalRecords')}
      </ThemedText>

      {prs.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText type="small" themeColor="mutedText" style={styles.emptyText}>
            {t('exercises.stats.noPersonalRecords')}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.list}>
          {prs.map((pr, index) => (
            <View
              key={pr.id}
              style={[
                styles.row,
                index < prs.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}>
              <View style={styles.prInfo}>
                <ThemedText type="smallBold" style={styles.prType}>
                  {t(`workout.prTypes.${pr.type}`, { defaultValue: pr.type })}
                </ThemedText>
                <ThemedText type="small" themeColor="mutedText" style={styles.prDate}>
                  {formatShortDate(pr.achieved_at)}
                </ThemedText>
              </View>
              <View>
                <ThemedText type="smallBold" style={[styles.prValue, { color: colors.primary }]}>
                  {formatPRValue(pr, formatWeight, formatVolume, String(t('common.reps')))}
                </ThemedText>
                {pr.weight !== null && pr.reps !== null ? (
                  <ThemedText type="small" themeColor="mutedText" style={styles.prDetail}>
                    {formatWeight(pr.weight, 'kg')} x {pr.reps}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function formatPRValue(
  pr: PersonalRecord,
  formatWeight: (value: number, unit: 'kg') => string,
  formatVolume: (value: number, unit: 'kg') => string,
  repsLabel: string,
): string {
  const value = Math.round(pr.value);

  switch (pr.type) {
    case 'max_reps':
      return `${value} ${repsLabel}`;
    case 'estimated_1rm':
    case 'max_weight':
      return formatWeight(value, 'kg');
    case 'max_volume':
    case 'max_session_volume':
      return formatVolume(value, 'kg');
    default:
      return `${value}`;
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  list: {
    gap: 0,
  },
  prDate: {
    fontSize: 12,
    lineHeight: 16,
  },
  prDetail: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  prInfo: {
    flex: 1,
    gap: 2,
  },
  prType: {
    fontSize: 15,
    lineHeight: 20,
  },
  prValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});
