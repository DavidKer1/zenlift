## Context

Zenlift currently uses a generic blue-accent color palette (`#0052FF` primary) with shadows, green success colors, and varied surface tones that don't match the DESIGN.md specification. The `modern-dashboard.html` reference implementation (already reviewed) proves the target aesthetic works. DESIGN.md defines a monochromatic tonal system with no shadows, no gradients, and depth achieved exclusively through surface layering. The app uses React Native + Expo with a custom ThemeProvider (`src/providers/ThemeProvider.tsx`) backed by MMKV, and components consume theme via `useZenliftTheme()` and a lighter `useTheme()` hook.

## Goals / Non-Goals

**Goals:**
- Replace the color token system in `src/theme/index.ts` with DESIGN.md's 24-color monochromatic palette
- Update typography scale to match DESIGN.md (Inter for UI, JetBrains Mono for data)
- Remove all shadow definitions and shadow usage from the theme system
- Update `ThemedText`, `ThemedView`, and all UI primitives to work with new token names
- Restyle all 7+ screens and their child components to the tonal surface design
- Redesign bottom tab bar as frosted-glass pill container (matches reference)
- Update `global.css` CSS variables for web platform
- Remove any gradient usage across the app

**Non-Goals:**
- Adding light mode support (dark-first architecture; light can come later)
- Changing navigation structure or screen layouts
- Modifying business logic, data layer, or repositories
- Adding new screens or features
- Changing animation patterns (except removing shadow-related ones)
- Updating native iOS/Android config files (Info.plist, build.gradle, etc.)

## Decisions

### D1: Monochromatic Tonal Palette (No Color Accents)

**Decision:** Replace all semantic color tokens (primary, accent, success, warning, danger) with a monochromatic system using only warm black/white tonal variations.

**Rationale:** DESIGN.md explicitly mandates "technical minimalism" and "monochromatic depth." The reference HTML uses only white at varying opacities against layered dark surfaces. Color accents (blue, green, orange) are visual noise that contradicts the "silent" aesthetic. Success/warning/danger states will use opacity variations of white on the appropriate surface, plus iconography for differentiation.

**Alternatives considered:**
- Keep semantic colors but tone them down → Still violates DESIGN.md's zero-color principle
- Use the exact Material Design 3 palette from DESIGN.md YAML → Those tokens include purple/gold tertiary colors; the HTML reference doesn't use them. We follow the HTML reference, which is pure monochrome.

### D2: Surface Elevation via Background Color Tonal Shifts

**Decision:** Implement 4 surface levels through background color alone:

| Level | Token name | Color | Usage |
|-------|-----------|-------|-------|
| 0 | `background` | `#0C0B10` | Page canvas |
| 1 | `surface` | `#18191D` | Primary cards, main containers |
| 2 | `surfaceElevated` | `#242329` | Elevated cards, selected states |
| 3 | `surfaceSecondary` | `#28272F` | Interactive elements, inputs, secondary containers |

**Rationale:** This matches both DESIGN.md's "Tonal Layering" depth model and the modern-dashboard.html reference. No shadows are needed—the darker background naturally recedes and lighter surfaces advance.

### D3: Text Hierarchy via Opacity, Not Color

**Decision:** All text is white (`#FFFFFF`). Hierarchy is controlled by opacity:

| Level | Opacity | Usage |
|-------|---------|-------|
| Primary | 100% | Headings, critical data |
| Body | 85% | Standard body text, labels |
| Secondary | 50% | Metadata, captions, inactive icons |
| Disabled | 30% | Placeholders, disabled text |

**Rationale:** This is the core DESIGN.md principle. It creates cohesion across all text without introducing color variation.

### D4: Typography — Inter + JetBrains Mono

**Decision:** Define typography tokens matching DESIGN.md exactly:

- **Inter** for all UI text: `display-lg` (40px/700), `headline-lg` (32px/600), `headline-lg-mobile` (28px/600), `headline-md` (20px/600), `body-lg` (16px/400), `body-md` (14px/400), `label-caps` (12px/600, 0.05em tracking)
- **JetBrains Mono** for data: `data-lg` (24px/500), `data-md` (14px/500)

On native platforms, Inter and JetBrains Mono need to be loaded as custom fonts. On web, they load via Google Fonts CSS.

### D5: Border Radius Standardization

**Decision:** All cards, buttons, inputs, and containers use 12px (`rounded-lg`) radius. Chips and badges use fully rounded (pill). Small interactive elements may use 8px.

**Rationale:** Matches DESIGN.md's "Rounded" shape language for a "squircle-lite appearance that feels modern and premium."

### D6: Button Variants

**Decision:** Three button variants, matching DESIGN.md components:

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| Primary | `#FFFFFF` | `#0C0B10` (black) | High-contrast primary actions (FAB, CTA) |
| Secondary | `#28272F` | white 85% | Secondary actions |
| Ghost | transparent | white 50% → 100% on hover/press | Tertiary, minimal emphasis |

**Rationale:** The white-on-black primary button is the highest contrast element in the design, drawing attention to the single most important action on screen. This is a deliberate departure from the current blue-primary FAB.

### D7: Tab Bar — Frosted Glass Pill

**Decision:** Bottom tab bar is a rounded pill container (`rounded-3xl` / 24px) with `#18191D` at 80% opacity + backdrop blur, positioned floating above the bottom edge with horizontal margins.

**Rationale:** Matches the modern-dashboard.html reference exactly. The frosted glass effect creates depth through transparency rather than shadow.

### D8: Incremental Migration Approach

**Decision:** Update in this order: (1) theme tokens → (2) ThemeProvider → (3) global.css → (4) ThemedText/ThemedView → (5) base UI components → (6) screens → (7) tab bar.

**Rationale:** The theme system is the foundation. Everything depends on it. Changing tokens first and then propagating outward minimizes broken intermediate states.

## Risks / Trade-offs

- **[Risk] JetBrains Mono may not render well on all Android devices** → Mitigation: Fall back to platform monospace font if custom font fails to load
- **[Risk] Removing semantic colors (success/danger/warning) may harm accessibility** → Mitigation: Preserve semantic color definitions for error/success states but use monochrome-compatible tones; rely on icons + text for differentiation
- **[Risk] White-only text at varying opacities may fail WCAG contrast on some surfaces** → Mitigation: Test key text/surface combinations against 4.5:1 ratio; adjust opacity values if needed
- **[Risk] The 80% opacity tab bar with backdrop blur may not work on older Android versions** → Mitigation: Provide solid fallback background for Android < 12 (API 31)

## Open Questions

- Should we keep `primary` as a theme token for potential future accent color needs, or remove it entirely?
- Do we want haptic feedback on card press (the HTML reference has scale animation)?
- Should the exercise library keep muscle group colors, or switch to monochrome badges?
