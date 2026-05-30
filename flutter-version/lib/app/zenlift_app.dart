import 'package:flutter/material.dart';

import '../theme/zenlift_theme.dart';
import 'router.dart';

class ZenliftApp extends StatelessWidget {
  const ZenliftApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Zenlift',
      debugShowCheckedModeBanner: false,
      theme: buildZenliftDarkTheme(),
      routerConfig: zenliftRouter,
    );
  }
}
