## Context

The app currently uses a starter tab shell with `index` and `explore`. Zenlift needs an MVP shell centered on Home, Routines, History, and Settings. The Notion task says 4 tabs and depends on the theme task.

## Goals / Non-Goals

**Goals:**
- Replace active starter navigation with four Zenlift tabs.
- Keep placeholders thin and product-named.
- Use Expo Router route files under `src/app`.
- Integrate tab colors with the Zenlift theme once available.

**Non-Goals:**
- Do not build final screen UX.
- Do not implement nested routine/workout/history routes.
- Do not implement onboarding or active workout navigation in this change.

## Decisions

- Use Expo Router tabs from the existing app structure instead of adding a separate navigation root.
- Keep route filenames simple (`index`, `routines`, `history`, `settings`) so typed routes remain predictable.
- Use icons from the project's installed navigation/icon stack or add a minimal compatible icon dependency if the current starter icon approach is insufficient.
- Make placeholders explicit product screens with no instructional starter copy.

## Risks / Trade-offs

- Theme dependency timing -> Use theme tokens when present; otherwise use temporary constants that match the planned theme.
- Starter code removal may affect web demo assets -> Remove only active starter route usage and leave unrelated assets for later cleanup.
- Future Active Workout prominence -> Home placeholder should leave room for start/resume workout as the primary action in later changes.
