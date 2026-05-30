import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class WorkoutSummaryScreen extends StatelessWidget {
  const WorkoutSummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      appBarTitle: 'Summary',
      title: 'Workout summary',
      subtitle: 'Review duration, volume, sets, and PRs.',
    );
  }
}
