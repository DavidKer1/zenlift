import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function FilterChip({ label, selected = false, onPress, accessibilityLabel }: FilterChipProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.buttonPrimary : colors.surfaceSecondary,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.three,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <ThemedText
        type="labelCaps"
        numberOfLines={1}
        themeColor={selected ? 'buttonPrimaryText' : 'textSecondary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
});
