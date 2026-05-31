import 'package:flutter/material.dart';

class RoutePlaceholder extends StatelessWidget {
  const RoutePlaceholder({
    required this.title,
    required this.subtitle,
    super.key,
    this.appBarTitle,
  });

  final String title;
  final String subtitle;
  final String? appBarTitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final content = SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Align(
          alignment: Alignment.topLeft,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: theme.textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (appBarTitle == null) {
      return content;
    }

    return Scaffold(
      appBar: AppBar(title: Text(appBarTitle!)),
      body: content,
    );
  }
}
