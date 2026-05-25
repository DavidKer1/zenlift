import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { muscleColors, type MuscleGroupName } from '@/theme/muscleColors';

type MuscleBadgeProps = {
  muscleName: MuscleGroupName;
  isPrimary?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
};

export function MuscleBadge({
  muscleName,
  isPrimary = false,
  accessibilityLabel,
  onPress,
}: MuscleBadgeProps) {
  const { colors, radius, spacing } = useZenliftTheme();
  const color = muscleColors[muscleName] ?? colors.mutedText;
  const label = accessibilityLabel ?? muscleName;

  const content = (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[
        styles.badge,
        {
          backgroundColor: isPrimary ? color : colors.surface,
          borderColor: color,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.three,
        },
      ]}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: color,
            borderRadius: radius.pill,
          },
        ]}
      />
      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={[styles.label, { color: isPrimary ? colors.surface : color }]}>
        {muscleName}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
  },
  dot: {
    height: 8,
    width: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.74,
  },
});
