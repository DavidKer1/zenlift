import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      title: 'Settings',
      subtitle: 'Manage units, data, and app preferences.',
    );
  }
}
