import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      title: 'History',
      subtitle: 'Review completed workout sessions.',
    );
  }
}
