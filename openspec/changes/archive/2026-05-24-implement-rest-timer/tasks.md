## 1. Component Skeleton And Props

- [x] 1.1 Create `src/components/workout/RestTimer.tsx` with Props interface: `{ targetEnd: number | null; onComplete: () => void; onSkip: () => void; onAddTime: (seconds: number) => void }`
- [x] 1.2 Add exercise name prop: `exerciseName?: string` for displaying muscle context below the timer
- [x] 1.3 Export `REST_DURATIONS` constant array: `[30, 60, 90, 120, 180]` seconds
- [x] 1.4 Render null early when `targetEnd` is null

## 2. Absolute Timestamp Countdown Logic

- [x] 2.1 Implement `useRef` for `requestAnimationFrame` ID to allow cleanup
- [x] 2.2 Inside `requestAnimationFrame` loop, calculate `remaining = Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000))`
- [x] 2.3 Store the total rest duration in a `useRef` computed once: `totalDuration = Math.ceil((targetEnd - startTime) / 1000)` calculated from initial render
- [x] 2.4 Trigger `onComplete()` and haptic exactly once using a `completedFired` ref flag; reset flag when `targetEnd` changes
- [x] 2.5 Cancel rAF loop on component unmount

## 3. SVG Circular Progress

- [x] 3.1 Render an `Svg` circle with `strokeDasharray` equal to full circumference and `strokeDashoffset` proportional to elapsed time
- [x] 3.2 Use athletic orange `#F97316` as the progress stroke color; use a muted neutral color (e.g., `#E5E7EB`) for the background track
- [x] 3.3 Calculate progress as `progress = 1 - (remaining / totalDuration)`, clamped to [0, 1]
- [x] 3.4 Center the countdown text inside the circle using a View with `position: 'absolute'` overlay

## 4. Haptic Feedback

- [x] 4.1 Import `Haptics` from `expo-haptics` and `NotificationFeedbackType`
- [x] 4.2 Call `Haptics.notificationAsync(NotificationFeedbackType.Success)` when remaining hits 0
- [x] 4.3 Guard with `completedFired` ref to ensure single execution per timer cycle

## 5. Pause/Resume

- [x] 5.1 Add `useState` for `isPaused` boolean (default false)
- [x] 5.2 When paused, skip remaining calculation update -- freeze the displayed number but do NOT modify `targetEnd`
- [x] 5.3 When resumed, recalculate from `targetEnd - Date.now()` immediately (so display jumps to real remaining)
- [x] 5.4 Render pause/play toggle button with appropriate icon or label

## 6. Skip And Add Time Controls

- [x] 6.1 Render "Skip" button that calls `onSkip()` on press
- [x] 6.2 Render "+30s" button that calls `onAddTime(30)` on press
- [x] 6.3 Implement swipe-right gesture detection using `PanResponder` or `GestureDetector` from react-native-gesture-handler; on detect, call `onSkip()`
- [x] 6.4 Style controls using existing ThemedText and ThemedView patterns

## 7. Label And Context Display

- [x] 7.1 Render "Descanso" text below the countdown, centered, using ThemedText with appropriate typography (secondary size)
- [x] 7.2 Render `exerciseName` below "Descanso" when provided
- [x] 7.3 If no `exerciseName` is provided, render only "Descanso"

## 8. Edge Cases And Polish

- [x] 8.1 Handle `targetEnd` in the past on mount: immediately show 0, trigger haptic and onComplete once
- [x] 8.2 Handle `targetEnd` change mid-timer: reset `completedFired`, restart rAF loop with new duration reference
- [x] 8.3 Ensure timer does not render negative numbers (clamp to 0)
- [x] 8.4 Add accessibility labels: countdown number, pause button, skip button, add 30s button
- [x] 8.5 Verify the component does not cause the Active Workout screen to re-render excessively (keep state local to RestTimer)

## 9. Verification

- [x] 9.1 Write unit tests for countdown calculation: verify `Math.ceil((targetEnd - Date.now()) / 1000)` produces correct values for positive, zero, and past timestamps
- [x] 9.2 Write component test using React Native Testing Library: verify null render when targetEnd is null, verify countdown text updates, verify onComplete called
- [x] 9.3 Manually test timer survival: start timer, background app for N seconds, foreground and verify remaining is correct
- [x] 9.4 Manually test pause/resume: pause, wait 5s, resume, verify display jumps to correct remaining
- [x] 9.5 Run typecheck (`npx tsc --noEmit`) and verify no TypeScript errors
- [x] 9.6 Verify haptic fires on a physical device (iOS or Android) when timer reaches 0

## Dependencies

**This task requires these changes to be completed first:**
- **27. ActiveWorkoutStore** (`create-active-workout-store`): Provides `timerTargetEnd`, `startTimer()`, `skipTimer()`, `getTimerRemaining()` from which the timer state flows to this component via props
- **29. Active Workout Screen** (`build-active-workout-screen`): Hosts this RestTimer component and wires the store state to component props

The RestTimer component is purely presentational -- it receives `targetEnd` as a prop and calls callbacks. All timer state management (persisting `targetEnd` to MMKV, modifying it on skip/addTime) is the responsibility of ActiveWorkoutStore. This allows the RestTimer to be developed and tested independently with mock props.
