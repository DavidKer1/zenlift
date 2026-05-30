import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class RoutineEditorScreen extends StatelessWidget {
  const RoutineEditorScreen.create({super.key}) : routineId = null;

  const RoutineEditorScreen.edit({required String this.routineId, super.key});

  final String? routineId;

  @override
  Widget build(BuildContext context) {
    final isEditing = routineId != null;
    return RoutePlaceholder(
      appBarTitle: 'Routine editor',
      title: isEditing ? 'Edit routine' : 'Create routine',
      subtitle: routineId ?? 'New routine',
    );
  }
}
