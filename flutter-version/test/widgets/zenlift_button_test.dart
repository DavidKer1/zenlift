import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_colors.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/widgets/zenlift_button.dart';

void main() {
  Widget buildSubject(Widget child, {Size size = const Size(390, 844)}) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: MediaQuery(
        data: MediaQueryData(size: size),
        child: Scaffold(body: Center(child: child)),
      ),
    );
  }

  testWidgets('variants use theme colors and primary is not success green', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildSubject(
        Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ZenliftButton.primary(
              key: const Key('primary'),
              label: 'Start workout',
              onPressed: () {},
            ),
            ZenliftButton.secondary(
              key: const Key('secondary'),
              label: 'Edit routine',
              onPressed: () {},
            ),
            ZenliftButton.ghost(
              key: const Key('ghost'),
              label: 'Skip',
              onPressed: () {},
            ),
          ],
        ),
      ),
    );

    Color buttonColor(String key) {
      final material = tester.widget<Material>(
        find.descendant(
          of: find.byKey(Key(key)),
          matching: find.byType(Material),
        ),
      );
      return material.color!;
    }

    expect(buttonColor('primary'), ZenliftColors.primary);
    expect(buttonColor('primary'), isNot(ZenliftColors.success));
    expect(buttonColor('secondary'), ZenliftColors.surfaceContainerHigh);
    expect(buttonColor('ghost'), Colors.transparent);
  });

  testWidgets('disabled button does not call callback', (tester) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        ZenliftButton.primary(
          key: const Key('disabled'),
          label: 'Finish',
          onPressed: null,
        ),
      ),
    );

    expect(
      tester.getSemantics(find.byKey(const Key('disabled'))),
      matchesSemantics(
        label: 'Finish',
        isButton: true,
        hasEnabledState: true,
        isEnabled: false,
      ),
    );

    await tester.tap(find.byKey(const Key('disabled')));
    await tester.pumpAndSettle();

    final material = tester.widget<Material>(
      find.descendant(
        of: find.byKey(const Key('disabled')),
        matching: find.byType(Material),
      ),
    );
    expect(material.color, isNot(ZenliftColors.primary));
    handle.dispose();
  });

  testWidgets('long labels fit on narrow mobile widths without overflow', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(240, 360));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      buildSubject(
        SizedBox(
          width: 208,
          child: ZenliftButton.primary(
            key: const Key('long-label'),
            icon: Icons.fitness_center,
            label: 'Start very long hypertrophy workout now',
            onPressed: () {},
          ),
        ),
        size: const Size(240, 360),
      ),
    );

    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.byKey(const Key('long-label')), findsOneWidget);
  });

  testWidgets('interactive buttons meet tap target and label guidelines', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        ZenliftButton.secondary(
          key: const Key('accessible-button'),
          icon: Icons.add,
          label: 'Add set',
          onPressed: () {},
        ),
      ),
    );

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });

  testWidgets('semantic label replaces visible button text for accessibility', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        ZenliftButton.primary(
          key: const Key('semantic-button'),
          label: 'Start',
          semanticLabel: 'Start push day workout',
          onPressed: () {},
        ),
      ),
    );

    expect(
      tester.getSemantics(find.byKey(const Key('semantic-button'))),
      matchesSemantics(
        label: 'Start push day workout',
        isButton: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );
    handle.dispose();
  });
}
