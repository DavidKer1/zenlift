import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GradientCard } from '@/components/ui/GradientCard';
import type { PersonalRecord } from '@/domain/entities';
import { useI18nFormatters } from '@/i18n/useI18nFormatters';
import { useZenliftTheme } from '@/providers/ThemeProvider';

export type RecentPR = PersonalRecord & {
  exercise_name?: string;
};

type RecentPRsCardProps = {
  prs: RecentPR[];
};

export function RecentPRsCard({ prs }: RecentPRsCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const { formatNumber, formatShortDate, formatVolume, formatWeight } = useI18nFormatters();
  const latestPrs = prs.slice(0, 3);

  return (
    <GradientCard
      accessibilityLabel={String(t('home.recentPrs.a11y'))}
      borderRadius={radius.xl}
      padding={spacing.paddingCard}>
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
        {t('home.recentPrs.title')}
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
                  {pr.exercise_name ?? t('home.recentPrs.exerciseFallback')}
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
                  {t(`home.recentPrs.types.${pr.type}`)} · {formatShortDate(pr.achieved_at)}
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
                {formatPRValue(pr, {
                  formatNumber,
                  formatReps: (value) => String(t('common.reps', { count: value })),
                  formatVolume: (value) => formatVolume(value, 'kg'),
                  formatWeight: (value) => formatWeight(value, 'kg'),
                })}
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
              {t('home.recentPrs.emptyTitle')}
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
              {t('home.recentPrs.emptyBody')}
            </Text>
          </View>
        </View>
      )}
    </GradientCard>
  );
}

function formatPRValue(
  pr: RecentPR,
  formatters: {
    formatNumber: (value: number) => string;
    formatReps: (value: number) => string;
    formatVolume: (value: number) => string;
    formatWeight: (value: number) => string;
  },
): string {
  if (pr.type === 'max_reps') {
    return `${formatters.formatNumber(pr.value)} ${formatters.formatReps(pr.value)}`;
  }
  if (pr.type === 'max_weight' || pr.type === 'estimated_1rm') {
    return formatters.formatWeight(pr.value);
  }
  return formatters.formatVolume(pr.value);
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
