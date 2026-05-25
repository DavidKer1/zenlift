## Context

The current tab bar implementation in `src/components/app-tabs.tsx` uses `SymbolView` from `expo-symbols` to render SF Symbols as tab icons. These only render on iOS; on Android they appear as blank or missing icons. The project already has a PNG icon asset structure at `assets/images/tabIcons/` with `home.png` and `explore.png` (plus @2x/@3x variants), but these are unused by the current tab component.

The Zenlift theme uses athletic orange (`#F97316`) as primary and defines `colors.mutedText` for inactive states. The tab bar should leverage these tokens to tint icons appropriately.

## Goals / Non-Goals

**Goals:**
- Render visible tab icons on both iOS and Android
- Provide distinct outlined (inactive) and filled (active) icon variants per tab
- Maintain the existing four-tab structure: Home, Routines, History, Settings
- Keep icon tinting driven by theme tokens (primary for active, mutedText for inactive)

**Non-Goals:**
- Redesigning the tab bar layout or adding/removing tabs
- Adding animation transitions between icon states
- Changing the tab routing structure
- Removing `expo-symbols` from the project (it may be used elsewhere)

## Decisions

### 1. Use PNG image assets with `require()` instead of SF Symbols

**Rationale:** React Native's `Image` component with local `require()` works on both platforms out of the box. SF Symbols only work on iOS. The project already follows this pattern with existing assets.

**Alternatives considered:**
- *@expo/vector-icons*: Adds bundle weight for a full icon set when we only need 8 icons. Icons may not match the design system.
- *react-native-svg with SVGs*: Requires an additional dependency and transformer config. Overkill for 8 static icons.
- *Expo Image (expo-image)*: Adds a dependency for cached remote images; local PNGs don't benefit from its caching layer.

### 2. Outlined variant for inactive, filled variant for active

**Rationale:** This is the standard iOS tab bar pattern and provides clear affordance for which tab is selected. Each tab needs two PNG files: `tab-name.png` (outlined/inactive) and `tab-name-filled.png` (filled/active).

### 3. Icon sizing: 24×24 logical pixels at @2x and @3x

**Rationale:** 24pt is the standard iOS tab bar icon size. Android typically uses 24dp as well. We'll generate/provide @2x (48×48) and @3x (72×72) for the PNG assets.

### 4. Keep the existing `TabItem` data structure with added icon fields

**Rationale:** Minimal change to the component. Add `iconInactive` and `iconActive` fields to `TabItem` pointing to the respective `require()` calls.

## Risks / Trade-offs

- **[Risk] Missing icon assets for routines, history, settings** → We'll need to create or source simple geometric PNG icons. The `expo.icon` asset generator in the project can be used as a starting point.
- **[Risk] PNG icons don't tint with `tintColor`** → Unlike SF Symbols, PNG images don't automatically adopt tint. We'll use the `style` prop with `tintColor` on the `Image` component (supported in React Native 0.65+), or provide pre-colored assets.
- **[Trade-off] Slightly larger bundle** → 8 small PNGs (~2-4KB each) add negligible size. Acceptable.
