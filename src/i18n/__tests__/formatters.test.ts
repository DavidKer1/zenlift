import { formatCompactDuration, formatWeightValue } from '@/i18n/useI18nFormatters';

describe('i18n formatters', () => {
  it('formats compact durations in English', () => {
    expect(formatCompactDuration(45, 'en')).toBe('45s');
    expect(formatCompactDuration(120, 'en')).toBe('2min');
    expect(formatCompactDuration(3660, 'en')).toBe('1h 1min');
  });

  it('formats compact durations in Spanish', () => {
    expect(formatCompactDuration(45, 'es')).toBe('45s');
    expect(formatCompactDuration(120, 'es')).toBe('2min');
    expect(formatCompactDuration(3660, 'es')).toBe('1h 1min');
  });

  it('formats weight values with locale-aware decimals', () => {
    expect(formatWeightValue(62.5, 'kg', 'en')).toBe('62.5 kg');
    expect(formatWeightValue(62.5, 'kg', 'es')).toBe('62.5 kg');
  });
});
