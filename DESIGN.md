---
name: Zenlift
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-lateral: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  padding-card: 20px
---

## Brand & Style

The design system is built on the principles of **technical minimalism** and **monochromatic depth**. It is designed for high-performance tools where focus, clarity, and speed are paramount. The aesthetic is "silent"—it removes all visual noise (colors, shadows, borders) to allow the user's data and actions to take center stage.

The emotional response is one of **utilitarian luxury** and **clinical precision**. By relying exclusively on tonal shifts of warm blacks and greys, the UI feels like a seamless physical object rather than a digital interface. It draws inspiration from hardware-centric software design, prioritizing a "dark-first" architecture that reduces eye strain and emphasizes information density.

## Colors

This design system uses a strictly monochromatic, high-contrast palette. Depth is achieved through a hierarchical stacking of surfaces:

*   **Background:** The foundational layer, a warm deep black.
*   **Surface Primary:** Used for the main content containers and base cards.
*   **Surface Secondary/Elevated:** Used for interactive elements, secondary containers, or elements that need to appear closer to the user.

Hierarchy is managed through **text opacity** rather than distinct hues. Pure white (#FFFFFF) is the sole text color, with opacity adjustments defining the visual weight:
*   **100%:** Primary headings and critical data.
*   **85%:** Standard body text and labels.
*   **50%:** Secondary metadata, captions, and icons.
*   **30%:** Placeholder text and disabled states.

## Typography

The typography strategy pairs a clean, geometric sans-serif for UI elements with a monospaced font for data-heavy strings.

*   **Geometric Sans (Inter):** Used for all headings and body copy. Titles must utilize tight letter-spacing (-0.02em) to maintain a dense, "engineered" look.
*   **Monospace (JetBrains Mono):** Reserved for numerical values, timestamps, and technical identifiers. This ensures tabular alignment in data grids and reinforces the "precision tool" aesthetic.
*   **Scale:** Headings are bold and significant, while body text remains legible and functional. Mobile sizes are adjusted to prevent overwhelming the smaller viewport while maintaining the "tight" feel.

## Layout & Spacing

The layout is governed by a **fixed-width container** on desktop and a **fluid safe-area model** on mobile.

*   **Rhythm:** An 8px base grid is used for all internal padding and spacing.
*   **Margins:** A strict 24px lateral margin is maintained across all device types to provide a breathable frame for the dark content.
*   **Grid:** A 12-column grid for desktop, 8-column for tablet, and 4-column for mobile.
*   **Grouping:** Elements are grouped using tonal containers rather than lines. Proximity is the primary indicator of relationship, supported by consistent 16px gutters between cards.

## Elevation & Depth

Depth is created strictly through **Tonal Layering**. Shadows and outlines are forbidden to ensure the interface feels flat and integrated into the hardware.

1.  **Level 0 (Background):** #141218. The canvas.
2.  **Level 1 (Primary Cards):** #211F24. For main information modules.
3.  **Level 2 (Elevated Surfaces):** #2B292F. For hover states, active selections, or floating navigation elements.
4.  **Interaction:** When an element is pressed, it should subtly shift in tone (either slightly lighter or darker depending on context) to provide tactile feedback without relying on traditional "glow" or "lift" effects.

## Shapes

The design system utilizes a **Rounded** shape language to soften the intensity of the monochrome palette.

*   **Cards & Modules:** Use a standard 12px (`rounded-lg`) radius. This creates a "squircle-lite" appearance that feels modern and premium.
*   **Buttons & Inputs:** Follow the card radius or use a slightly smaller 8px radius for compact components.
*   **Small Elements:** Chips and badges should use a fully rounded (pill) shape to contrast against the structural cards.

## Components

*   **Cards:** The fundamental building block. Must use #211F24 with 12px corner radius. No borders. Content inside should have 20px padding.
*   **Buttons:**
    *   *Primary:* #CFBCFF background with #381E72 text.
    *   *Secondary:* #2B292F surface with 85% white text.
    *   *Ghost:* No background, 50% white text, 100% white on hover.
*   **Data Visualizations:** Use pure white lines and dots. For charts, use varying opacities of white or subtle greyscales to differentiate data sets.
*   **Input Fields:** #211F24 or #2B292F background, 12px radius, 85% white text. Placeholders at 30% opacity. Focus state is indicated by a subtle shift to #36343A or a 1px solid outline if high accessibility is required (though tonal shift is preferred).
*   **Chips:** Small #2B292F containers with 50% white JetBrains Mono text; selected chips use #6750A4 with #E0D2FF text.
*   **Lists:** Items are separated by space, not lines. Active items should use the #2B292F or #36343A background shift.
