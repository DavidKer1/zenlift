import 'package:flutter/material.dart';

import '../../home/presentation/route_placeholder.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoutePlaceholder(
      appBarTitle: 'Welcome',
      title: 'Onboarding',
      subtitle: 'Choose units and reach the first workout quickly.',
    );
  }
}
