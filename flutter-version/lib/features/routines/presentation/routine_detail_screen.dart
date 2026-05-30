import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class RoutineDetailScreen extends StatelessWidget {
  const RoutineDetailScreen({required this.routineId, super.key});

  final String routineId;

  @override
  Widget build(BuildContext context) {
    return RoutePlaceholder(
      appBarTitle: 'Routine',
      title: 'Routine detail',
      subtitle: routineId,
    );
  }
}
