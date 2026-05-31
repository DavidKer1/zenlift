import 'package:flutter/material.dart';

import '../theme/zenlift_radii.dart';
import '../theme/zenlift_spacing.dart';

class ZenliftSearchField extends StatefulWidget {
  const ZenliftSearchField({
    super.key,
    required this.controller,
    required this.semanticLabel,
    this.clearSemanticLabel = 'Clear search',
    this.placeholder = 'Search...',
    this.onChanged,
  });

  final TextEditingController controller;
  final String semanticLabel;
  final String clearSemanticLabel;
  final String placeholder;
  final ValueChanged<String>? onChanged;

  @override
  State<ZenliftSearchField> createState() => _ZenliftSearchFieldState();
}

class _ZenliftSearchFieldState extends State<ZenliftSearchField> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_handleControllerChanged);
  }

  @override
  void didUpdateWidget(covariant ZenliftSearchField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller.removeListener(_handleControllerChanged);
      widget.controller.addListener(_handleControllerChanged);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_handleControllerChanged);
    super.dispose();
  }

  void _handleControllerChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  void _clear() {
    widget.controller.clear();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final hasValue = widget.controller.text.isNotEmpty;

    return Material(
      color: colors.surfaceContainerHigh,
      elevation: 0,
      shadowColor: Colors.transparent,
      borderRadius: const BorderRadius.all(
        Radius.circular(ZenliftRadii.medium),
      ),
      clipBehavior: Clip.antiAlias,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 52),
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: ZenliftSpacing.gutter,
          ),
          child: Row(
            children: <Widget>[
              Icon(Icons.search, size: 20, color: colors.onSurfaceVariant),
              const SizedBox(width: 10),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: Semantics(
                    label: widget.semanticLabel,
                    textField: true,
                    child: TextField(
                      key: const Key('search-input'),
                      controller: widget.controller,
                      onChanged: widget.onChanged,
                      minLines: 1,
                      maxLines: 1,
                      textInputAction: TextInputAction.search,
                      autocorrect: false,
                      enableSuggestions: false,
                      style: Theme.of(
                        context,
                      ).textTheme.bodyLarge?.copyWith(color: colors.onSurface),
                      decoration: InputDecoration(
                        hintText: widget.placeholder,
                        hintStyle: Theme.of(context).textTheme.bodyLarge
                            ?.copyWith(color: colors.onSurfaceVariant),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 12,
                        ),
                        constraints: const BoxConstraints(minHeight: 48),
                      ),
                    ),
                  ),
                ),
              ),
              if (hasValue)
                Semantics(
                  label: widget.clearSemanticLabel,
                  button: true,
                  child: Material(
                    color: Colors.transparent,
                    shape: const CircleBorder(),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      key: const Key('search-clear'),
                      onTap: _clear,
                      customBorder: const CircleBorder(),
                      child: SizedBox.square(
                        dimension: 48,
                        child: Icon(
                          Icons.cancel,
                          size: 20,
                          color: colors.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
