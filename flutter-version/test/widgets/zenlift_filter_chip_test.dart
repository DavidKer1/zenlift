import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/widgets/zenlift_filter_chip.dart';

void main() {
  Widget buildSubject(Widget child) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: Scaffold(body: Center(child: child)),
    );
  }

  testWidgets('selected chip exposes selected semantics and handles taps', (
    tester,
  ) async {
    var taps = 0;
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        ZenliftFilterChip(
          key: const Key('selected-chip'),
          label: 'Chest',
          selected: true,
          onPressed: () => taps += 1,
        ),
      ),
    );

    expect(
      tester.getSemantics(find.byKey(const Key('selected-chip'))),
      matchesSemantics(
        label: 'Chest',
        isButton: true,
        isSelected: true,
        hasSelectedState: true,
        hasEnabledState: true,
        isEnabled: true,
        isFocusable: true,
        hasTapAction: true,
        hasFocusAction: true,
      ),
    );

    await tester.tap(find.byKey(const Key('selected-chip')));
    await tester.pumpAndSettle();

    expect(taps, 1);
    handle.dispose();
  });

  testWidgets('chip meets mobile tap target guidelines', (tester) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        ZenliftFilterChip(
          key: const Key('chip'),
          label: 'Back',
          selected: false,
          onPressed: () {},
        ),
      ),
    );

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });

  testWidgets('disabled chip exposes disabled semantics and ignores taps', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();

    await tester.pumpWidget(
      buildSubject(
        const ZenliftFilterChip(
          key: Key('disabled-chip'),
          label: 'Legs',
          selected: false,
          onPressed: null,
        ),
      ),
    );

    expect(
      tester.getSemantics(find.byKey(const Key('disabled-chip'))),
      matchesSemantics(
        label: 'Legs',
        isButton: true,
        hasSelectedState: true,
        isSelected: false,
        hasEnabledState: true,
        isEnabled: false,
      ),
    );

    await tester.tap(find.byKey(const Key('disabled-chip')));
    await tester.pumpAndSettle();
    handle.dispose();
  });

  testWidgets('long chip labels fit on narrow widths without overflow', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(220, 360));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      buildSubject(
        const SizedBox(
          width: 160,
          child: ZenliftFilterChip(
            key: Key('long-chip'),
            label: 'Very long muscle group label',
            selected: true,
            onPressed: null,
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.byKey(const Key('long-chip')), findsOneWidget);
  });
}
