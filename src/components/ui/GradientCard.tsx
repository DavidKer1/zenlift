import React, { type PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useZenliftTheme } from '@/providers/ThemeProvider';

type GradientCardProps = PropsWithChildren<{
  accessibilityLabel?: string;
  borderRadius?: number;
  padding?: number;
  style?: ViewStyle;
}>;

/**
 * Subtle bottom-to-top linear gradient card wrapper.
 *
 * Uses CSS `experimental_backgroundImage` (New Architecture / Fabric) to render
 * a gradient from `surfaceElevatedDark` (bottom) to `surfaceElevated` (top).
 * Falls back to solid `surfaceElevated` when CSS gradients are not available.
 */
export function GradientCard({
  accessibilityLabel,
  borderRadius,
  children,
  padding,
  style,
}: GradientCardProps) {
  const { colors } = useZenliftTheme();

  const gradientStyle: ViewStyle = {
    backgroundColor: colors.surfaceElevated,
    experimental_backgroundImage: `linear-gradient(to top, ${colors.surfaceElevatedDark}, ${colors.surfaceElevated})`,
    ...(borderRadius != null ? { borderRadius } : {}),
    ...(padding != null ? { padding } : {}),
    ...style,
  };

  return (
    <View
      accessible={accessibilityLabel != null}
      accessibilityLabel={accessibilityLabel}
      style={gradientStyle}>
      {children}
    </View>
  );
}
