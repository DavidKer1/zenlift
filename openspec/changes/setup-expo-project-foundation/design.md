## Context

The repo currently uses Expo SDK 55 (`expo ~55.0.24`) with Expo Router enabled and TypeScript strict mode already configured. The Notion task asks for SDK 56, but the project rule and installed dependencies point to SDK 55, so this change should preserve SDK 55 unless an explicit upgrade change is created later.

The current source tree still contains starter routes and components. Foundation work should create the intended Zenlift structure without implementing workout features yet.

## Goals / Non-Goals

**Goals:**
- Install the missing MVP dependencies with versions compatible with Expo SDK 55.
- Create the base folders documented in `docs/architecture.md`.
- Keep Expo Router entrypoint, plugin, typed routes, and strict TypeScript working.
- Remove active starter surface only where it blocks Zenlift navigation work.

**Non-Goals:**
- Do not implement database schema, repositories, routines, workouts, or screens.
- Do not upgrade to SDK 56 in this change.
- Do not add a backend, analytics, or cloud sync.

## Decisions

- Use Expo SDK 55 as the implementation target because it is installed and explicitly required by project instructions. Alternative: upgrade to SDK 56 first; rejected because it is a separate dependency migration with broader risk.
- Use `npx expo install` for Expo/RN packages so versions match SDK 55. Use the package manager lockfile already present for non-Expo JS packages.
- Create placeholder `.gitkeep` files only if empty directories must be tracked. Prefer real files when a later foundational change owns the folder contents.
- Keep app code under `src/app` because the existing project already has Expo Router configured there through `main: expo-router/entry` and `tsconfig` path aliases.

## Risks / Trade-offs

- SDK mismatch with Notion task -> Document SDK 55 target and avoid mixing SDK 56-only APIs.
- Dependency bloat -> Install only dependencies listed in the MVP foundation task and compact docs.
- Empty folder churn -> Keep directory scaffolding minimal and aligned with upcoming changes.
