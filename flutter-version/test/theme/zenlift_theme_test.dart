import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_colors.dart';
import 'package:zenlift/theme/zenlift_radii.dart';
import 'package:zenlift/theme/zenlift_spacing.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/theme/zenlift_typography.dart';

void main() {
  test('dark theme uses DESIGN.md colors', () {
    final theme = buildZenliftDarkTheme();

    expect(theme.brightness, Brightness.dark);
    expect(theme.colorScheme.surface, ZenliftColors.surface);
    expect(
      theme.colorScheme.surfaceContainerLowest,
      ZenliftColors.surfaceContainerLowest,
    );
    expect(
      theme.colorScheme.surfaceContainerLow,
      ZenliftColors.surfaceContainerLow,
    );
    expect(theme.colorScheme.surfaceContainer, ZenliftColors.surfaceContainer);
    expect(
      theme.colorScheme.surfaceContainerHigh,
      ZenliftColors.surfaceContainerHigh,
    );
    expect(
      theme.colorScheme.surfaceContainerHighest,
      ZenliftColors.surfaceContainerHighest,
    );
    expect(theme.colorScheme.primary, ZenliftColors.primary);
    expect(theme.colorScheme.onPrimary, ZenliftColors.onPrimary);
    expect(theme.colorScheme.primaryContainer, ZenliftColors.primaryContainer);
    expect(
      theme.colorScheme.onPrimaryContainer,
      ZenliftColors.onPrimaryContainer,
    );
    expect(theme.colorScheme.inversePrimary, ZenliftColors.inversePrimary);
    expect(theme.colorScheme.secondary, ZenliftColors.secondary);
    expect(theme.colorScheme.onSecondary, ZenliftColors.onSecondary);
    expect(
      theme.colorScheme.secondaryContainer,
      ZenliftColors.secondaryContainer,
    );
    expect(
      theme.colorScheme.onSecondaryContainer,
      ZenliftColors.onSecondaryContainer,
    );
    expect(theme.colorScheme.tertiary, ZenliftColors.tertiary);
    expect(theme.colorScheme.onTertiary, ZenliftColors.onTertiary);
    expect(
      theme.colorScheme.tertiaryContainer,
      ZenliftColors.tertiaryContainer,
    );
    expect(
      theme.colorScheme.onTertiaryContainer,
      ZenliftColors.onTertiaryContainer,
    );
    expect(theme.colorScheme.error, ZenliftColors.error);
    expect(theme.colorScheme.onError, ZenliftColors.onError);
    expect(theme.colorScheme.errorContainer, ZenliftColors.errorContainer);
    expect(theme.colorScheme.onErrorContainer, ZenliftColors.onErrorContainer);
    expect(theme.colorScheme.onSurface, ZenliftColors.onSurface);
    expect(theme.colorScheme.onSurfaceVariant, ZenliftColors.onSurfaceVariant);
    expect(theme.colorScheme.inverseSurface, ZenliftColors.inverseSurface);
    expect(theme.colorScheme.onInverseSurface, ZenliftColors.inverseOnSurface);
    expect(theme.colorScheme.outline, ZenliftColors.outline);
    expect(theme.colorScheme.outlineVariant, ZenliftColors.outlineVariant);
    expect(theme.scaffoldBackgroundColor, ZenliftColors.background);
  });

  test('ports fixed and surface tint tokens', () {
    final scheme = buildZenliftDarkTheme().colorScheme;

    expect(scheme.primaryFixed, ZenliftColors.primaryFixed);
    expect(scheme.primaryFixedDim, ZenliftColors.primaryFixedDim);
    expect(scheme.onPrimaryFixed, ZenliftColors.onPrimaryFixed);
    expect(
      scheme.onPrimaryFixedVariant,
      ZenliftColors.onPrimaryFixedVariant,
    );
    expect(scheme.secondaryFixed, ZenliftColors.secondaryFixed);
    expect(scheme.secondaryFixedDim, ZenliftColors.secondaryFixedDim);
    expect(scheme.onSecondaryFixed, ZenliftColors.onSecondaryFixed);
    expect(
      scheme.onSecondaryFixedVariant,
      ZenliftColors.onSecondaryFixedVariant,
    );
    expect(scheme.tertiaryFixed, ZenliftColors.tertiaryFixed);
    expect(scheme.tertiaryFixedDim, ZenliftColors.tertiaryFixedDim);
    expect(scheme.onTertiaryFixed, ZenliftColors.onTertiaryFixed);
    expect(
      scheme.onTertiaryFixedVariant,
      ZenliftColors.onTertiaryFixedVariant,
    );
    expect(scheme.surfaceTint, ZenliftColors.surfaceTint);
  });

  test('green is not the primary color', () {
    expect(
      ZenliftColors.primary.toARGB32(),
      isNot(const Color(0xff00ff00).toARGB32()),
    );
    expect(
      ZenliftColors.success.toARGB32(),
      isNot(ZenliftColors.primary.toARGB32()),
    );
  });

  test('typography maps Inter and JetBrains Mono roles', () {
    final textTheme = buildZenliftDarkTheme().textTheme;

    expect(textTheme.displayLarge?.fontFamily, 'Inter');
    expect(textTheme.displayLarge?.fontSize, 40);
    expect(textTheme.displayLarge?.fontWeight, FontWeight.w700);
    expect(textTheme.headlineLarge?.fontFamily, 'Inter');
    expect(textTheme.headlineLarge?.fontSize, 32);
    expect(textTheme.headlineLarge?.fontWeight, FontWeight.w600);
    expect(textTheme.headlineMedium?.fontFamily, 'Inter');
    expect(textTheme.headlineMedium?.fontSize, 20);
    expect(textTheme.bodyLarge?.fontFamily, 'Inter');
    expect(textTheme.bodyLarge?.fontSize, 16);
    expect(textTheme.bodyMedium?.fontFamily, 'Inter');
    expect(textTheme.bodyMedium?.fontSize, 14);
    expect(textTheme.labelMedium?.fontFamily, 'JetBrains Mono');
    expect(textTheme.labelMedium?.fontSize, 14);
    expect(ZenliftTypography.dataLarge.fontFamily, 'JetBrains Mono');
    expect(ZenliftTypography.dataMedium.fontFamily, 'JetBrains Mono');
  });

  test('spacing and radius tokens match DESIGN.md component rules', () {
    expect(ZenliftSpacing.lateral, 24);
    expect(ZenliftSpacing.gutter, 16);
    expect(ZenliftSpacing.stackSm, 8);
    expect(ZenliftSpacing.stackMd, 16);
    expect(ZenliftSpacing.stackLg, 32);
    expect(ZenliftSpacing.cardPadding, 20);

    expect(ZenliftRadii.small, 4);
    expect(ZenliftRadii.base, 8);
    expect(ZenliftRadii.card.x, 12);
    expect(ZenliftRadii.large, 16);
    expect(ZenliftRadii.extraLarge, 24);
    expect(ZenliftRadii.pill.x, 9999);
  });

  test('cards use tonal layering with no shadow', () {
    final cardTheme = buildZenliftDarkTheme().cardTheme;
    final shape = cardTheme.shape! as RoundedRectangleBorder;
    final borderRadius = shape.borderRadius as BorderRadius;

    expect(cardTheme.color, ZenliftColors.surfaceContainerLow);
    expect(cardTheme.elevation, 0);
    expect(cardTheme.margin, EdgeInsets.zero);
    expect(borderRadius.topLeft, ZenliftRadii.card);
    expect(borderRadius.topRight, ZenliftRadii.card);
    expect(borderRadius.bottomLeft, ZenliftRadii.card);
    expect(borderRadius.bottomRight, ZenliftRadii.card);
  });
}
