import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/theme/zenlift_theme.dart';
import 'package:zenlift/widgets/zenlift_search_field.dart';

void main() {
  Widget buildSubject(Widget child) {
    return MaterialApp(
      theme: buildZenliftDarkTheme(),
      home: Scaffold(body: Center(child: child)),
    );
  }

  testWidgets('updates text and clears value with accessible clear button', (
    tester,
  ) async {
    final controller = TextEditingController();
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      buildSubject(
        ZenliftSearchField(
          key: const Key('search'),
          controller: controller,
          semanticLabel: 'Search exercises',
          clearSemanticLabel: 'Clear exercise search',
          placeholder: 'Search exercises',
        ),
      ),
    );

    await tester.enterText(find.byKey(const Key('search-input')), 'bench');
    await tester.pumpAndSettle();

    expect(controller.text, 'bench');
    expect(find.bySemanticsLabel('Clear exercise search'), findsOneWidget);

    await tester.tap(find.byKey(const Key('search-clear')));
    await tester.pumpAndSettle();

    expect(controller.text, isEmpty);
  });

  testWidgets('field and clear button meet accessibility guidelines', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final controller = TextEditingController(text: 'squat');
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      buildSubject(
        ZenliftSearchField(
          key: const Key('search'),
          controller: controller,
          semanticLabel: 'Search routines',
          clearSemanticLabel: 'Clear routine search',
          placeholder: 'Search routines',
        ),
      ),
    );

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });

  testWidgets('text field exposes a single labeled input semantics node', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    final controller = TextEditingController();
    addTearDown(controller.dispose);

    await tester.pumpWidget(
      buildSubject(
        ZenliftSearchField(
          key: const Key('search'),
          controller: controller,
          semanticLabel: 'Search exercises',
        ),
      ),
    );

    expect(find.bySemanticsLabel('Search exercises'), findsOneWidget);
    handle.dispose();
  });
}
