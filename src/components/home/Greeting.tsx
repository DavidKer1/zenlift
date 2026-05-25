import { StyleSheet, Text, View } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

export function getTimeOfDayGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 6 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 18) return 'Good afternoon';
  return 'Good evening';
}

type GreetingProps = {
  name?: string;
};

export function Greeting({ name }: GreetingProps) {
  const { colors, spacing, typography } = useZenliftTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${getTimeOfDayGreeting()}${name ? `, ${name}` : ''}`}
      style={[styles.container, { gap: spacing.one }]}>
      <Text
        style={[
          styles.kicker,
          {
            color: colors.textSecondary,
            fontFamily: typography.families.sans,
            fontSize: typography.bodyMd.fontSize,
            lineHeight: typography.bodyMd.lineHeight,
          },
        ]}>
        Welcome back!
      </Text>
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: typography.headlineLgMobile.fontSize,
            fontWeight: typography.headlineLgMobile.fontWeight,
            lineHeight: typography.headlineLgMobile.lineHeight,
            letterSpacing: typography.headlineLgMobile.letterSpacing,
          },
        ]}>
        {getTimeOfDayGreeting()}
        {name ? `, ${name}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  kicker: {
    letterSpacing: 0,
  },
  title: {
    letterSpacing: 0,
  },
});
