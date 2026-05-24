## 1. Theme Tokens

- [x] 1.1 Create `src/theme/index.ts` with light and dark Zenlift color tokens
- [x] 1.2 Add typography, spacing, radius, and shadow tokens
- [x] 1.3 Create `src/theme/muscleColors.ts` with colors for all 13 seeded muscle groups

## 2. Provider And Persistence

- [x] 2.1 Create `src/providers/ThemeProvider.tsx`
- [x] 2.2 Implement `light`, `dark`, and `system` mode resolution
- [x] 2.3 Persist selected theme mode with MMKV
- [x] 2.4 Export a hook for reading active theme tokens and changing theme mode

## 3. Integration

- [x] 3.1 Wrap the Expo Router root layout with the Zenlift `ThemeProvider`
- [x] 3.2 Bridge Zenlift tokens into React Navigation theme values
- [x] 3.3 Update existing starter theme hooks/components to use the new provider or re-export its values
- [x] 3.4 Run `npx tsc --noEmit`
