export type WeightUnit = 'kg' | 'lb';

const CONVERSION_FACTOR = 2.20462;

function roundTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function kgToLb(kg: number): number {
  return roundTwoDecimals(kg * CONVERSION_FACTOR);
}

export function lbToKg(lb: number): number {
  return roundTwoDecimals(lb / CONVERSION_FACTOR);
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  return from === 'kg' ? kgToLb(value) : lbToKg(value);
}

export function formatWeight(value: number, unit: WeightUnit): string {
  const rounded = roundTwoDecimals(value);
  return `${rounded} ${unit}`;
}

export function formatWeightShort(value: number, _unit: WeightUnit): string {
  const rounded = roundTwoDecimals(value);
  return `${rounded}`;
}

export function getIncrement(unit: WeightUnit): number {
  return unit === 'kg' ? 2.5 : 5;
}
