## 1. ID Utility

- [x] 1.1 Create `src/utils/id.ts`
- [x] 1.2 Implement `generateId()` using `crypto.randomUUID()` when available
- [x] 1.3 Implement a non-throwing fallback path for runtimes without `crypto.randomUUID()`
- [x] 1.4 Export the utility for future domain/storage usage

## 2. Verification

- [x] 2.1 Add or update tests that verify `generateId()` returns strings
- [x] 2.2 Verify 1000 generated IDs have no collisions in a bounded sample
- [x] 2.3 Verify fallback behavior without native `crypto.randomUUID()`
- [x] 2.4 Run `npx tsc --noEmit`
