import 'package:flutter_test/flutter_test.dart';

void main() {
  test('golden coverage is deferred until font assets are bundled', () {
    // DESIGN.md specifies Inter and JetBrains Mono; widget tests use Flutter's
    // default test fonts in CI.
    expect(true, isTrue);
  });
}
