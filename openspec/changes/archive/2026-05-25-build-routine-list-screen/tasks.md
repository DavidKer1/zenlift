## 1. RoutineRepo enhancement for routine list

- [x] 1.1 Add `getAllWithDayCount()` method to `RoutineRepo` that returns `Routine[]` enriched with `day_count` and `exercise_count` fields via a subquery or JOIN
- [x] 1.2 Add unit test for `getAllWithDayCount()` covering routines with days, routines without days, and the `includeArchived` flag

## 2. UI components

- [x] 2.1 Create `RoutineCard` component at `src/components/routine/RoutineCard.tsx` displaying routine name, "N días", and "M ejercicios" formatted text, styled with theme colors and rounded surface
- [x] 2.2 Create `EmptyState` component at `src/components/routine/EmptyState.tsx` with a centered icon/illustration, "No tienes rutinas aún" title, supporting message, and a "Crear primera rutina" primary button
- [x] 2.3 Create `SuggestedTemplates` component at `src/components/routine/SuggestedTemplates.tsx` rendering three horizontally scrollable template cards (PPL, Upper/Lower, Full Body), each with name, brief description, and number of days
- [x] 2.4 Create `FAB` reusable component at `src/components/ui/FAB.tsx` with primary orange background, plus icon, absolute positioning, and `onPress` prop

## 3. Swipe-to-archive on RoutineCard

- [x] 3.1 Implement left-swipe reveal on `RoutineCard` to expose an "Archivar" action with danger-red background using `react-native-gesture-handler` Swipeable or `PanResponder` as fallback
- [x] 3.2 On archive action, call `RoutineRepo.archive(id)`, remove the card from the active list, and show an undo option (snackbar or inline message) that calls `RoutineRepo.unarchive(id)` within a 5-second window

## 4. Screen integration

- [x] 4.1 Rewrite `src/app/routines.tsx` to use `useFocusEffect` + `RoutineRepo.getAllWithDayCount()` for data fetching, storing results in `useState`
- [x] 4.2 Render `FlashList` of `RoutineCard` components with `estimatedItemSize={80}` when active routines exist
- [x] 4.3 Conditionally render `EmptyState` when active routines is empty, `SuggestedTemplates` when count < 2
- [x] 4.4 Place FAB on the screen (bottom-right, absolute positioned) with `router.push('/routine/create')` on press
- [x] 4.5 Add `keyExtractor` using routine `id` and wrap `RoutineCard` in `React.memo` for list performance

## 5. Verification

- [ ] 5.1 Manual smoke test: launch app, open Routines tab, confirm empty state renders with templates and FAB visible
- [ ] 5.2 Manual smoke test: seed a routine via dev tools or DB, confirm it appears in the list with correct day/exercise counts
- [ ] 5.3 Manual smoke test: swipe a routine to archive, confirm it disappears and undo works
- [ ] 5.4 Run `npx tsc --noEmit` to verify no TypeScript errors introduced
