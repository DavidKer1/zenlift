## Why

The current tab bar uses SF Symbols (`expo-symbols`) which only render on iOS. On Android, tab icons are invisible or broken, degrading the experience for a significant portion of users. The tab bar needs cross-platform image-based icons with distinct active/inactive states to match the Zenlift design system on both platforms.

## What Changes

- Replace `SymbolView` (expo-symbols) with React Native `Image` components using PNG assets for each tab
- Add PNG icon assets for all four tabs: Home, Routines, History, Settings
- Support distinct outlined (inactive) and filled (active) icon variants per tab
- Remove `expo-symbols` import from `app-tabs.tsx`

## Capabilities

### New Capabilities
- `tab-bar-icons`: Cross-platform tab bar icons with active/inactive state support using PNG image assets

### Modified Capabilities
- `base-tab-navigation`: Tab buttons SHALL render cross-platform image icons instead of SF Symbols, with distinct visual states for active and inactive tabs

## Impact

- `src/components/app-tabs.tsx` — Replace SymbolView with Image, add active/inactive icon switching
- `assets/images/tabIcons/` — Add tab icon PNGs for routines, history, and settings (home and explore already exist)
- `package.json` — May remove `expo-symbols` if not used elsewhere
