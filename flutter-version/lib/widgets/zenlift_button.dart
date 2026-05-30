import 'package:flutter/material.dart';

import '../theme/zenlift_radii.dart';
import '../theme/zenlift_spacing.dart';

enum ZenliftButtonVariant { primary, secondary, ghost }

class ZenliftButton extends StatelessWidget {
  const ZenliftButton.primary({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.semanticLabel,
  }) : variant = ZenliftButtonVariant.primary;

  const ZenliftButton.secondary({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.semanticLabel,
  }) : variant = ZenliftButtonVariant.secondary;

  const ZenliftButton.ghost({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.semanticLabel,
  }) : variant = ZenliftButtonVariant.ghost;

  final ZenliftButtonVariant variant;
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final String? semanticLabel;

  bool get _enabled => onPressed != null;

  @override
  Widget build(BuildContext context) {
    final style = _styleFor(context);

    return Semantics(
      label: semanticLabel ?? label,
      button: true,
      enabled: _enabled,
      child: Material(
        color: style.background,
        elevation: 0,
        shadowColor: Colors.transparent,
        borderRadius: const BorderRadius.all(ZenliftRadii.compactControl),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onPressed,
          overlayColor: WidgetStateProperty.resolveWith((states) {
            if (!_enabled) {
              return Colors.transparent;
            }
            if (states.contains(WidgetState.pressed)) {
              return style.pressedOverlay;
            }
            return null;
          }),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 48),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: ZenliftSpacing.gutter,
                vertical: 12,
              ),
              child: ExcludeSemantics(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    if (icon != null) ...[
                      Icon(icon, size: 18, color: style.foreground),
                      const SizedBox(width: ZenliftSpacing.stackSm),
                    ],
                    Flexible(
                      child: Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: style.foreground,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  _ZenliftButtonStyle _styleFor(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final disabledForeground = colors.onSurface.withValues(alpha: 0.38);
    final disabledBackground = colors.onSurface.withValues(alpha: 0.12);

    if (!_enabled) {
      return _ZenliftButtonStyle(
        background: variant == ZenliftButtonVariant.ghost
            ? Colors.transparent
            : disabledBackground,
        foreground: disabledForeground,
        pressedOverlay: Colors.transparent,
      );
    }

    switch (variant) {
      case ZenliftButtonVariant.primary:
        return _ZenliftButtonStyle(
          background: colors.primary,
          foreground: colors.onPrimary,
          pressedOverlay: colors.onPrimary.withValues(alpha: 0.10),
        );
      case ZenliftButtonVariant.secondary:
        return _ZenliftButtonStyle(
          background: colors.surfaceContainerHigh,
          foreground: colors.onSurface,
          pressedOverlay: colors.onSurface.withValues(alpha: 0.08),
        );
      case ZenliftButtonVariant.ghost:
        return _ZenliftButtonStyle(
          background: Colors.transparent,
          foreground: colors.onSurfaceVariant,
          pressedOverlay: colors.onSurface.withValues(alpha: 0.08),
        );
    }
  }
}

class _ZenliftButtonStyle {
  const _ZenliftButtonStyle({
    required this.background,
    required this.foreground,
    required this.pressedOverlay,
  });

  final Color background;
  final Color foreground;
  final Color pressedOverlay;
}
