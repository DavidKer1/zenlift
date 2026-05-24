## 1. Entity Types

- [x] 1.1 Create `src/domain/entities/index.ts`
- [x] 1.2 Define interfaces for muscle groups, exercises, exercise muscles, routines, routine days, routine exercises, workout sessions, workout exercises, set logs, personal records, app settings, and migrations
- [x] 1.3 Use UUID text `string` IDs across persisted entities
- [x] 1.4 Model nullable SQLite fields with explicit nullable TypeScript types

## 2. Domain Unions

- [x] 2.1 Add string union types for muscle role, equipment, exercise category, set type, workout status, and PR type
- [x] 2.2 Use the union types in entity interfaces where values are constrained

## 3. Composed Models And Verification

- [x] 3.1 Add composed types for workout exercise with sets, full routine, full session, and workout summary
- [x] 3.2 Export all entity and composed types from the domain entities barrel
- [x] 3.3 Run `npx tsc --noEmit`
