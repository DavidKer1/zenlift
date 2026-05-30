import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { useI18nFormatters } from '@/i18n/useI18nFormatters';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type BestPerformanceCardProps = {
  maxWeight: number;
  best1RM: number;
  bestVolume: number;
};

export function BestPerformanceCard({
  maxWeight,
  best1RM,
  bestVolume,
}: BestPerformanceCardProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const { t } = useTranslation();
  const { formatWeight } = useI18nFormatters();

  const metrics = [
    { label: String(t('exercises.stats.maxWeight')), value: formatKg(maxWeight, formatWeight) },
    { label: String(t('exercises.stats.bestOneRm')), value: formatKg(best1RM, formatWeight) },
    { label: String(t('exercises.stats.maxVolume')), value: formatKg(bestVolume, formatWeight) },
  ];

  return (
    <View
      accessibilityLabel={String(t('exercises.stats.bestPerformanceA11y'))}
      accessibilityRole="summary"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.three,
        },
      ]}>
      <ThemedText type="smallBold" themeColor="mutedText" style={styles.title}>
        {t('exercises.stats.bestPerformance')}
      </ThemedText>

      <View style={styles.metricsRow}>
        {metrics.map((metric, index) => (
          <View
            key={metric.label}
            style={[
              styles.metricCell,
              index < metrics.length - 1 && {
                borderRightWidth: 1,
                borderRightColor: colors.border,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={[styles.metricValue, { color: colors.primary }]}>
              {metric.value}
            </ThemedText>
            <ThemedText type="small" themeColor="mutedText" style={styles.metricLabel}>
              {metric.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatKg(value: number, formatWeight: (value: number, unit: 'kg') => string): string {
  if (value === 0) return '--';
  return formatWeight(Math.round(value), 'kg');
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 12,
  },
  metricCell: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingHorizontal: 4,
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 28,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});
