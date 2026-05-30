import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class ExerciseDetailScreen extends StatelessWidget {
  const ExerciseDetailScreen({required this.exerciseId, super.key});

  final String exerciseId;

  @override
  Widget build(BuildContext context) {
    return RoutePlaceholder(
      appBarTitle: 'Exercise',
      title: 'Exercise detail',
      subtitle: exerciseId,
    );
  }
}
