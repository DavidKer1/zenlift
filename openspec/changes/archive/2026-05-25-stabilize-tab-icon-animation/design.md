## Context

Zenlift uses a custom Expo Router tab bar in `src/components/app-tabs.tsx`. Each tab renders an Ionicons glyph inside a Reanimated container whose focused state currently changes opacity, vertical offset, and scale. The existing `base-tab-navigation` spec already prefers a monochrome, opacity-led tab design, so changing the active animation away from size aligns with the product's quiet dark-first visual system.

The request is specifically about bottom tab icons: active and inactive icons should share the inactive icon footprint, and active-state animation should be communicated through color or opacity. Because the current design system discourages accent-heavy tab states, opacity remains the safest fallback when animated tint colors would introduce fixed colors or fight theme tokens.

## Goals / Non-Goals

**Goals:**

- Keep tab icon size visually constant across active, inactive, focused, and pressed states.
- Replace active-state scale animation with a Reanimated transition based on icon/text color and/or opacity.
- Preserve the current tab targets, safe-area behavior, route structure, and minimalist filled/outline icon pairing.
- Ensure press feedback remains finite and responsive without changing layout or perceived icon size.

**Non-Goals:**

- Redesign the tab bar surface, routes, labels, or safe-area layout.
- Add new navigation dependencies or replace Expo Router tabs.
- Change workout, routine, history, settings, persistence, or data-model behavior.
- Introduce colorful accent states that conflict with the existing monochrome bottom navigation spec.

## Decisions

1. Remove active-state scaling from the animated tab content.

   The tab icon container should no longer use `scale` as a function of focus. This directly satisfies the requirement that active icons stay the size of inactive icons and avoids visual jitter when users switch tabs quickly.

   Alternative considered: lower the scale delta from `1.08` to a smaller value. That still violates the requested stable-size behavior, so it is not appropriate.

2. Animate state through theme-aware color/opacity instead of fixed accent colors.

   The active state should continue to be obvious through a Reanimated transition, but the primary signal should be `opacity` and, where practical, interpolated theme-aware tint values. If icon color interpolation is awkward with the Ionicons implementation, opacity-only animation is acceptable and already matches the existing spec's active/inactive design.

   Alternative considered: assign a fixed active color. That can conflict with `DESIGN.md` and the current `base-tab-navigation` requirement to avoid accent-colored tab selection.

3. Keep icon glyph selection separate from animation.

   The existing filled/outline icon pairing can remain as a discrete focused-state glyph choice, provided both glyphs render at the same configured size. The animation layer should not compensate with scale, container resizing, or font-size changes.

   Alternative considered: remove filled/outline pairing entirely. That is broader than requested and would reduce an existing minimalist active-state cue.

## Risks / Trade-offs

- Active state may feel subtler without scale -> keep the opacity/color contrast strong enough to remain legible in the dark theme.
- Some Ionicons filled and outline glyphs may have slightly different intrinsic silhouettes -> use the same `size` prop and stable container dimensions, and verify the perceived footprint is acceptable across all four tabs.
- Color interpolation may be harder than opacity with vector icons -> prefer opacity-only animation rather than adding fixed colors or brittle wrappers.
- Snapshot or visual assertions may be limited for animation details -> combine unit-level style checks with Expo web smoke testing when available.
