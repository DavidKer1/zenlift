## Context

The `src/app/routines.tsx` screen is currently a static placeholder. `RoutineRepo` is fully implemented and tested, exposing `getAll()` (returns `Routine[]`) and `archive(id)` / `unarchive(id)`. The base tab navigation and theme provider are in place. The domain entities use snake_case column names matching SQLite (`is_archived`, `sort_order`, `routine_day` relationships counted via JOIN).

Design reference compliance: implementation MUST review `DESIGN.md` and `tmp/design/screens/routines_list-html.html` before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Display active routines with name, day count, and exercise count in a scrollable list.
- Support swipe-to-archive with visual feedback and undo option.
- Show suggested templates (PPL, Upper/Lower, Full Body) when the user has fewer than 2 active routines.
- Show a designed empty state when there are zero active routines.
- Add a FAB that navigates to the routine creation screen.
- Keep the screen thin: data access via repository, no business logic in the screen file.

**Non-Goals:**
- Implementing the routine creation/edit form screens (out of scope, navigated to via FAB).
- Implementing the "Start Workout" flow from a routine (separate change).
- Backend sync, analytics, or real-time updates.
- Routine reordering, duplication, or full CRUD UI (separate changes).

## Decisions

### Data fetching: `useCallback` + `useFocusEffect` over state management
**Decision:** Load routines from `RoutineRepo.getAll()` inside a `useCallback` wrapped in `useFocusEffect`, stored in local `useState`. No Zustand store for the routine list.

**Rationale:** The routine list is read-only for this screen (archive toggles a flag). Zustand is for global active-workout state and preferences. A local fetch-on-focus pattern keeps the data fresh when returning from creation/edit without over-engineering.

**Alternative considered:** Zustand store with `routines` slice. Rejected because routine editing will copy data to prevent mutation of past sessions, making a global cached list stale quickly.

### List component: FlashList
**Decision:** Use `@shopify/flash-list` `FlashList` with `estimatedItemSize`.

**Rationale:** Architecture mandates FlashList for lists with inputs or large lists. Even though this list won't have inline inputs, using FlashList now avoids a migration later and keeps scroll performance consistent.

### Swipe-to-archive: `react-native-gesture-handler` + `Animated`
**Decision:** Implement swipe-to-archive using `Swipeable` from `react-native-gesture-handler` or a lightweight `PanResponder` + `Animated.View` pattern if gesture-handler is not yet integrated. Show a red "Archive" action behind the card.

**Rationale:** Native gesture handling for smooth swipe feel. `react-native-gesture-handler` is an Expo-compatible dependency commonly present in Expo projects. If absent, use `PanResponder` from React Native core as fallback.

**Alternative considered:** Long-press context menu. Rejected because swiping is faster and more intuitive for a gym-use mobile app.

### Templates: Hardcoded inline data, not database entries
**Decision:** Suggested templates (PPL, Upper/Lower, Full Body) are hardcoded as a local constant array shown conditionally. Tapping a template navigates to the creation flow with pre-filled data.

**Rationale:** Templates are not routines yet; they're creation shortcuts. Creating them as actual routine rows only to delete or modify them would add complexity without value.

### Empty state: Inline component, not a separate route
**Decision:** EmptyState is a conditional render within the routine list screen (swapping the FlashList for an illustration + text + CTA component).

**Rationale:** Keeps navigation simple. No need for a separate route or modal for an empty state.

### Component organization
**Decision:**
- `RoutineCard` → `src/components/routine/RoutineCard.tsx`
- `EmptyState` → `src/components/routine/EmptyState.tsx`
- `SuggestedTemplates` → `src/components/routine/SuggestedTemplates.tsx`
- `FAB` → `src/components/ui/FAB.tsx` (reusable)

**Rationale:** Routine-specific components go under `components/routine/`. `FAB` is generic UI and goes under `components/ui/`.

### FAB navigation
**Decision:** FAB uses `expo-router`'s `Link` or `router.push('/routines/new')` to navigate to the creation screen.

**Rationale:** Standard Expo Router navigation. The creation route (`routines/new`) may not exist yet; this change only wires the navigation target.

## Risks / Trade-offs

- **Swipe-to-archive without confirmation**: User could accidentally archive a routine. Mitigation: Show a brief undo snackbar/toast after archiving, using a timeout before the card is removed from the active list.
- **react-native-gesture-handler dependency**: If not already installed, adds a dependency. Mitigation: Check `package.json` first; fall back to `PanResponder` if absent to avoid dependency scope creep.
- **Day count requires a JOIN query**: `Routine` entity has no `day_count` column. Mitigation: Add a `getAllWithDayCount()` method to `RoutineRepo` that returns `Routine` + `day_count` via a simple COUNT subquery, or compute it by calling `getDays()` per routine. Prefer the COUNT subquery for efficiency (single query vs N+1).
