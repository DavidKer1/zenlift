import 'package:flutter/material.dart';

import '../theme/zenlift_radii.dart';
import '../theme/zenlift_spacing.dart';

class ZenliftFilterChip extends StatelessWidget {
  const ZenliftFilterChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onPressed,
    this.semanticLabel,
  });

  final String label;
  final bool selected;
  final VoidCallback? onPressed;
  final String? semanticLabel;

  bool get _enabled => onPressed != null;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final disabledForeground = colors.onSurface.withValues(alpha: 0.38);
    final disabledBackground = colors.onSurface.withValues(alpha: 0.12);
    final background = selected
        ? colors.primaryContainer
        : colors.surfaceContainerHigh;
    final foreground = selected
        ? colors.onPrimaryContainer
        : colors.onSurfaceVariant;
    final effectiveBackground = _enabled ? background : disabledBackground;
    final effectiveForeground = _enabled ? foreground : disabledForeground;

    return Semantics(
      label: semanticLabel ?? label,
      button: true,
      selected: selected,
      enabled: _enabled,
      child: Material(
        color: effectiveBackground,
        elevation: 0,
        shadowColor: Colors.transparent,
        borderRadius: const BorderRadius.all(ZenliftRadii.pill),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onPressed,
          overlayColor: WidgetStateProperty.resolveWith((states) {
            if (!_enabled) {
              return Colors.transparent;
            }
            if (states.contains(WidgetState.pressed)) {
              return effectiveForeground.withValues(alpha: 0.10);
            }
            return null;
          }),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 48, minWidth: 48),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: ZenliftSpacing.gutter,
                vertical: 10,
              ),
              child: Center(
                widthFactor: 1,
                child: ExcludeSemantics(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: effectiveForeground,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
