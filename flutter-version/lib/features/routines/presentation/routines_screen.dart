import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class RoutinesScreen extends StatelessWidget {
  const RoutinesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      title: 'Routines',
      subtitle: 'Create, edit, and start training plans.',
    );
  }
}
