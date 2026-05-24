## 1. Dependency Alignment

- [x] 1.1 Confirm Expo SDK 55 remains the target and document the Notion SDK 56 mismatch in implementation notes
- [x] 1.2 Install missing Expo-compatible native/runtime dependencies
- [x] 1.3 Install missing JS dependencies for state, forms, validation, dates, and charts
- [x] 1.4 Verify `package.json` and lockfile reflect the dependency set

## 2. Project Structure

- [x] 2.1 Create the base `src/domain`, `src/storage`, `src/features`, `src/components`, `src/utils`, `src/theme`, and `src/providers` folder structure
- [x] 2.2 Keep tracked placeholders only where empty folders have no owned files yet
- [x] 2.3 Remove or isolate starter-only source files that conflict with Zenlift app structure

## 3. Configuration Verification

- [x] 3.1 Verify `app.json` keeps the Expo Router plugin enabled
- [x] 3.2 Verify `tsconfig.json` remains strict and path aliases still resolve
- [x] 3.3 Run `npx tsc --noEmit`
- [x] 3.4 Run `npx expo start` long enough to catch configuration errors
