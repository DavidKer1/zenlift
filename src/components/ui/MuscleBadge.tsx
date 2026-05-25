import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { type MuscleGroupName } from '@/theme/muscleColors';

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
  const label = accessibilityLabel ?? muscleName;

  const content = (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[
        styles.badge,
        {
          backgroundColor: isPrimary ? colors.surfaceSecondary : colors.surface,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.three,
        },
      ]}>
      <ThemedText
        type="labelCaps"
        numberOfLines={1}
        themeColor="textSecondary">
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
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 32,
  },
  pressed: {
    opacity: 0.74,
  },
});
