## 1. Foundation: Theme Tokens & Provider

- [x] 1.1 Replace `zenliftColors` in `src/theme/index.ts` with DESIGN.md monochromatic palette (4 surface levels, 4 text opacity tiers)
- [x] 1.2 Update typography tokens to match DESIGN.md (Inter + JetBrains Mono, correct sizes/weights/lineHeights/letterSpacing)
- [x] 1.3 Update border radius tokens to use 12px default (`radius.lg`)
- [x] 1.4 Remove all shadow definitions from `src/theme/index.ts`
- [x] 1.5 Update spacing tokens to match DESIGN.md named values (`marginLateral`, `gutter`, `stackSm`, `stackMd`, `stackLg`, `paddingCard`)
- [x] 1.6 Update `getZenliftThemeTokens` and `ZenliftThemeTokens` type to reflect new token names
- [x] 1.7 Update `ThemeProvider` in `src/providers/ThemeProvider.tsx` to use new tokens
- [x] 1.8 Remove muscle color map usage (`src/theme/muscleColors.ts`)
- [x] 1.9 Update `global.css` CSS variables to match monochromatic palette (`#0C0B10` background, `#18191D` surface, white text vars)

## 2. Base UI Components

- [x] 2.1 Update `ThemedText` (`src/components/themed-text.tsx`) to support new color token names and DESIGN.md typography styles
- [x] 2.2 Update `ThemedView` (`src/components/themed-view.tsx`) to support new surface color token names
- [x] 2.3 Update `FAB` (`src/components/ui/FAB.tsx`) to white background, black icon, no shadow, pill shape
- [x] 2.4 Update `FilterChip` (`src/components/ui/FilterChip.tsx`) to tonal monochrome style (unselected: `#28272F` bg, selected: white bg/black text, JetBrains Mono font)
- [x] 2.5 Update `SearchBar` (`src/components/ui/SearchBar.tsx`) to `#28272F` background, 12px radius, white 85% text, 30% placeholder
- [x] 2.6 Update `MuscleBadge` (`src/components/ui/MuscleBadge.tsx`) to monochrome chip style (remove colored badges)
- [x] 2.7 Update `ExerciseCard` (`src/components/ui/ExerciseCard.tsx`) to `#18191D` background, 12px radius, no shadow
- [x] 2.8 Create or update `Card` base component with `#18191D` bg, 12px radius, 20px padding, no border/shadow, scale-on-press feedback
- [x] 2.9 Update `collapsible.tsx` to use tonal surface styling

## 3. Home Screen

- [x] 3.1 Restyle `HomeScreen` (`src/app/index.tsx`) background to `#0C0B10`
- [x] 3.2 Restyle `Greeting` component to use DESIGN.md typography (headline-lg-mobile) and white text at correct opacity
- [x] 3.3 Restyle `StartWorkoutButton` to white background/black text primary variant and `#28272F` secondary variant
- [x] 3.4 Restyle `LastWorkoutCard` to `#18191D` tonal card with 12px radius
- [x] 3.5 Restyle `WeeklyActivityCard` to `#18191D` card with opacity-based dot indicators (80% active, 10% inactive)
- [x] 3.6 Restyle `CurrentRoutineCard` to `#18191D` card with white progress ring
- [x] 3.7 Restyle `RecentPRsCard` to `#18191D` card with JetBrains Mono for weight values

## 4. Routine Screens

- [x] 4.1 Restyle `RoutinesScreen` (`src/app/routines.tsx`) background to `#0C0B10`
- [x] 4.2 Restyle `RoutineCard` to `#18191D` tonal card with 12px radius, scale-on-press
- [x] 4.3 Restyle `EmptyState` to use tonal surface and correct text opacities
- [x] 4.4 Restyle `SuggestedTemplates` cards to `#18191D` tonal surface
- [x] 4.5 Restyle Routine Detail screen to `#0C0B10` background, `#18191D` day section cards
- [x] 4.6 Restyle Routine Form screen inputs to `#28272F` background, 12px radius; buttons to monochrome variants

## 5. Exercise Screens

- [x] 5.1 Restyle Exercise Library screen background to `#0C0B10`
- [x] 5.2 Update search bar and filter chips (already handled by base components 2.4-2.5)
- [x] 5.3 Restyle Exercise Detail screen with `#18191D` info cards, JetBrains Mono data, monochrome charts
- [x] 5.4 Restyle Exercise Form screen inputs to `#28272F`, buttons to monochrome variants

## 6. Settings Screen

- [x] 6.1 Restyle `SettingsScreen` (`src/app/settings.tsx`) background to `#0C0B10`
- [x] 6.2 Restyle section containers to `#18191D` cards with 12px radius
- [x] 6.3 Restyle toggles/segments to white-selected/`#28272F`-unselected style
- [x] 6.4 Restyle sliders to white active track, `#49454F` inactive track
- [x] 6.5 Restyle modals to `#242329` background with 12px radius
- [x] 6.6 Restyle destructive action buttons to ghost style

## 7. Tab Navigation

- [x] 7.1 Redesign `AppTabs` (`src/components/app-tabs.tsx`) tab bar as floating pill: `#18191D` at 80% opacity, 24px radius, horizontal margins, backdrop blur
- [x] 7.2 Update tab icons to use opacity-based active (100%) / inactive (40%) states instead of color tinting
- [x] 7.3 Update tab labels to use `label-caps` typography style

## 8. Onboarding Flow

- [x] 8.1 Restyle Welcome screen to `#0C0B10` background, `#18191D` content cards, white CTA button
- [x] 8.2 Restyle Unit Selection toggle to white-selected/`#28272F`-unselected
- [x] 8.3 Restyle Weekly Goal screen with tonal surfaces
- [x] 8.4 Update progress dots to opacity-based (80% active, 10% inactive)
- [x] 8.5 Remove all `#F97316` primary color references from onboarding components

## 9. Workout & History Screens

- [x] 9.1 Restyle Active Workout screen to `#0C0B10` background with `#18191D` exercise cards
- [x] 9.2 Restyle set input fields to `#28272F` background with 12px radius
- [x] 9.3 Restyle timer/completion indicators to monochrome style
- [x] 9.4 Restyle History screen (`src/app/history.tsx`) to `#0C0B10` background with `#18191D` session cards
- [x] 9.5 Restyle history charts to monochrome (white strokes at varying opacities)

## 10. Polish & Cleanup

- [x] 10.1 Remove any remaining gradient usage across the app
- [x] 10.2 Remove any remaining shadow usage across components
- [x] 10.3 Remove any remaining color accent references (blue `#0052FF`, green `#05B169`, orange `#F97316`) from styles
- [x] 10.4 Verify JetBrains Mono font loading on native platforms (iOS/Android)
- [x] 10.5 Verify Inter font loading on native platforms
- [ ] 10.6 Test all screens on iOS simulator for visual consistency
- [ ] 10.7 Test all screens on Android emulator for visual consistency
- [x] 10.8 Run full test suite to ensure no regressions
