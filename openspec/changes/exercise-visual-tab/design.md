## Context

Zenlift already has an exercise library route at `/exercise` and an exercise detail route at `/exercise/[id]`, but the bottom tab shell currently exposes only Home, Routines, History, and Settings. The existing exercise screens are more operational than visual: the list includes favorite/create affordances and the detail screen includes performance data, edit/delete actions for custom exercises, and quick workout entry.

The new requirement is to make exercises a first-class tab that is easy to browse visually. This tab should help users identify exercises, read a short description, and see a photo while preserving the app's dark, focused, local-first product direction. The change should not alter the core workout data model or risk the active workout loop.

## Goals / Non-Goals

**Goals:**

- Add `Ejercicios` as the third bottom tab, between `Rutinas` and `Historial`.
- Use a dumbbell icon for `Ejercicios` and change `Rutinas` to a route/planning icon so tab semantics do not overlap.
- Keep the exercise tab read-only: users can search, filter, open details, and read visual information, but they cannot create, favorite, edit, delete, or start a quick workout from this tab flow.
- Show local photos and Spanish descriptions for seeded exercises so the experience works offline.
- Keep search, muscle filters, equipment filters, FlashList performance, and existing repository reads.
- Avoid SQLite schema changes for this visual-only pass.

**Non-Goals:**

- No new backend, remote image CDN, marketplace, coaching, or social features.
- No migration of exercise descriptions/photos into SQLite in this change.
- No removal of lower-level repository support for custom exercises or favorites unless a future product decision requires it.
- No changes to active workout data capture, workout autosave, PR detection, or routine editing.

## Decisions

1. Reuse the existing `/exercise` route instead of adding a parallel route.

   The app already has a working search/filter library and detail route. Reusing it keeps navigation simple, avoids duplicate data-loading code, and makes the new tab a product-level repositioning of the existing exercise surface.

   Alternative considered: create a new `/exercises` or `/discover` route. This would avoid touching the existing screen, but would duplicate list, filter, and repository behavior while leaving two exercise destinations with different semantics.

2. Extract bottom tab configuration into a pure `app-tabs.config.ts`.

   The current tab list is embedded in the rendered component. A pure config lets tests assert route order, labels, and icon identity without rendering Reanimated or Expo Router UI.

   Alternative considered: test rendered tabs only. That would cover integration, but it would be heavier and less direct for simple navigation contract changes.

3. Use installed icon packages only.

   `expo-symbols` can represent the dumbbell/fitness icon and `@expo/vector-icons` already supports the other tab icons. This satisfies the icon change without adding dependencies.

   Alternative considered: add a new icon library. That would increase app weight for a single tab icon and is unnecessary.

4. Store visual metadata in a feature helper instead of SQLite.

   The screen needs local descriptions/photos, but this pass is explicitly visual-only. A helper keyed by seeded exercise ID avoids migrations, keeps repository contracts stable, and can be tested against `assets/exercise.json`.

   Alternative considered: add `description` and `photo_key` columns to `exercises`. That may be better later if descriptions become editable or user-generated, but it introduces migration and repository work that is not needed for the requested tab.

5. Remove write/actions from the visual path at the UI layer.

   The exercise list and detail should become browse/read surfaces. Removing FAB, favorite toggle, edit/delete, and quick workout affordances from these screens makes the tab match the request while avoiding destructive data changes.

   Alternative considered: keep actions hidden behind menus. That still makes the section operational instead of visual and increases the chance users start workflows from the wrong place.

## Risks / Trade-offs

- Static visual metadata can drift from seeded exercises -> Add a test that every seeded exercise ID has visual metadata.
- Generated/local PNG assets can increase bundle size -> Keep assets compressed and use square crops suitable for list cards and detail hero.
- Removing visible custom exercise edit/create entry points from this tab may reduce discoverability for those actions -> Keep this proposal scoped to the visual tab; future changes can place custom exercise management in routine-building flows or settings if product wants it.
- Mixed icon renderers can look optically inconsistent -> Keep sizes, opacity animation, tint, and minimalist styling stable across tab icons.
- The current graphify report is stale -> Rely on source files during implementation and refresh graph after significant code changes.
