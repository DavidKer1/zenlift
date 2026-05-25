import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type StartWorkoutButtonProps = {
  label?: string;
  variant?: 'primary' | 'secondary';
};

export function StartWorkoutButton({
  label = 'Start Workout',
  variant = 'primary',
}: StartWorkoutButtonProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => router.push('/routines')}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? colors.primary : colors.primarySoft,
          borderColor: isPrimary ? colors.primary : colors.border,
          borderRadius: radius.lg,
          minHeight: 56,
          opacity: pressed ? 0.72 : 1,
          paddingHorizontal: spacing.three,
        },
      ]}>
      <Text
        style={[
          styles.label,
          {
            color: isPrimary ? colors.surface : colors.text,
            fontFamily: typography.families.sans,
            fontSize: typography.size.md,
            fontWeight: typography.weight.bold,
            lineHeight: typography.lineHeight.md,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    letterSpacing: 0,
  },
});
