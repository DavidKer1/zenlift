import { StyleSheet, Text, View } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

export function getTimeOfDayGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 6 && hour <= 11) return 'Buenos días';
  if (hour >= 12 && hour <= 18) return 'Buenas tardes';
  return 'Buenas noches';
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
            color: colors.mutedText,
            fontFamily: typography.families.sans,
            fontSize: typography.size.sm,
            lineHeight: typography.lineHeight.sm,
          },
        ]}>
        ¡Bienvenido de nuevo!
      </Text>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontFamily: typography.families.sans,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            lineHeight: typography.lineHeight.xl,
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
