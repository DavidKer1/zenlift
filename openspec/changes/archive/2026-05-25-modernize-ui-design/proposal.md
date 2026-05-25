## Why

The current UI uses a generic blue-accent palette (#0052FF primary, shadows, varied surface colors) that contradicts Zenlift's DESIGN.md, which defines a refined monochromatic tonal system. The `modern-dashboard.html` reference implementation already proves the target aesthetic: warm blacks (#0C0B10 background), tonal surface hierarchy (#18191D → #242329 → #28272F), white text with opacity-driven hierarchy, and flat depth via tonal layering—no shadows, no gradients, no color accents. Aligning all screens with DESIGN.md delivers the "utilitarian luxury" and "clinical precision" the product vision demands.

## What Changes

- **Replace the entire color palette**: Switch from blue-primary/colored system to the DESIGN.md monochromatic tonal palette (24 semantic color tokens)
- **Update typography scale**: Align font sizes, weights, line heights, and letter spacing with DESIGN.md. Use Inter for UI and JetBrains Mono for data/numbers
- **Remove all shadows**: Eliminate shadow tokens and their usage across components. Depth is achieved exclusively through tonal surface layering
- **Remove all gradients**: Replace any gradient backgrounds with flat tonal surfaces
- **Standardize border radius**: All cards, buttons, and containers use 12px (`rounded-lg`) rounded corners
- **Update all 7+ screens**: Home, Routines, Exercise Library, Exercise Detail, Routine Detail, Settings, History, Workout (active session) screens
- **Update all UI components**: Cards, buttons (primary/secondary/ghost), FAB, chips, search bar, filter chips, badges, inputs, bottom tab bar
- **Update theme provider and tokens**: `src/theme/index.ts`, `ThemeProvider`, and `global.css` must reflect DESIGN.md tokens exactly
- **Update bottom navigation**: Tab bar styling to match the reference (frosted glass, rounded pill container)

## Capabilities

### New Capabilities

- `design-token-system`: Centralized design tokens matching DESIGN.md—colors, typography scale, spacing, border radius, and surface elevation levels
- `monochromatic-ui-components`: Base UI primitives (cards, buttons, chips, inputs) styled with the tonal monochromatic system

### Modified Capabilities

- `app-theme`: Replace current color palette and typography with DESIGN.md tokens; remove shadows; update ThemeProvider
- `home-screen`: Restyle HomeScreen and all home card components to monochromatic tonal design
- `routine-list-screen`: Restyle routines list, routine cards, empty state, and FAB
- `routine-detail-screen`: Restyle routine detail view with tonal surfaces
- `routine-form-screen`: Restyle routine creation/edit form
- `exercise-library`: Restyle exercise list, search bar, filter chips, exercise cards
- `exercise-detail-screen`: Restyle exercise detail view
- `exercise-form`: Restyle exercise creation/edit form
- `settings-ui`: Restyle settings screen, toggles, sliders, and modals
- `base-tab-navigation`: Update tab bar to frosted-glass pill container with correct tonal styling
- `tab-bar-icons`: Update icon styling to use opacity-based hierarchy
- `onboarding-flow`: Restyle onboarding screens with monochromatic palette

## Impact

- **Theme system** (`src/theme/index.ts`, `src/providers/ThemeProvider.tsx`, `src/global.css`): Full rewrite of color tokens, removal of shadow tokens, typography scale update
- **All screens** (`src/app/*.tsx`): Visual restyle of every screen
- **All UI components** (`src/components/ui/*`, `src/components/home/*`, `src/components/routine/*`, `src/components/exercise/*`, `src/components/workout/*`): Restyle to monochromatic tonal system
- **Tab navigation** (`src/components/app-tabs.tsx`): Bottom bar redesign
- **ThemedText/ThemedView** (`src/components/themed-text.tsx`, `src/components/themed-view.tsx`): May need updates for new color key names
- **No backend or database changes**: This is purely a visual/theme change
