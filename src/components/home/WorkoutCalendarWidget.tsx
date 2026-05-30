import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GradientCard } from '@/components/ui/GradientCard';
import { useI18nFormatters } from '@/i18n/useI18nFormatters';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import type {
  HomeCalendarRepeatParams,
  HomeCalendarSummary,
} from '@/storage/repositories/workoutRepo';

type WorkoutCalendarWidgetProps = {
  isLoading: boolean;
  onRepeatWorkout?: (params: HomeCalendarRepeatParams) => void;
  summary: HomeCalendarSummary | null;
};

type MonthGrid = {
  key: string;
  label: string;
  days: string[];
};

const VISIBLE_MONTHS = 3;

export function WorkoutCalendarWidget({
  isLoading,
  onRepeatWorkout,
  summary,
}: WorkoutCalendarWidgetProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const { formatMonth } = useI18nFormatters();
  const months = getVisibleMonths(new Date(), VISIBLE_MONTHS, formatMonth);
  const activeDateKeys = new Set(summary?.activity_dates.map((item) => item.date) ?? []);
  const latestWorkout = summary?.latest_workout ?? null;
  const repeatParams = latestWorkout?.repeat_params ?? null;
  const canRepeat = Boolean(repeatParams && onRepeatWorkout);
  const title = latestWorkout?.display_label ?? String(t('home.calendar.emptyTitle'));
  const frequencyLabel = latestWorkout
    ? latestWorkout.frequency_kind === 'total'
      ? String(t('home.weeklyActivity.logged', { count: latestWorkout.frequency_count }))
      : String(
          t(latestWorkout.frequency_count === 1 ? 'home.calendar.once' : 'home.calendar.many', {
            count: latestWorkout.frequency_count,
          }),
        )
    : String(t('home.calendar.emptyBody'));
  const accessibilityLabel = latestWorkout
    ? String(t('home.calendar.a11yWithLatest', { frequency: frequencyLabel, title }))
    : String(t('home.calendar.a11yEmpty'));

  return (
    <GradientCard
      accessibilityLabel={accessibilityLabel}
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
            marginBottom: spacing.three,
          },
        ]}>
        {t('home.calendar.title')}
      </Text>
      <View style={[styles.monthHeader, { marginBottom: spacing.three }]}>
        {months.map((month) => (
          <Text
            key={month.key}
            style={[
              styles.monthLabel,
              {
                color: colors.textBody,
                fontSize: typography.labelCaps.fontSize,
                fontWeight: typography.labelCaps.fontWeight,
                lineHeight: typography.labelCaps.lineHeight,
                letterSpacing: typography.labelCaps.letterSpacing,
              },
            ]}>
            {month.label}
          </Text>
        ))}
      </View>

      <View style={[styles.calendarRow, { gap: spacing.three }]}>
        {months.map((month) => (
          <View key={month.key} style={styles.monthGrid} accessible={false}>
            {month.days.map((dayKey) => {
              const isActive = activeDateKeys.has(dayKey);
              return (
                <View
                  key={dayKey}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  style={[
                    styles.dot,
                    {
                      backgroundColor: colors.textPrimary,
                      opacity: isActive ? 0.85 : 0.12,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.outlineVariant,
            gap: spacing.three,
            marginTop: spacing.paddingCard,
            paddingTop: spacing.three,
          },
        ]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.textSecondary} />
          </View>
        ) : (
          <>
            <View
              style={[
                styles.ring,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant,
                },
              ]}>
              <Text
                style={[
                  styles.ringText,
                  {
                    color: colors.textBody,
                    fontFamily: typography.families.mono,
                    fontSize: typography.dataMd.fontSize,
                    fontWeight: typography.dataMd.fontWeight,
                    lineHeight: typography.dataMd.lineHeight,
                  },
                ]}>
                {latestWorkout?.frequency_count ?? 0}
              </Text>
            </View>
            <View style={[styles.footerText, { gap: spacing.one }]}>
              <Text
                numberOfLines={2}
                style={[
                  styles.workoutName,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.bodyLg.fontSize,
                    fontWeight: typography.bodyLg.fontWeight,
                    lineHeight: typography.bodyLg.lineHeight,
                  },
                ]}>
                {title}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.frequencyLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.labelCaps.fontSize,
                    fontWeight: typography.labelCaps.fontWeight,
                    lineHeight: typography.labelCaps.lineHeight,
                    letterSpacing: typography.labelCaps.letterSpacing,
                  },
                ]}>
                {frequencyLabel}
              </Text>
            </View>
            {repeatParams ? (
              <Pressable
                accessibilityLabel={String(t('home.calendar.repeatA11y', { title }))}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canRepeat }}
                disabled={!canRepeat}
                onPress={() => {
                  if (repeatParams) onRepeatWorkout?.(repeatParams);
                }}
                style={({ pressed }) => [
                  styles.repeatButton,
                  {
                    backgroundColor: canRepeat ? colors.buttonPrimary : colors.surfaceSecondary,
                    borderRadius: radius.md,
                    minHeight: 48,
                    opacity: !canRepeat ? 0.3 : pressed ? 0.88 : 1,
                    width: 48,
                  },
                ]}>
                <SymbolView
                  name={'play.fill' as SymbolViewProps['name']}
                  size={19}
                  tintColor={colors.buttonPrimaryText}
                />
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </GradientCard>
  );
}

function getVisibleMonths(
  anchorDate: Date,
  count: number,
  formatMonth: (value: Date | string) => string,
): MonthGrid[] {
  return Array.from({ length: count }, (_, index) => {
    const monthDate = new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth() - count + 1 + index,
      1,
    );
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return {
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: formatMonth(monthDate),
      days: Array.from({ length: daysInMonth }, (_, dayIndex) =>
        formatDateKey(new Date(year, month, dayIndex + 1)),
      ),
    };
  });
}

function formatDateKey(date: Date): string {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');
}

const styles = StyleSheet.create({
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    gap: 0,
  },
  dot: {
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerText: {
    flex: 1,
    minWidth: 0,
  },
  frequencyLabel: {
    textTransform: 'uppercase',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  monthGrid: {
    alignContent: 'flex-start',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: 5,
    maxWidth: 68,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  repeatButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    letterSpacing: 0,
  },
  ring: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 3,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  ringText: {
    letterSpacing: 0,
  },
  workoutName: {
    letterSpacing: 0,
  },
});
