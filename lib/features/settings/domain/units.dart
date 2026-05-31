enum WeightUnit {
  kg('kg'),
  lb('lb');

  const WeightUnit(this.value);

  final String value;

  static WeightUnit fromText(String value) {
    return switch (value) {
      'lb' => WeightUnit.lb,
      _ => WeightUnit.kg,
    };
  }
}

const _kgToLbFactor = 2.20462;

double kgToLb(double kg) {
  return _roundTwoDecimals(kg * _kgToLbFactor);
}

double lbToKg(double lb) {
  return _roundTwoDecimals(lb / _kgToLbFactor);
}

double convertWeight(
  double value, {
  required WeightUnit from,
  required WeightUnit to,
}) {
  if (from == to) {
    return value;
  }

  return from == WeightUnit.kg ? kgToLb(value) : lbToKg(value);
}

String formatWeight(double value, WeightUnit unit) {
  return '${formatWeightShort(value)} ${unit.value}';
}

String formatWeightShort(double value) {
  final rounded = _roundTwoDecimals(value);
  if (rounded % 1 == 0) {
    return rounded.toInt().toString();
  }

  return rounded.toString();
}

double getIncrement(WeightUnit unit) {
  return unit == WeightUnit.kg ? 2.5 : 5;
}

double _roundTwoDecimals(double value) {
  return (value * 100).roundToDouble() / 100;
}
