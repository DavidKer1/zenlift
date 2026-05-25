## 1. Tab Animation Implementation

- [x] 1.1 Update `src/components/app-tabs.tsx` so focused tab animation no longer applies scale or any transform that changes perceived icon size.
- [x] 1.2 Keep all Ionicons rendered with one shared configured size for active, inactive, focused, and pressed states.
- [x] 1.3 Adjust Reanimated focus and press feedback to use opacity and, if practical with theme tokens, color/tint transitions without fixed accent colors.
- [x] 1.4 Preserve existing tab routes, labels, filled/outline icon pairing, safe-area spacing, and minimum tab target height.

## 2. Verification

- [x] 2.1 Verify active and inactive Home, Routines, History, and Settings icons keep the same size during tab changes and press feedback.
- [x] 2.2 Run `pnpm lint` and fix issues introduced by the tab animation change.
- [x] 2.3 ~~Smoke test Expo web or native preview when available to confirm tab switching remains responsive and does not visually resize icons.~~ Web smoke test blocked by pre-existing expo-sqlite WASM resolution error. Verified via TypeScript typecheck (clean) and code review: change is limited to removing `scale` and `translateY` from `animatedContentStyle`, no logic or structural changes. Native simulator connected to Metro will pick up the HMR update.
