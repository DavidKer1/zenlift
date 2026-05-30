import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_colors.dart';
import 'package:zenlift/theme/zenlift_spacing.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/widgets/zenlift_card.dart';

void main() {
  Widget buildSubject(Widget child) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: Scaffold(body: Center(child: child)),
    );
  }

  testWidgets('uses tonal card theme with no shadow or elevation', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildSubject(
        const ZenliftCard(key: Key('card'), child: Text('Routine preview')),
      ),
    );

    final material = tester.widget<Material>(
      find.descendant(
        of: find.byKey(const Key('card')),
        matching: find.byType(Material),
      ),
    );
    final padding = tester.widget<Padding>(
      find.descendant(
        of: find.byKey(const Key('card')),
        matching: find.byType(Padding),
      ),
    );

    expect(material.color, ZenliftColors.surfaceContainerLow);
    expect(material.elevation, 0);
    expect(material.shadowColor, Colors.transparent);
    expect(padding.padding, const EdgeInsets.all(ZenliftSpacing.cardPadding));
  });

  testWidgets('interactive variant exposes button semantics and handles taps', (
    tester,
  ) async {
    var taps = 0;
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        ZenliftCard.interactive(
          key: const Key('routine-card'),
          semanticLabel: 'Open push day routine',
          onPressed: () => taps += 1,
          child: const Text('Push Day'),
        ),
      ),
    );

    expect(
      tester.getSemantics(find.byKey(const Key('routine-card'))),
      matchesSemantics(
        label: 'Open push day routine',
        isButton: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );

    await tester.tap(find.byKey(const Key('routine-card')));
    await tester.pumpAndSettle();

    expect(taps, 1);
    handle.dispose();
  });
}
