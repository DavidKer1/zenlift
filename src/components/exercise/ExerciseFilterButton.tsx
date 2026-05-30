import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useZenliftTheme } from '@/providers/ThemeProvider';

type ExerciseFilterButtonProps = {
  label: string;
  valueLabel: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

export function ExerciseFilterButton({
  label,
  valueLabel,
  selected,
  onPress,
  accessibilityLabel,
}: ExerciseFilterButtonProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? colors.surfaceElevated : colors.surfaceSecondary,
          borderColor: selected ? colors.textPrimary : colors.outlineVariant,
          borderRadius: radius.md,
          paddingHorizontal: spacing.three,
          opacity: pressed ? 0.78 : 1,
        },
      ]}>
      <View style={styles.textGroup}>
        <ThemedText type="labelCaps" themeColor="textSecondary" numberOfLines={1}>
          {label}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="textPrimary" numberOfLines={1}>
          {valueLabel}
        </ThemedText>
      </View>
      <SymbolView
        name={{ ios: 'chevron.up.chevron.down', android: 'unfold_more', web: 'unfold_more' }}
        size={20}
        tintColor={colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 56,
    minWidth: 0,
  },
  textGroup: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
});
