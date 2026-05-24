let fallbackCounter = 0;

export function generateId(): string {
  const cryptoSource = globalThis.crypto;
  const randomUUID = cryptoSource?.randomUUID;

  if (typeof randomUUID === 'function') {
    try {
      return randomUUID.call(cryptoSource);
    } catch {
      return createFallbackId();
    }
  }

  return createFallbackId();
}

function createFallbackId(): string {
  const bytes = getRandomBytes(16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const cryptoSource = globalThis.crypto;
  const getRandomValues = cryptoSource?.getRandomValues;

  if (typeof getRandomValues === 'function') {
    try {
      getRandomValues.call(cryptoSource, bytes);
      return bytes;
    } catch {
      return fillFallbackBytes(bytes);
    }
  }

  return fillFallbackBytes(bytes);
}

function fillFallbackBytes(bytes: Uint8Array): Uint8Array {
  const timestamp = Date.now();
  fallbackCounter = (fallbackCounter + 1) % Number.MAX_SAFE_INTEGER;

  for (let index = 0; index < bytes.length; index += 1) {
    const randomByte = Math.floor(Math.random() * 256);
    const timestampByte = Math.floor(timestamp / 2 ** ((index % 6) * 8)) & 0xff;
    const counterByte = Math.floor(fallbackCounter / 2 ** ((index % 6) * 8)) & 0xff;

    bytes[index] = randomByte ^ timestampByte ^ counterByte;
  }

  return bytes;
}
