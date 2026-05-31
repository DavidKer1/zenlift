import 'package:flutter_test/flutter_test.dart';
import 'package:zenlift/features/settings/domain/units.dart';

void main() {
  test('converts kilograms to pounds', () {
    expect(kgToLb(100), closeTo(220.46, 0.01));
  });

  test('converts pounds to kilograms', () {
    expect(lbToKg(220.462), closeTo(100, 0.01));
  });

  test('converts only when source and target units differ', () {
    expect(convertWeight(62.5, from: WeightUnit.kg, to: WeightUnit.kg), 62.5);
    expect(convertWeight(100, from: WeightUnit.kg, to: WeightUnit.lb), 220.46);
  });

  test('formats weight with a text-safe unit label', () {
    expect(formatWeight(62.5, WeightUnit.kg), '62.5 kg');
    expect(formatWeight(135, WeightUnit.lb), '135 lb');
    expect(formatWeight(100.567, WeightUnit.kg), '100.57 kg');
  });

  test('formats weight without a unit label', () {
    expect(formatWeightShort(62.5), '62.5');
    expect(formatWeightShort(100.567), '100.57');
  });

  test('returns the standard plate increment for each unit', () {
    expect(getIncrement(WeightUnit.kg), 2.5);
    expect(getIncrement(WeightUnit.lb), 5);
  });
}
