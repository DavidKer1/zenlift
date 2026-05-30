import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type FABProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function FAB({
  accessibilityLabel,
  onPress,
  style,
}: FABProps) {
  const { colors, radius } = useZenliftTheme();
  const { t } = useTranslation();
  const buttonAccessibilityLabel = accessibilityLabel ?? String(t('routines.create'));

  return (
    <Pressable
      accessibilityLabel={buttonAccessibilityLabel}
      accessibilityRole="button"
      testID="routine-create-fab"
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
