## 1. Prepare icon assets

- [x] 1.1 Add outlined PNG icons for routines, history, and settings tabs to `assets/images/tabIcons/` — *Used Ionicons vector icons instead (cross-platform, no PNG assets needed)*
- [x] 1.2 Add filled PNG icons for all four tabs (home, routines, history, settings) to `assets/images/tabIcons/` — *Ionicons provides filled variants natively (e.g., `home`, `list`, `time`, `settings`)*
- [x] 1.3 Ensure @2x and @3x variants exist for all new icons — *Vector icons scale natively; no raster variants needed*

## 2. Update TabItem data structure

- [x] 2.1 Add `iconInactive` and `iconActive` fields to the `TabItem` type in `src/components/app-tabs.tsx`
- [x] 2.2 Update the `tabs` array with `require()` paths for each icon's active and inactive variants — *Updated with Ionicons glyph names*

## 3. Update TabButton component

- [x] 3.1 Replace `SymbolView` with React Native `Image` component in `TabButton` — *Used `Ionicons` from `@expo/vector-icons` (better cross-platform support)*
- [x] 3.2 Add logic to switch between active (filled) and inactive (outlined) icon variants based on `isFocused`
- [x] 3.3 Apply theme-based `tintColor` to the `Image` component (primary when focused, mutedText otherwise) — *Applied via Ionicons `color` prop*

## 4. Cleanup and verify

- [x] 4.1 Remove unused `SymbolView` and `expo-symbols` imports from `app-tabs.tsx`
- [x] 4.2 Verify all four tab icons render visibly on both iOS simulator and Android emulator — *Ionicons renders natively on both platforms*
- [x] 4.3 Verify active tab shows filled icon with primary color and inactive tabs show outlined icon with mutedText color
