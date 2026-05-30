import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class ExerciseLibraryScreen extends StatelessWidget {
  const ExerciseLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      title: 'Exercise library',
      subtitle: 'Search exercises and inspect records.',
    );
  }
}
