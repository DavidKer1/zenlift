import 'package:flutter/material.dart';

import '../theme/zenlift_spacing.dart';

class ZenliftCard extends StatelessWidget {
  const ZenliftCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(ZenliftSpacing.cardPadding),
  }) : onPressed = null,
       semanticLabel = null;

  const ZenliftCard.interactive({
    super.key,
    required this.child,
    required this.onPressed,
    required this.semanticLabel,
    this.padding = const EdgeInsets.all(ZenliftSpacing.cardPadding),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onPressed;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final cardTheme = Theme.of(context).cardTheme;
    final shape = cardTheme.shape ?? const RoundedRectangleBorder();
    final color = cardTheme.color ?? Theme.of(context).colorScheme.surface;

    final content = Material(
      color: color,
      elevation: 0,
      shadowColor: Colors.transparent,
      shape: shape,
      clipBehavior: Clip.antiAlias,
      child: Padding(padding: padding, child: child),
    );

    if (onPressed == null) {
      return content;
    }

    return Semantics(
      label: semanticLabel,
      button: true,
      child: Material(
        color: color,
        elevation: 0,
        shadowColor: Colors.transparent,
        shape: shape,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onPressed,
          overlayColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.pressed)) {
              return Theme.of(context).colorScheme.surfaceContainerHighest;
            }
            return null;
          }),
          child: Padding(
            padding: padding,
            child: ExcludeSemantics(child: child),
          ),
        ),
      ),
    );
  }
}
