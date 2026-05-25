## Context

The Active Workout screen (`build-active-workout-screen` change) requires a rest timer component that displays between sets. The architecture doc (lines 158-164) mandates absolute-timestamp-based timers: save `targetEnd = Date.now() + seconds * 1000` in MMKV, calculate remaining via `targetEnd - Date.now()`, and never depend on `setInterval` or component lifecycle for countdown accuracy.

El diseño sigue las referencias de `DESIGN.md` (raíz del proyecto) y las pantallas de `tmp/design/`. El color primario es naranja atlético `#F97316` (no azul), y verde `#22C55E` solo para estados completados/éxito. Los colores neutros siguen la paleta `DESIGN.md`: `hairline: #dee1e6`, `muted: #7c828a`, `surface-soft: #f7f7f7`, `canvas: #ffffff`. La tipografía usa la familia definida en `DESIGN.md` (Coinbase Display/Sans) con pesos modestos (400) y espaciado limpio.

The ActiveWorkoutStore (`create-active-workout-store` change) will expose `timerTargetEnd`, `isResting`, `startTimer(seconds)`, `skipTimer()`, and `getTimerRemaining()` -- this component consumes those reactive props. The store persists `timerTargetEnd` in MMKV under the namespace `zenlift.workout.timer_target`.

`react-native-svg` is already installed as a project dependency. `expo-haptics` is already in the deps list for the store. The settings system (`src/features/settings/constants.ts`) exposes `DEFAULT_SETTINGS.defaultRest = 90` seconds as the configurable default rest duration.

## Goals / Non-Goals

**Goals:**
- Render a circular SVG progress indicator showing real remaining seconds from an absolute `targetEnd` timestamp
- Display large center countdown text updated every frame via `requestAnimationFrame`
- Show "Descanso" label and current muscle/exercise name below the timer
- Trigger haptic feedback (`Haptics.notificationAsync(NotificationFeedbackType.Success)`) on completion
- Call `onComplete()` exactly once when remaining reaches 0
- Support pause (freeze UI display without changing `targetEnd`), skip (call `onSkip`), and add 30 seconds (call `onAddTime(30)`)
- Be hidden (render nothing) when `targetEnd` is null
- Survive navigation changes and app restarts by recalculating from the persisted `targetEnd` timestamp
- Use `DEFAULT_SETTINGS.defaultRest` as the default duration when starting a timer

**Non-Goals:**
- Sound alerts (only haptic)
- Configurable vibration pattern (fixed NotificationFeedbackType.Success)
- Timer history or analytics
- Custom rest duration picker (add 30s button only)
- Background service or notification (app must be foreground for UI; timer state persists via MMKV for when foreground returns)

## Decisions

### Decision 1: `requestAnimationFrame` over `setInterval` for display updates

**Rationale:** `requestAnimationFrame` synchronizes with the screen refresh rate (typically 60fps), providing smooth countdown updates. More critically, it automatically pauses when the app is backgrounded and resumes when foregrounded -- at which point the component recalculates remaining from `targetEnd - Date.now()` and shows the correct time. `setInterval` would need manual cleanup and pause/resume logic.

**Alternatives considered:**
- `setInterval(1000)`: Simpler but can drift, needs explicit backgrounding handling, and 1s granularity makes the last-second transition feel sluggish
- `useEffect` with state-driven updates: Violates the absolute-timestamp architecture principle; component lifecycle would control countdown

### Decision 2: Pause only freezes the UI display, not the `targetEnd` timestamp

**Rationale:** The architecture mandates that the countdown is derived from an absolute timestamp. If we modified `targetEnd` on pause, the timer would drift and the "real" elapsed rest time would be lost. Instead, pause is a purely visual state: the component stops updating the display but `targetEnd` remains unchanged. When resumed, the display jumps to the current real remaining time.

**Alternatives considered:**
- Adjust `targetEnd` on pause to extend the timer: Violates the absolute-timestamp principle and adds complexity to the store's timer management
- Disable pause entirely: Removes user control; acceptable alternative but pause is a common user expectation

### Decision 3: Duration read from settings at component initialization, not from store

**Rationale:** The default rest duration is a user preference stored in MMKV settings. The component reads `DEFAULT_SETTINGS.defaultRest` directly when the store's `startTimer()` is invoked (this is the store's responsibility, not the UI component's). The UI component itself remains stateless regarding duration configuration.

**Alternatives considered:**
- Pass duration as a prop: Would require the host screen to read settings and pass down, violating the "thin screens" principle
- Store reading settings: Appropriate -- the store's `startTimer()` action will read `DEFAULT_SETTINGS.defaultRest` via the settings hook

### Decision 4: No `useEffect` with cleanup for the rAF loop

**Rationale:** Using `useRef` to store the `requestAnimationFrame` id and manually canceling on unmount is more predictable than `useEffect` cleanup for animation loops. React's strict mode in development doubles `useEffect` calls, which can cause flickering with rAF-based timers.

## Risks / Trade-offs

- **[Risk] rAF loop may consume slightly more CPU than setInterval** → Mitigation: The loop is lightweight (one subtraction, one state update). On modern devices, 60fps rAF is negligible. The component is hidden when `targetEnd` is null, so zero CPU cost when not resting.
- **[Risk] Paused state is lost on app restart** → Mitigation: Acceptable trade-off. If the user pauses and backgrounds the app for hours, resuming will show "0s remaining" (since real time elapsed). The timer will have already completed and `onComplete` will trigger on next render.
- **[Risk] `onComplete` called again if component remounts after completion** → Mitigation: Use a `useRef` flag `completedFired` to track whether `onComplete` has already been invoked for the current `targetEnd`. Reset the flag when `targetEnd` changes.
- **[Risk] SVG animation jank on low-end Android devices** → Mitigation: Keep SVG complexity minimal (single circle with `strokeDasharray`/`strokeDashoffset`). No gradients, no animations beyond the countdown text.

## Additional Architecture Notes

- Component file: `src/components/workout/RestTimer.tsx`
- Props interface: `{ targetEnd: number | null; onComplete: () => void; onSkip: () => void; onAddTime: (seconds: number) => void }`
- Common durations exposed as constants: `30, 60, 90, 120, 180` seconds
- MMKV timer key: `zenlift.workout.timer_target` (managed by ActiveWorkoutStore, not by this component)
- This component is PURELY presentational -- it reads `targetEnd` and calls callbacks. Timer state management lives in ActiveWorkoutStore.
