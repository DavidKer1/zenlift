import { StyleSheet, Text, View } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

type WeeklyActivityCardProps = {
  activeDays: boolean[];
};

export function WeeklyActivityCard({ activeDays }: WeeklyActivityCardProps) {
  const { colors, radius, shadows, spacing, typography } = useZenliftTheme();
  const hasActivity = activeDays.some(Boolean);

  return (
    <View
      accessible
      accessibilityLabel="Weekly activity card"
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.three,
        },
      ]}>
      <View style={{ gap: spacing.one }}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              fontFamily: typography.families.sans,
              fontSize: typography.size.md,
              fontWeight: typography.weight.bold,
              lineHeight: typography.lineHeight.md,
            },
          ]}>
          Weekly activity
        </Text>
        {!hasActivity ? (
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
                    backgroundColor: isActive ? colors.primary : colors.border,
                    borderRadius: radius.xs,
                  },
                ]}
              />
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isActive ? colors.text : colors.mutedText,
                    fontFamily: typography.families.sans,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.semibold,
                    lineHeight: typography.lineHeight.xs,
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
              color: colors.mutedText,
              fontFamily: typography.families.sans,
              fontSize: typography.size.sm,
              lineHeight: typography.lineHeight.sm,
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
    borderWidth: 1,
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
