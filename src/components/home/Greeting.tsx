import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useZenliftTheme } from '@/providers/ThemeProvider';

export type TimeOfDayGreetingKey = 'morning' | 'afternoon' | 'evening';

export function getTimeOfDayGreeting(date = new Date()): TimeOfDayGreetingKey {
  const hour = date.getHours();

  if (hour >= 6 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 18) return 'afternoon';
  return 'evening';
}

type GreetingProps = {
  name?: string;
};

export function Greeting({ name }: GreetingProps) {
  const { colors, spacing, typography } = useZenliftTheme();
  const { t } = useTranslation();
  const greeting = String(t(`home.greeting.${getTimeOfDayGreeting()}`));
  const fallback = String(t('home.greeting.fallback'));

  return (
    <View
      accessible
      accessibilityLabel={`${greeting}${name ? `, ${name}` : ''}`}
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
        {fallback}
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
        {greeting}
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
