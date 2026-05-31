import 'package:flutter/material.dart';

import 'zenlift_colors.dart';
import 'zenlift_radii.dart';
import 'zenlift_typography.dart';

ThemeData buildZenliftDarkTheme() {
  const colorScheme = ColorScheme.dark(
    primary: ZenliftColors.primary,
    onPrimary: ZenliftColors.onPrimary,
    primaryContainer: ZenliftColors.primaryContainer,
    onPrimaryContainer: ZenliftColors.onPrimaryContainer,
    inversePrimary: ZenliftColors.inversePrimary,
    primaryFixed: ZenliftColors.primaryFixed,
    primaryFixedDim: ZenliftColors.primaryFixedDim,
    onPrimaryFixed: ZenliftColors.onPrimaryFixed,
    onPrimaryFixedVariant: ZenliftColors.onPrimaryFixedVariant,
    secondary: ZenliftColors.secondary,
    onSecondary: ZenliftColors.onSecondary,
    secondaryContainer: ZenliftColors.secondaryContainer,
    onSecondaryContainer: ZenliftColors.onSecondaryContainer,
    secondaryFixed: ZenliftColors.secondaryFixed,
    secondaryFixedDim: ZenliftColors.secondaryFixedDim,
    onSecondaryFixed: ZenliftColors.onSecondaryFixed,
    onSecondaryFixedVariant: ZenliftColors.onSecondaryFixedVariant,
    tertiary: ZenliftColors.tertiary,
    onTertiary: ZenliftColors.onTertiary,
    tertiaryContainer: ZenliftColors.tertiaryContainer,
    onTertiaryContainer: ZenliftColors.onTertiaryContainer,
    tertiaryFixed: ZenliftColors.tertiaryFixed,
    tertiaryFixedDim: ZenliftColors.tertiaryFixedDim,
    onTertiaryFixed: ZenliftColors.onTertiaryFixed,
    onTertiaryFixedVariant: ZenliftColors.onTertiaryFixedVariant,
    surface: ZenliftColors.surface,
    surfaceDim: ZenliftColors.surfaceDim,
    surfaceBright: ZenliftColors.surfaceBright,
    surfaceContainerLowest: ZenliftColors.surfaceContainerLowest,
    surfaceContainerLow: ZenliftColors.surfaceContainerLow,
    surfaceContainer: ZenliftColors.surfaceContainer,
    surfaceContainerHigh: ZenliftColors.surfaceContainerHigh,
    surfaceContainerHighest: ZenliftColors.surfaceContainerHighest,
    surfaceTint: ZenliftColors.surfaceTint,
    onSurface: ZenliftColors.onSurface,
    onSurfaceVariant: ZenliftColors.onSurfaceVariant,
    inverseSurface: ZenliftColors.inverseSurface,
    onInverseSurface: ZenliftColors.inverseOnSurface,
    outline: ZenliftColors.outline,
    outlineVariant: ZenliftColors.outlineVariant,
    error: ZenliftColors.error,
    onError: ZenliftColors.onError,
    errorContainer: ZenliftColors.errorContainer,
    onErrorContainer: ZenliftColors.onErrorContainer,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: ZenliftColors.background,
    colorScheme: colorScheme,
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      displayLarge: ZenliftTypography.displayLarge,
      headlineLarge: ZenliftTypography.headlineLarge,
      headlineMedium: ZenliftTypography.headlineMedium,
      bodyLarge: ZenliftTypography.bodyLarge,
      bodyMedium: ZenliftTypography.bodyMedium,
      labelMedium: ZenliftTypography.dataMedium,
    ),
    cardTheme: const CardThemeData(
      color: ZenliftColors.surfaceContainerLow,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(ZenliftRadii.card),
      ),
    ),
  );
}
