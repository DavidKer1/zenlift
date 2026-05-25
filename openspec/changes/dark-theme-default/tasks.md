## 1. Code Changes

- [x] 1.1 Change `DEFAULT_SETTINGS.themeMode` from `'light'` to `'dark'` in `src/features/settings/constants.ts`
- [x] 1.2 Change `getStoredThemeMode` fallback from `'light'` to `'dark'` in `src/providers/ThemeProvider.tsx`

## 2. Spec Updates

- [x] 2.1 Update `openspec/specs/app-theme/spec.md`: change "Theme mode preference" requirement default from light to dark, add "Default theme is dark" scenario
- [x] 2.2 Update `openspec/specs/settings-storage/spec.md`: change "Theme mode preference storage" requirement default from `light` to `dark`, rename scenario from "Default theme is light" to "Default theme is dark", add "User selects light mode" scenario

## 3. Documentation Updates

- [x] 3.1 Update `AGENTS.md` line 46: change "Use light theme by default" to "Use dark theme by default"
- [x] 3.2 Update `docs/product_context.md` line 62: change "Tema claro por defecto" to "Tema oscuro por defecto"
- [x] 3.3 Update `docs/architecture.md` lines 36 and 95: change light default references to dark
- [x] 3.4 Update `docs/roadmap_testing.md` lines 34 and 84: change light default references to dark
- [x] 3.5 Update `docs/zenlift_product_blueprint.md`: replace all "tema claro por defecto" / "light mode por defecto" references with "tema oscuro por defecto" / "dark mode por defecto", update default theme value from `'light'` to `'dark'`

## 4. Verification

- [x] 4.1 Run `pnpm tsc --noEmit` to verify no TypeScript errors
- [x] 4.2 Run `pnpm test` to ensure existing tests pass
- [ ] 4.3 Manually verify fresh app launch shows dark theme by default
