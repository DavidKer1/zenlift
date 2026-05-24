import { generateId } from './id';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

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

const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

try {
  const id = generateId();

  assert(typeof id === 'string', 'generateId() should return a string');
  assert(id.length > 0, 'generateId() should return a non-empty string');

  const sample = new Set(Array.from({ length: 1000 }, () => generateId()));

  assert(sample.size === 1000, 'generateId() should not collide across 1000 IDs');

  setCryptoForTest({
    randomUUID: () => '00000000-0000-4000-8000-000000000000',
  } as unknown as Crypto);

  assert(
    generateId() === '00000000-0000-4000-8000-000000000000',
    'generateId() should prefer crypto.randomUUID()',
  );

  setCryptoForTest(undefined);

  const fallbackId = generateId();
  const fallbackSample = new Set(Array.from({ length: 1000 }, () => generateId()));

  assert(typeof fallbackId === 'string', 'fallback should return a string');
  assert(fallbackId.length > 0, 'fallback should return a non-empty string');
  assert(fallbackSample.size === 1000, 'fallback should not collide across 1000 IDs');
} finally {
  restoreCryptoForTest(originalCryptoDescriptor);
}
