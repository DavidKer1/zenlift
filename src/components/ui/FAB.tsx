import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type FABProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function FAB({
  accessibilityLabel = 'Crear rutina',
  onPress,
  style,
}: FABProps) {
  const { colors, radius } = useZenliftTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.primaryPressed : colors.buttonPrimary,
          borderRadius: radius.pill,
          opacity: pressed ? 0.9 : 1,
          transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
        },
        style,
      ]}>
      <SymbolView name={'plus' as SymbolViewProps['name']} size={28} tintColor={colors.buttonPrimaryText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    bottom: 104,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    width: 60,
    zIndex: 20,
  },
});
