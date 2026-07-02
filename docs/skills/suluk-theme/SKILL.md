---
description: "The design-token CONTRACT: a typed TokenSpec (OKLCH colors + radius/fonts/shadows + type/spacing scales + breakpoints) that PROJECTS into CSS custom properties, the Tailwind v4 @theme block, and a shadcn token map — one source of truth for the look. Includes an OKLCH value type + a deterministic generate-dark-from-light, with reference schemes proving the mechanism (the 40+ curated catalog is meta-product breadth). CANDIDATE tooling."
name: suluk-theme
---

# @suluk/theme

The design-token CONTRACT: a typed TokenSpec (OKLCH colors + radius/fonts/shadows + type/spacing scales + breakpoints) that PROJECTS into CSS custom properties, the Tailwind v4 @theme block, and a shadcn token map — one source of truth for the look. Includes an OKLCH value type + a deterministic generate-dark-from-light, with reference schemes proving the mechanism (the 40+ curated catalog is meta-product breadth). CANDIDATE tooling.

## Quick Start

```ts
import {
  oklch, terracotta, themeFromLight,
  toCssVars, toThemeCss, toTailwindTheme, toShadcnTokens,
  type TokenSpec,
} from "@suluk/theme";

// Use a reference scheme, or author your own TokenSpec from OKLCH colors + a radius.
const theme = themeFromLight(terracotta); // { light, dark } — dark is derived if not supplied

toCssVars(terracotta);          // ":root { --background: oklch(1 0 0); … --radius: 0.625rem; }"
toThemeCss(theme);              // light at :root + dark at [data-theme='dark']
toTailwindTheme(terracotta);    // "@theme inline { --color-background: var(--background); --radius-lg: var(--radius); … }"
toShadcnTokens(terracotta);     // { "--primary": "oklch(0.6397 0.172 36.44)", "--radius": "0.625rem", … }
```

## Configuration

3 configuration interfaces — see references/config.md for details.

## Quick Reference

**oklch:** `oklch` (Construct an OKLCH color (clamped to valid ranges)), `clampOklch` (Clamp to valid ranges: l∈[0,1], c≥0, h wrapped to [0,360), alpha∈[0,1]), `formatOklch` (Format as a CSS `oklch(L C H)` / `oklch(L C H / A)` string), `parseOklch` (Parse a CSS `oklch(L C H)` / `oklch(L C H / A)` string), `withLightness` (A copy with a new lightness (kept in [0,1])), `withAlpha` (A copy with a new alpha), `Oklch` (The OKLCH value type (saastarter-parity Phase 1))
**tokens:** `cssVarName` (The CSS custom-property name for a color role (kebab-cased: primaryForeground → --primary-foreground)), `ColorTokens` (The shadcn color-token roles (each a foreground/surface pair where applicable)), `FontTokens`, `TokenSpec` (One mode's tokens (light or dark)), `ThemeSpec` (A complete scheme: the light mode + its dark mode (authored, or derived via deriveDark)), `COLOR_ROLES` (the color roles, in CSS-var order — the single list emit + derive iterate)
**derive:** `deriveDark` (Derive a dark TokenSpec from a light one (colors remapped; radius/fonts/scales carried through)), `themeFromLight` (Build a complete {light, dark} ThemeSpec, deriving dark when not supplied)
**parse-css:** `parseShadcnCss` (Parse a shadcn/tweakcn theme CSS string into light + dark ColorTokens)
**emit:** `toCssVars` (A scheme's CSS custom properties — the colors (OKLCH) + radius + any fonts/shadows/scales — under one selector), `toThemeCss` (Both modes as CSS: light at :root, dark at the dark selector), `toTailwindTheme` (The Tailwind v4 `@theme inline` block — maps each token to its utility variable (`--color-background`,
`--radius-lg`, `--font-sans`, breakpoints) referencing the `:root` custom properties, so Tailwind utilities
(`bg-background`, `rounded-lg`) resolve to the same source the CSS vars define), `toShadcnTokens` (The shadcn token map: CSS-var name → OKLCH value (+ --radius)), `renderBaseCss` (The reusable design-system BASE layer — the accessibility + motion contract every builder inherits, independent
of the scheme colors)
**schemes:** `graphite` (Neutral graphite (saastarter's default scheme name) — a chroma-free brand), `terracotta` (Terracotta — saastarter's signature accent (globals), `ocean` (Ocean — a cool blue brand, to show a colored hue derives correctly), `REFERENCE_SCHEMES` (The reference set, keyed by name)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)