## 1. Component Split

- [x] 1.1 Inspect `ActiveWorkoutModal`, `ActiveWorkoutHandle`, root layout, and tab bar dimensions to identify the current minimized-sheet coupling
- [x] 1.2 Create `ActiveWorkoutMinimizedHeader` for the 56px header shown above the bottom tab navigation
- [x] 1.3 Create `ActiveWorkoutExpandedSurface` for the full active workout controls currently rendered inside the bottom sheet
- [x] 1.4 Extract shared header presentation into a reusable header-content component or shared render function used by both surfaces
- [x] 1.5 Keep recovery, elapsed timer, previous performance loading, exercise expansion, and workout store callbacks owned by `ActiveWorkoutModal`

## 2. Minimized Header Behavior

- [x] 2.1 Replace the low `BottomSheet` snap-point minimized state with a state flag that chooses minimized header vs expanded surface
- [x] 2.2 Position the minimized header immediately above the bottom tab navigation using safe-area-aware tab metrics
- [x] 2.3 Ensure the minimized header is the only visible workout UI while minimized
- [x] 2.4 Ensure the bottom tab navigation remains anchored to the bottom and all tab targets remain tappable while minimized
- [x] 2.5 Add tap and chevron interactions that expand from the minimized header to the full workout surface

## 3. Expanded Surface Behavior

- [x] 3.1 Move cancel, rest timer, exercise list, bottom bar, and exercise picker rendering into the expanded surface
- [x] 3.2 Preserve swipe-down and chevron interactions for minimizing the expanded surface
- [x] 3.3 Keep active workout data autosave paths unchanged when completing or editing sets
- [x] 3.4 Ensure finish and cancel remove the modal/header and restore normal tab interaction

## 4. Reanimated Transition

- [x] 4.1 Verify `react-native-reanimated` 4.2.1 APIs available in the project before implementing shared transitions
- [x] 4.2 Add stable native shared transition tags for the minimized and expanded header container/content
- [x] 4.3 Use a non-bouncy Reanimated shared transition for header movement between minimized and expanded states
- [x] 4.4 Add a platform-safe fallback for web or unsupported shared element transitions using shared values/layout animation
- [ ] 4.5 Verify transitions do not leave duplicate permanent headers, flashes, or jump cuts

## 5. Verification

- [x] 5.1 Run lint/type validation for the touched files or project scripts available in `package.json`
- [ ] 5.2 Start a workout from Home quick-start and verify the modal appears expanded
- [ ] 5.3 Minimize the workout and verify only the header appears above the bottom tab navigation
- [ ] 5.4 Switch between Home, Routines, History, and Settings while minimized and verify the header persists and tabs remain tappable
- [ ] 5.5 Expand from the minimized header and verify the full workout controls return with timer continuity
- [ ] 5.6 Finish or cancel the workout and verify the header/modal disappears and tab layout returns to normal
