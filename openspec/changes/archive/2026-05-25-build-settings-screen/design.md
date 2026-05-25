## Context

Zenlift currently has a placeholder Settings screen at `src/app/settings.tsx` with only static text. The app stores theme mode in MMKV via `ThemeProvider`, and unit conversion functions exist (`kgToLb`, `lbToKg`, `convertWeight`) in `src/utils/units.ts`. There is no unified settings storage layer, no export/import, and no data deletion. Users cannot change kg/lb after onboarding, adjust rest timer defaults, or set weekly goals.

The architecture mandates: MMKV for high-frequency settings, React Context for theme only, Zustand for active workout state, and SQLite for structured data. This change adds a thin MMKV-backed settings layer with a complete Settings UI following existing component patterns (ThemedText, ThemedView, SafeAreaView, useZenliftTheme).

Design reference compliance: implementation MUST review `DESIGN.md` and `tmp/design/screens/settings_screen-html.html` before coding. Treat `tmp/design` as visual reference only; if it conflicts with Zenlift product rules, keep the product rule. In particular, use Zenlift athletic orange `#F97316` as the primary action color even though `DESIGN.md` lists a blue primary.

## Goals / Non-Goals

**Goals:**
- Reactive kg/lb toggle that changes weight display across the entire app
- Theme selector (light/dark/system) that changes theme immediately, reusing the existing ThemeProvider
- Weekly goal stepper (1-7 workouts) persisted in MMKV
- Default rest timer slider (30-300 seconds) persisted in MMKV
- Export all workout data as a `.zenlift` JSON file via `expo-file-system` + `expo-sharing`
- Import `.zenlift` JSON file via `expo-document-picker`, validate with Zod, merge by UUID into SQLite
- Delete all data with double-confirm requiring the user to type "BORRAR"
- Settings persist after app restart
- App version display

**Non-Goals:**
- Cloud backup or sync
- Settings for individual exercises or routines
- Import/export progress tracking or version history
- Undo after delete
- Settings search or deep settings hierarchy

## Decisions

### Decision 1: Use MMKV directly (not SQLite) for all settings

**Rationale:** The architecture doc mandates MMKV for settings. The `app_settings` SQLite table exists but is for structured metadata — lightweight, frequently-read preferences belong in MMKV. The `ThemeProvider` already uses a `createMMKV({ id: 'zenlift-settings' })` instance. Use the same MMKV instance ID in the settings hook to share storage.

**Alternatives considered:**
- SQLite `app_settings` table: Adds async I/O overhead for simple reads, complicates reactive propagation
- React Context with AsyncStorage: MMKV is synchronous and faster, already a dependency

### Decision 2: Share MMKV instance across providers

**Rationale:** The `ThemeProvider` creates an MMKV instance with `{ id: 'zenlift-settings' }`. The settings hook will create an MMKV instance with the same ID to access shared storage. MMKV guarantees thread-safe read/write across instances with the same ID.

### Decision 3: Reactive settings via a thin hook (not Zustand)

**Rationale:** MMKV listeners are sufficient for settings reactivity. Adding Zustand for settings would increase complexity without benefit — settings are read infrequently and don't require computed/derived state. The `useSettings` hook uses `useState` + MMKV `addOnValueChangedListener` for live-updating values.

**Alternatives considered:**
- Zustand store: Overkill for 4 keys with no derived state
- React Context: Would require a provider wrapper, unnecessary for a single-screen concern

### Decision 4: Export as single `.zenlift` JSON file

**Rationale:** A single file simplifies backup. The file contains all SQLite tables serialized as a JSON object keyed by table name, plus metadata (version, exportedAt). Uses `expo-file-system` to write to the shared cache directory, then `expo-sharing` to present the native share sheet.

### Decision 5: Import with UUID merge strategy

**Rationale:** Merge by UUID preserves referential integrity and avoids duplicates. If an entity with the same UUID already exists, skip it. If it doesn't exist, insert it. This handles incremental backups without requiring differential logic. No delete-on-import.

**Alternatives considered:**
- Replace all data: Too destructive, users may want to merge from multiple devices
- Timestamp-based merge: UUIDs are simpler and already guaranteed unique

### Decision 6: Delete requires typing "BORRAR"

**Rationale:** Prevents accidental data loss. The confirmation flow uses two steps: (1) a warning modal, (2) a text input that must match "BORRAR" exactly, case-sensitive. Only then does the delete execute. All SQLite tables are truncated, MMKV is cleared, and the app navigates to home.

## Risks / Trade-offs

- **[Risk] MMKV key name collisions across features** → Mitigation: All keys prefixed with `zenlift.settings.` namespace
- **[Risk] Import of large .zenlift files on low-memory devices** → Mitigation: Stream JSON parsing not available in expo-file-system; accept risk for MVP, add file size warning for > 50MB
- **[Risk] Delete all data is irreversible** → Mitigation: Two-step confirmation with typed input; recommend export before delete in the UI
- **[Trade-off] No weight unit propagation mechanism** → The AC says "Toggle kg/lb changes weight display across entire app" but no global hook/store exists yet. Mitigation: `useSettings` hook returns the current unit; screens read it directly. When a Zustand workout store or future context needs it, refactor is trivial.
