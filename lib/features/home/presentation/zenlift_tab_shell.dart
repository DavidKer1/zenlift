import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ZenliftTabShell extends StatelessWidget {
  const ZenliftTabShell({
    required this.navigationBarKey,
    required this.navigationShell,
    required this.destinations,
    super.key,
  });

  final Key navigationBarKey;
  final StatefulNavigationShell navigationShell;
  final List<ZenliftTabDestination> destinations;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        key: navigationBarKey,
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: navigationShell.goBranch,
        destinations: [
          for (final tab in destinations)
            NavigationDestination(
              key: tab.key,
              icon: Icon(tab.icon),
              selectedIcon: Icon(tab.selectedIcon),
              label: tab.label,
            ),
        ],
      ),
    );
  }
}

class ZenliftTabDestination {
  const ZenliftTabDestination({
    required this.path,
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.key,
  });

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final Key key;
}
