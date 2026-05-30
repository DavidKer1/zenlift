import 'package:flutter/material.dart';

import 'route_placeholder.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      title: 'Home',
      subtitle: 'Start workouts and review the week.',
    );
  }
}
