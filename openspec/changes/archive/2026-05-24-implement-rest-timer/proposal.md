## Why

The rest timer is a core UX component of the Active Workout screen. Between sets, users need a visual countdown that survives screen navigation and app restarts. Without an absolute-timestamp-based timer, countdowns would reset when the user switches tabs or the app is backgrounded, breaking the workout flow. Building this now unblocks the Active Workout screen's set-registration loop.

## What Changes

- Create `src/components/workout/RestTimer.tsx`: An independent rest timer component with SVG circular progress, center countdown text, and play/pause/skip/add-time controls
- Timer uses absolute timestamps (`targetEnd = Date.now() + seconds * 1000`) persisted in MMKV -- never dependent on component lifecycle or setInterval counting
- Component recalculates remaining seconds via `targetEnd - Date.now()` on every render frame using `requestAnimationFrame`
- Vibrates on completion via `expo-haptics` (`Haptics.notificationAsync(NotificationFeedbackType.Success)`)
- Supports pause (UI only -- no effect on the absolute targetEnd), skip, and add 30 seconds
- Hidden when `targetEnd` prop is null
- Reads default rest duration from settings via `DEFAULT_SETTINGS.defaultRest` (90 seconds)

## Capabilities

### New Capabilities

- **rest-timer**: An absolute-timestamp-based rest timer component for the active workout flow. Uses SVG circular progress, MMKV-persisted targetEnd for survival across navigation and restarts, haptic feedback on completion, and user controls for pause/skip/add-time.

### Modified Capabilities

<!-- No existing specs have their requirements changed. This is a new component that depends on settings-storage for default rest duration. -->

## Impact

- New file: `src/components/workout/RestTimer.tsx`
- Dependencies consumed: `expo-haptics` (already in deps), `react-native-svg` (already in deps), `DEFAULT_REST_SECONDS` from `src/features/settings/constants.ts` (settings-storage), `DEFAULT_SETTINGS.defaultRest` for configurable default duration
- Downstream dependency of: ActiveWorkoutStore (stores timer state), Active Workout Screen (hosts this component)
- No breaking changes -- purely additive
- Unblocks Phase 4 workout screen implementation
