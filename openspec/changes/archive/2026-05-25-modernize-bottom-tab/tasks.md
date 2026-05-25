## 1. Tab Bar Structure

- [x] 1.1 Update `src/components/app-tabs.tsx` so the tab list renders as a full-width bottom navigation surface instead of a floating pill.
- [x] 1.2 Remove border radius, floating bottom margin, backdrop blur assumptions, shadows, and visible borders from the tab bar styles.
- [x] 1.3 Preserve the existing four tab routes and labels: Home, Rutinas, Historial, and Settings.
- [x] 1.4 Tune tab bar height, bottom safe-area padding, and equal-width tab targets so each tab remains at least 48px tall.

## 2. Minimal Icon Treatment

- [x] 2.1 Review the existing `MaterialCommunityIcons` choices and keep or adjust each tab to the cleanest minimal glyph available in the current icon set.
- [x] 2.2 Ensure active and inactive icon/label states use white opacity hierarchy without accent colors, gradients, glow, badges, or decorative indicators.
- [x] 2.3 Verify inactive tabs remain readable and recognizable against the black bottom bar.

## 3. Reanimated Interaction

- [x] 3.1 Add Reanimated imports needed for tab button animation without introducing new dependencies.
- [x] 3.2 Encapsulate focus and press animation state inside `TabButton` using Reanimated shared values and animated styles.
- [x] 3.3 Animate active/focused tab changes with subtle opacity, scale, or vertical translation only.
- [x] 3.4 Add press feedback that does not change tab bar height or reflow neighboring tabs.
- [x] 3.5 Keep motion finite and minimal, with no looping, pulsing, heavy bounce, glow, or blocked navigation input.

## 4. Verification

- [x] 4.1 Run the project lint/type validation available for the workspace.
- [ ] 4.2 Smoke test tab switching on an available Expo target and confirm all four routes still render.
- [ ] 4.3 Confirm the rendered bottom tab has a black background, straight edges, no border radius, and no floating pill styling.
- [ ] 4.4 Confirm the tab bar respects safe-area spacing and maintains usable touch proportions on mobile-sized viewports.