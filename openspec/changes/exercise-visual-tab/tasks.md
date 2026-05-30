## 1. Tab Navigation

- [x] 1.1 Re-check Expo SDK 55 / Expo Router docs through Context7 or official Expo docs before writing Expo navigation code.
- [x] 1.2 Add `src/components/app-tabs.config.test.ts` to assert tab order, labels, `/exercise`, dumbbell icon, and unique icon identities.
- [x] 1.3 Add `src/components/app-tabs.config.ts` with five tabs: `/`, `/routines`, `/exercise`, `/history`, and `/settings`.
- [x] 1.4 Update `src/components/app-tabs.tsx` to render tabs from config, support Ionicons and SymbolView icons, give `Ejercicios` a dumbbell icon, and change `Rutinas` to a list/plan icon.
- [x] 1.5 Run the focused tab config test and confirm it passes.

## 2. Exercise Visual Metadata

- [x] 2.1 Create local exercise image assets under `assets/images/exercises/` for every seeded exercise.
- [x] 2.2 Add `src/features/exercises/exerciseVisuals.test.ts` to verify every seeded exercise has a photo, Spanish description, and alt text.
- [x] 2.3 Add `src/features/exercises/exerciseVisuals.ts` with seeded visual metadata and a custom-exercise fallback that uses notes as description when available.
- [x] 2.4 Run the focused visual metadata test and confirm it passes.

## 3. Visual Exercise Library

- [ ] 3.1 Add `src/components/exercise/ExerciseDiscoveryCard.tsx` with local photo, name, short Spanish description, primary muscle, equipment metadata, and read-only press behavior.
- [ ] 3.2 Update `src/app/exercise/index.tsx` to map exercises to visual metadata and render `ExerciseDiscoveryCard`.
- [ ] 3.3 Remove create FAB, favorite toggle UI, and favorite write handling from the exercise library tab surface.
- [ ] 3.4 Keep existing search, muscle filters, equipment filters, empty state, and FlashList behavior working with the new visual cards.
- [ ] 3.5 Run typecheck and focused tests for the exercise library changes.

## 4. Visual Exercise Detail

- [ ] 4.1 Update `src/app/exercise/[id].tsx` to load only exercise data and muscle groups required for the visual description page.
- [ ] 4.2 Render the hero exercise photo, Spanish description, equipment metadata, muscle badges, and read-only custom marker when applicable.
- [ ] 4.3 Remove best-performance metrics, recent-history list, progress chart, PR list, edit/delete controls, and quick workout action from this visual detail path.
- [ ] 4.4 Run typecheck and focused tests for the exercise detail changes.

## 5. Verification

- [ ] 5.1 Run focused tests for tab config and exercise visual metadata.
- [ ] 5.2 Run the full Jest suite.
- [ ] 5.3 Run TypeScript typecheck.
- [ ] 5.4 Run lint and fix changed-file issues.
- [ ] 5.5 Smoke test Expo web with Browser: verify five tabs, `Ejercicios` route, dumbbell icon, updated `Rutinas` icon, search/filter behavior, photo/description cards, visual detail, and absence of create/favorite/edit/delete/quick-workout controls.
- [ ] 5.6 Rebuild Graphify after significant source changes with `/graphify src`.
