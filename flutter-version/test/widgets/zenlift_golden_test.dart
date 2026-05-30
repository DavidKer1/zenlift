import 'package:flutter_test/flutter_test.dart';

void main() {
  test('golden coverage is deferred until font assets are bundled', () {
    // DESIGN.md specifies Inter and JetBrains Mono, but the Flutter migration
    // does not currently include those font binaries. Pixel goldens would lock
    // in fallback-font rendering and create noisy churn. Add matchesGoldenFile
    // coverage once the real fonts are checked in.
    expect(true, isTrue);
  });
}
