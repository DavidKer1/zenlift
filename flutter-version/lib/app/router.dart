import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final zenliftRouter = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const _BootstrapRoute(),
    ),
  ],
);

class _BootstrapRoute extends StatelessWidget {
  const _BootstrapRoute();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SizedBox.shrink(),
    );
  }
}
