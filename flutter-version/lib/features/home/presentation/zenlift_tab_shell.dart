import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ZenliftTabShell extends StatelessWidget {
  const ZenliftTabShell({
    required this.navigationBarKey,
    required this.location,
    required this.destinations,
    required this.child,
    super.key,
  });

  final Key navigationBarKey;
  final String location;
  final List<ZenliftTabDestination> destinations;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        key: navigationBarKey,
        selectedIndex: _selectedIndex(location),
        onDestinationSelected: (index) => context.go(destinations[index].path),
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

  int _selectedIndex(String location) {
    final index = destinations.indexWhere((tab) => tab.path == location);
    return index < 0 ? 0 : index;
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
