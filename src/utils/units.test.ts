import {
  kgToLb,
  lbToKg,
  convertWeight,
  formatWeight,
  formatWeightShort,
  getIncrement,
} from './units';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  // --- 2.1: Conversion function tests ---

  assert(kgToLb(100) === 220.46, 'kgToLb(100) should be 220.46');
  assert(kgToLb(62.5) === 137.79, 'kgToLb(62.5) should be 137.79');
  assert(kgToLb(25) === 55.12, 'kgToLb(25) should be 55.12');
  assert(kgToLb(1) === 2.2, 'kgToLb(1) should be 2.2');

  assert(lbToKg(220.46) === 100, 'lbToKg(220.46) should be 100');
  assert(lbToKg(135) === 61.24, 'lbToKg(135) should be 61.24');
  assert(lbToKg(45) === 20.41, 'lbToKg(45) should be 20.41');

  assert(convertWeight(62.5, 'kg', 'lb') === 137.79, 'convertWeight(62.5, kg, lb) should be 137.79');
  assert(convertWeight(135, 'lb', 'kg') === 61.24, 'convertWeight(135, lb, kg) should be 61.24');
  assert(convertWeight(100, 'kg', 'kg') === 100, 'convertWeight(100, kg, kg) should return same value');
  assert(convertWeight(50, 'lb', 'lb') === 50, 'convertWeight(50, lb, lb) should return same value');

  assert(formatWeight(62.5, 'kg') === '62.5 kg', 'formatWeight(62.5, kg) should be "62.5 kg"');
  assert(formatWeight(135, 'lb') === '135 lb', 'formatWeight(135, lb) should be "135 lb"');
  assert(formatWeight(100, 'kg') === '100 kg', 'formatWeight(100, kg) should be "100 kg"');
  assert(formatWeight(100.567, 'kg') === '100.57 kg', 'formatWeight(100.567, kg) should round to 2 decimals');

  assert(formatWeightShort(62.5, 'kg') === '62.5', 'formatWeightShort(62.5, kg) should be "62.5"');
  assert(formatWeightShort(135, 'lb') === '135', 'formatWeightShort(135, lb) should be "135"');
  assert(formatWeightShort(100, 'kg') === '100', 'formatWeightShort(100, kg) should be "100"');
  assert(formatWeightShort(100.567, 'kg') === '100.57', 'formatWeightShort(100.567, kg) should round to 2 decimals');

  assert(getIncrement('kg') === 2.5, 'getIncrement(kg) should be 2.5');
  assert(getIncrement('lb') === 5, 'getIncrement(lb) should be 5');

  // --- 2.2: Edge case tests ---

  assert(kgToLb(0) === 0, 'kgToLb(0) should be 0');
  assert(lbToKg(0) === 0, 'lbToKg(0) should be 0');
  assert(convertWeight(0, 'kg', 'lb') === 0, 'convertWeight(0, kg, lb) should be 0');
  assert(formatWeight(0, 'kg') === '0 kg', 'formatWeight(0, kg) should be "0 kg"');
  assert(formatWeightShort(0, 'lb') === '0', 'formatWeightShort(0, lb) should be "0"');

  assert(kgToLb(-10) === -22.05, 'kgToLb(-10) should be -22.05');
  assert(lbToKg(-225) === -102.06, 'lbToKg(-225) should be -102.06');
  assert(convertWeight(-10, 'kg', 'lb') === -22.05, 'convertWeight(-10, kg, lb) should be -22.05');

  assert(Number.isNaN(kgToLb(NaN)), 'kgToLb(NaN) should be NaN');
  assert(Number.isNaN(lbToKg(NaN)), 'lbToKg(NaN) should be NaN');
  assert(Number.isNaN(convertWeight(NaN, 'kg', 'lb')), 'convertWeight(NaN, kg, lb) should be NaN');

  assert(kgToLb(Infinity) === Infinity, 'kgToLb(Infinity) should be Infinity');
  assert(kgToLb(-Infinity) === -Infinity, 'kgToLb(-Infinity) should be -Infinity');
  assert(lbToKg(Infinity) === Infinity, 'lbToKg(Infinity) should be Infinity');
  assert(lbToKg(-Infinity) === -Infinity, 'lbToKg(-Infinity) should be -Infinity');

  // --- 2.3: Round-trip conversion tests ---

  assert(kgToLb(lbToKg(100)) === 100, 'kgToLb(lbToKg(100)) round-trip should be 100');
  assert(lbToKg(kgToLb(100)) === 100, 'lbToKg(kgToLb(100)) round-trip should be 100');
  assert(kgToLb(lbToKg(225)) === 225, 'kgToLb(lbToKg(225)) round-trip should be 225');
  assert(lbToKg(kgToLb(225)) === 225, 'lbToKg(kgToLb(225)) round-trip should be 225');

  assert(
    convertWeight(convertWeight(100, 'lb', 'kg'), 'kg', 'lb') === 100,
    'convertWeight round-trip lb→kg→lb should return original',
  );
  assert(
    convertWeight(convertWeight(100, 'kg', 'lb'), 'lb', 'kg') === 100,
    'convertWeight round-trip kg→lb→kg should return original',
  );

  // --- 2.4: Format tests for both kg and lb ---

  assert(formatWeight(62.5, 'kg') === '62.5 kg', 'formatWeight(62.5, kg) format test');
  assert(formatWeight(135, 'lb') === '135 lb', 'formatWeight(135, lb) format test');
  assert(formatWeightShort(62.5, 'kg') === '62.5', 'formatWeightShort(62.5, kg) format test');
  assert(formatWeightShort(135, 'lb') === '135', 'formatWeightShort(135, lb) format test');

  console.log('All unit conversion tests passed.');
} catch (error) {
  console.error('Unit conversion test failed:', error);
  process.exit(1);
}
