import {
  convertWeight,
  formatWeight,
  formatWeightShort,
  getIncrement,
  kgToLb,
  lbToKg,
} from './units';

describe('unit conversion utilities', () => {
  it('converts between kg and lb with two-decimal rounding', () => {
    expect(kgToLb(100)).toBe(220.46);
    expect(kgToLb(62.5)).toBe(137.79);
    expect(lbToKg(220.46)).toBe(100);
    expect(lbToKg(135)).toBe(61.24);
  });

  it('returns the original value when converting within the same unit', () => {
    expect(convertWeight(100, 'kg', 'kg')).toBe(100);
    expect(convertWeight(50, 'lb', 'lb')).toBe(50);
  });

  it('formats weights for display', () => {
    expect(formatWeight(62.5, 'kg')).toBe('62.5 kg');
    expect(formatWeight(135, 'lb')).toBe('135 lb');
    expect(formatWeight(100.567, 'kg')).toBe('100.57 kg');
    expect(formatWeightShort(100.567, 'kg')).toBe('100.57');
  });

  it('uses gym-friendly increments by unit', () => {
    expect(getIncrement('kg')).toBe(2.5);
    expect(getIncrement('lb')).toBe(5);
  });

  it('handles zero, negative, NaN, and infinity inputs predictably', () => {
    expect(kgToLb(0)).toBe(0);
    expect(lbToKg(0)).toBe(0);
    expect(kgToLb(-10)).toBe(-22.05);
    expect(lbToKg(-225)).toBe(-102.06);
    expect(Number.isNaN(kgToLb(Number.NaN))).toBe(true);
    expect(lbToKg(Infinity)).toBe(Infinity);
    expect(lbToKg(-Infinity)).toBe(-Infinity);
  });
});
