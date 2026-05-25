import React, { type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type CardProps = PropsWithChildren<{
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
  style?: ViewStyle;
}>;

/**
 * Base Card component implementing the monochromatic tonal surface design:
 * - #18191D background (surface)
 * - 12px border radius
 * - 20px internal padding
 * - No border, no shadow
 * - Scale-on-press feedback when interactive
 */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityRole = onPress ? 'button' : 'none',
  style,
}: CardProps) {
  const { colors, radius, spacing } = useZenliftTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.paddingCard,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          { transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }] },
          style,
        ]}>
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({});
