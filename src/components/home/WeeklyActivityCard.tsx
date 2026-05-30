import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GradientCard } from '@/components/ui/GradientCard';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type WeeklyActivityCardProps = {
  activeDays: boolean[];
  workoutCount: number;
};

export function WeeklyActivityCard({ activeDays, workoutCount }: WeeklyActivityCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const weekdays = t('home.weeklyActivity.weekdays', { returnObjects: true }) as string[];
  const hasActivity = activeDays.some(Boolean);

  return (
    <GradientCard
      accessibilityLabel={String(t('home.weeklyActivity.a11y'))}
      borderRadius={radius.xl}
      padding={spacing.paddingCard}>
      <View style={{ gap: spacing.one }}>
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
          {t('home.weeklyActivity.title')}
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
          {hasActivity
            ? t('home.weeklyActivity.logged', { count: workoutCount })
            : t('home.weeklyActivity.emptyTitle')}
        </Text>
      </View>

      <View style={[styles.weekRow, { gap: spacing.two }]}>
        {weekdays.map((label, index) => {
          const isActive = activeDays[index] ?? false;

          return (
            <View key={`${label}-${index}`} style={[styles.dayColumn, { gap: spacing.one }]}>
              <View
                style={[
                  styles.segment,
                  {
                    backgroundColor: isActive ? colors.textPrimary : colors.outlineVariant,
                    opacity: isActive ? 0.8 : 0.2,
                    borderRadius: radius.xs,
                  },
                ]}
              />
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isActive ? colors.textPrimary : colors.textSecondary,
                    fontSize: typography.labelCaps.fontSize,
                    fontWeight: typography.labelCaps.fontWeight,
                    lineHeight: typography.labelCaps.lineHeight,
                  },
                ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {!hasActivity ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: typography.bodyMd.fontSize,
              lineHeight: typography.bodyMd.lineHeight,
            },
          ]}>
          {t('home.weeklyActivity.emptyBody')}
        </Text>
      ) : null}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
    minWidth: 28,
  },
  dayLabel: {
    letterSpacing: 0,
  },
  sectionTitle: {
    letterSpacing: 0,
  },
  segment: {
    height: 12,
    width: '100%',
  },
  subtitle: {
    letterSpacing: 0,
  },
  weekRow: {
    flexDirection: 'row',
  },
});
