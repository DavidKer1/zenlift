## Context

Zenlift currently exposes exercise search and filters in two important places: the `Ejercicios` tab and the shared `ExercisePicker` used when adding exercises from Active Workout and routine creation/edit flows. Both surfaces use horizontally scrolling filter pills. That pattern is compact for a few options, but it becomes harder to scan, less accessible for screen readers, and less predictable when the user is tired during an active workout.

The project already has the dependencies needed for a better interaction: `@gorhom/bottom-sheet` for modal sheets and `expo-image` for local image rendering. Expo SDK `~55.0.26` matches the project rule to use SDK 55 docs. The current implementation uses local SQLite reads and repository filters, and this change should preserve that local-first behavior.

## Goals / Non-Goals

**Goals:**

- Replace filter pill rows with two stable controls: `Equipment` and `Muscle`.
- Use the same filter interaction in the exercise library and the shared exercise picker.
- Present filter options in a partially expanded bottom modal list.
- Render each option row with a local left image and filter name.
- Close the modal immediately after a selection and apply the selected filter.
- Preserve text search, local-first reads, offline behavior, and FlashList usage.
- Improve accessibility with clear labels, selected state, 48px+ targets, and non-color-only selection feedback.

**Non-Goals:**

- No SQLite schema changes.
- No remote image loading, backend, analytics, or cloud storage.
- No final exercise-specific filter artwork in this change; only a temporary bundled asset is required.
- No changes to active workout persistence, set autosave, PR detection, or workout repository behavior.
- No new category filter UI; the requested public filter system is only `Equipment` and `Muscle`.

## Decisions

1. Use one shared filter option model for both surfaces.

   The labels, option values, selected-label helpers, and temporary image source should live in `src/features/exercises/exerciseFilterOptions.ts`. This keeps `src/app/exercise/index.tsx` and `src/components/routine/ExercisePicker.tsx` aligned and avoids subtle label/order drift.

   Alternative considered: duplicate labels inside each screen. That would be faster locally, but the picker and library would diverge easily.

2. Use reusable UI components for the trigger and sheet.

   `ExerciseFilterButton` owns the accessible trigger presentation, while `ExerciseFilterSheet` owns bottom sheet rendering and option selection. The screens remain responsible only for current selected values and applying repository filtering.

   Alternative considered: inline bottom sheets in each screen. That would duplicate accessibility props, snap point behavior, and styling.

3. Use `BottomSheetModal` with a single partial snap point.

   A modal sheet matches the requested "bottom modal" and the snap point keeps it partially open rather than fullscreen. `BottomSheetFlatList` handles list gestures inside the sheet.

   Alternative considered: React Native `Modal` with a custom fixed-height panel. The app already has `@gorhom/bottom-sheet`, and using it reduces custom gesture and backdrop logic.

4. Add `BottomSheetModalProvider` at the root app layout.

   The provider belongs near the existing `GestureHandlerRootView` so both the exercise tab and shared picker can present sheets from any route or active workout modal.

   Alternative considered: wrap each individual screen. That increases provider duplication and may fail in nested modal flows.

5. Make muscle filtering single-select for this interaction.

   The requested flow says selecting a filter closes the modal and filters. A single selected muscle mirrors the existing single-select equipment behavior and keeps the two-trigger UI easy to understand in Active Workout.

   Alternative considered: keep multi-select muscles inside the sheet. That would require extra apply/clear controls or keep the sheet open, which conflicts with closing immediately after selection.

6. Use a bundled temporary image asset for all filter options.

   Until final assets are provided, a local placeholder under `assets/images/filters/filter-option-temp.png` keeps the UI offline and allows layout verification without introducing a network dependency.

   Alternative considered: download placeholder images at runtime. That would break offline expectations and add avoidable loading/failure states.

## Risks / Trade-offs

- Existing multi-muscle filtering becomes single-muscle filtering in the exercise library -> Mitigate by making `Todos` available in the sheet and keeping text search plus equipment combination intact.
- `BottomSheetModalProvider` may affect modal stacking with the active workout modal -> Mitigate by placing it inside the existing `GestureHandlerRootView` and smoke testing both the exercise tab and Active Workout add-exercise flow.
- Temporary imagery may be visually repetitive -> Mitigate by isolating the asset path and option model so final images can replace the placeholder later.
- Bottom sheet behavior can differ between native and web -> Mitigate with typecheck, Expo web smoke testing, and manual Android/iOS validation before release.
- Screen reader focus behavior around third-party bottom sheets needs verification -> Mitigate with explicit `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, and manual VoiceOver/TalkBack checks.

## Migration Plan

1. Add the temporary local asset.
2. Add shared option helpers and unit tests.
3. Add reusable filter button and sheet components.
4. Add `BottomSheetModalProvider` to the root layout.
5. Replace exercise tab filters.
6. Replace shared exercise picker filters.
7. Run unit tests, typecheck, lint, and UI smoke tests.

Rollback is straightforward: remove the new components/helpers/provider and restore the previous filter UI from the affected screens. No data migration or persisted state cleanup is required.

## Open Questions

- Final filter artwork is not yet available. The implementation will use one local placeholder for all options until assets are provided.
- Product copy uses visible labels `Equipment` and `Muscle` per request, while the rest of the app is mostly Spanish. This can be localized in a later i18n pass if desired.
