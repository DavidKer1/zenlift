## 1. Setup And Shared Filter Model

- [x] 1.1 Add `assets/images/filters/filter-option-temp.png` by copying an existing local exercise PNG as the temporary filter option image.
- [x] 1.2 Create `src/features/exercises/exerciseFilterOptions.ts` with equipment labels, `equipmentFilterOptions`, `buildMuscleFilterOptions`, `getEquipmentFilterLabel`, and `getMuscleFilterLabel`.
- [x] 1.3 Add `src/features/exercises/__tests__/exerciseFilterOptions.test.ts` covering equipment order, equipment labels, muscle option building, and fallback selected labels.
- [x] 1.4 Run `pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand` and confirm the new helper tests pass.

## 2. Reusable Filter UI

- [x] 2.1 Create `src/components/exercise/ExerciseFilterButton.tsx` with accessible button semantics, selected state, current value label, 56px minimum height, and `Equipment`/`Muscle` label support.
- [x] 2.2 Create `src/components/exercise/ExerciseFilterSheet.tsx` using `BottomSheetModal`, `BottomSheetFlatList`, a partial snap point, backdrop dismissal, local left images, option labels, selected state, and close-on-select behavior.
- [x] 2.3 Wrap the app content in `BottomSheetModalProvider` inside `src/app/_layout.tsx`, under the existing `GestureHandlerRootView`.
- [x] 2.4 Run `pnpm typecheck` and resolve any component, import, or generic type errors.

## 3. Exercise Library Integration

- [x] 3.1 Update `src/app/exercise/index.tsx` imports to remove `FilterChip` and `ScrollView`, and add the shared filter button, sheet, and option helpers.
- [x] 3.2 Replace multi-select `selectedMuscleIds` state with single `selectedMuscleId` state and add `activeFilterSheet` state.
- [x] 3.3 Update exercise loading so `selectedMuscleId` calls `ExerciseRepo.getByMuscle(selectedMuscleId)` once and intersects with search and selected equipment results.
- [x] 3.4 Replace the two horizontal pill sections with a two-button row for `Equipment` and `Muscle`.
- [x] 3.5 Render `ExerciseFilterSheet` instances for equipment and muscle, selecting `Todos` to clear a filter and selecting any other row to close the modal and apply filtering.
- [x] 3.6 Remove obsolete chip-related styles from `src/app/exercise/index.tsx` and add the filter button row style.

## 4. Shared Exercise Picker Integration

- [x] 4.1 Update `src/components/routine/ExercisePicker.tsx` imports to remove `ScrollView` and add the shared filter button, sheet, and option helpers.
- [x] 4.2 Remove local equipment label/icon maps in favor of shared `equipmentLabels`, keeping category labels only for exercise row metadata.
- [x] 4.3 Remove `selectedCategory` state and category filtering from the picker so the visible filter system is only `Equipment` and `Muscle`.
- [x] 4.4 Add visible equipment option memoization from available exercise equipment and add muscle option memoization from loaded muscle groups.
- [x] 4.5 Replace the horizontal picker chip scroll with a two-button row for `Equipment` and `Muscle`.
- [x] 4.6 Render picker `ExerciseFilterSheet` instances that close after selection and filter picker results with active search plus selected equipment and muscle.
- [x] 4.7 Remove the local `FilterChip` component and obsolete chip styles from `src/components/routine/ExercisePicker.tsx`.

## 5. Verification

- [x] 5.1 Run `pnpm test -- src/features/exercises/__tests__/exerciseFilterOptions.test.ts --runInBand` and confirm it passes.
- [ ] 5.2 Run `pnpm typecheck` and confirm it passes.
- [ ] 5.3 Run `pnpm lint` and confirm it passes.
- [ ] 5.4 Smoke test Expo web: open the `Ejercicios` tab, search for an exercise, open `Equipment`, select an option, confirm the sheet closes and results filter, then repeat with `Muscle`.
- [ ] 5.5 Smoke test Active Workout add-exercise flow: open `Agregar ejercicio`, use both filter modals, select an exercise, and confirm it is added to the active workout.
- [ ] 5.6 Manually check accessibility for filter triggers and rows: accessible names include current selection, selected state is exposed, touch targets are at least 48px, row images are decorative, and selection does not rely on color alone.
