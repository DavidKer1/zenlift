import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/app/bootstrap.dart';

void main() {
  test('initializeZenlift completes', () async {
    await expectLater(initializeZenlift(), completes);
  });
}
