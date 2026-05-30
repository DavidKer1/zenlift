import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class ActiveWorkoutScreen extends StatelessWidget {
  const ActiveWorkoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      appBarTitle: 'Workout',
      title: 'Active workout',
      subtitle: 'Log sets with the high-priority workout surface.',
    );
  }
}
