import { StyleSheet, Text, View } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

type WeeklyActivityCardProps = {
  activeDays: boolean[];
};

export function WeeklyActivityCard({ activeDays }: WeeklyActivityCardProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const hasActivity = activeDays.some(Boolean);

  return (
    <View
      accessible
      accessibilityLabel="Weekly activity card"
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.md,
          padding: spacing.paddingCard,
        },
      ]}>
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
          Weekly activity
        </Text>
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
            No activity this week
          </Text>
        ) : null}
      </View>

      <View style={[styles.weekRow, { gap: spacing.two }]}>
        {WEEKDAYS.map((label, index) => {
          const isActive = activeDays[index] ?? false;

          return (
            <View key={label} style={[styles.dayColumn, { gap: spacing.one }]}>
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
          Start a workout to see your progress
        </Text>
      ) : null}
    </View>
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
