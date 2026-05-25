import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { GradientCard } from '@/components/ui/GradientCard';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type StartWorkoutButtonProps = {
  label?: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
};

export function StartWorkoutButton({
  label = 'Start Workout',
  variant = 'primary',
  onPress,
}: StartWorkoutButtonProps) {
  const { colors, radius, spacing, typography } = useZenliftTheme();
  const isPrimary = variant === 'primary';

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.button,
    {
      backgroundColor: isPrimary ? colors.buttonPrimary : 'transparent',
      borderRadius: radius.xl,
      minHeight: 56,
      opacity: pressed ? 0.9 : 1,
      transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
      paddingHorizontal: spacing.three,
    },
  ];

  const content = (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress ?? (() => router.push('/routines'))}
      style={pressableStyle}>
      <Text
        style={[
          styles.label,
          {
            color: isPrimary ? colors.buttonPrimaryText : colors.textBody,
            fontSize: typography.bodyLg.fontSize,
            fontWeight: typography.bodyLg.fontWeight,
            lineHeight: typography.bodyLg.lineHeight,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );

  if (isPrimary) {
    return content;
  }

  return (
    <GradientCard borderRadius={radius.xl}>
      {content}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    letterSpacing: 0,
  },
});
