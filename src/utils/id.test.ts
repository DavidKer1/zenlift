import { generateId } from './id';

function setCryptoForTest(value: Crypto | undefined): void {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value,
  });
}

function restoreCryptoForTest(descriptor: PropertyDescriptor | undefined): void {
  if (descriptor) {
    Object.defineProperty(globalThis, 'crypto', descriptor);
    return;
  }

  Reflect.deleteProperty(globalThis, 'crypto');
}

describe('generateId', () => {
  const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

  afterEach(() => {
    restoreCryptoForTest(originalCryptoDescriptor);
  });

  it('returns non-empty string IDs without collisions in a small sample', () => {
    const id = generateId();
    const sample = new Set(Array.from({ length: 1000 }, () => generateId()));

    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(sample.size).toBe(1000);
  });

  it('prefers crypto.randomUUID when available', () => {
    setCryptoForTest({
      randomUUID: () => '00000000-0000-4000-8000-000000000000',
    } as unknown as Crypto);

    expect(generateId()).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('falls back when crypto is unavailable', () => {
    setCryptoForTest(undefined);

    const fallbackId = generateId();
    const fallbackSample = new Set(Array.from({ length: 1000 }, () => generateId()));

    expect(typeof fallbackId).toBe('string');
    expect(fallbackId.length).toBeGreaterThan(0);
    expect(fallbackSample.size).toBe(1000);
  });
});
