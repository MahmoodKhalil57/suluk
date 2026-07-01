[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/theme

# @suluk/theme

**The design-token CONTRACT — author one `TokenSpec`, project it into CSS variables, the Tailwind v4 `@theme` block, and a shadcn token map.**

> **CANDIDATE tooling — not official OpenAPI.** Part of the Suluk OpenAPI v4.0 candidate, not a SIG
> deliverable. Apache-2.0.

## Install

```bash
bun add @suluk/theme
```

## What it does

- **One source of truth for the look.** A typed `TokenSpec` (OKLCH colors + radius/fonts/shadows + type/spacing/breakpoint scales) projects into three otherwise hand-synced surfaces: a `:root` CSS-vars block, the Tailwind v4 `@theme inline` block, and a shadcn token map. They can't drift, because they're all derived from the same spec.
- **OKLCH value type.** A small, dependency-free `Oklch` value (`l`/`c`/`h`/`alpha`) with `parse`/`format`/`clamp` helpers. OKLCH keeps lightness independent of hue/chroma, which is what makes the dark-mode derivation tractable.
- **Deterministic generate-dark-from-light.** `deriveDark` is a role-aware lightness remap that preserves each token's chroma + hue (surfaces go dark, text goes light, brand colors stay vivid). Same light spec in → same dark spec out.
- **Import community themes.** `parseShadcnCss` reads a shadcn / [tweakcn](https://tweakcn.com) theme CSS block into `ColorTokens`, so any community theme drops into the same emit/derive pipeline as a hand-authored spec.
- **A reusable a11y + motion base layer.** `renderBaseCss` emits a scheme-independent contract — `:focus-visible` rings, the `[aria-invalid]` error look, `.sr-only`/`.skip-link`, and a few motion primitives — all `prefers-reduced-motion`-gated.

## When to reach for it

- You want a single typed definition of an app's look and need it in CSS variables, Tailwind v4, **and** shadcn token form at once — without maintaining three copies.
- You have a shadcn/tweakcn theme CSS and want it as structured `ColorTokens` (e.g. to remap onto your own `--bg`/`--accent` var vocabulary, or to generate swatch previews).
- You want a deterministic dark mode derived from a light scheme rather than hand-authoring both.

It is **not** a theme catalog or a runtime picker: this package ships only the contract + three reference schemes that prove the mechanism. The curated 40+ scheme catalog and the no-flash stamper/picker are app-layer breadth (see [saasuluk](https://github.com/MahmoodKhalil57/suluk)'s `src/themes/*`), built *on top of* this same `TokenSpec`.

## Usage

### Author a spec, project it everywhere

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

`toCssVars` takes an optional `{ selector }` and `toThemeCss` an optional `{ darkSelector }` (default `[data-theme='dark']`).

### Derive dark from light

```ts
import { deriveDark, graphite } from "@suluk/theme";

const dark = deriveDark(graphite); // surfaces darken, every *foreground role goes light, brand stays vivid
// deriveDark is pure: deriveDark(graphite) deep-equals deriveDark(graphite)
```

### Import a shadcn / tweakcn theme

```ts
import { parseShadcnCss, formatOklch, withLightness, type ColorTokens } from "@suluk/theme";

const css = `:root {
  --background: oklch(0.99 0 0); --foreground: oklch(0.1 0 0);
  --primary: oklch(0.55 0.2 250); --primary-foreground: oklch(1 0 0);
  --muted: oklch(0.97 0 0); --border: oklch(0.92 0 0); --ring: oklch(0.55 0.2 250);
}`;

const t = parseShadcnCss(css, "demo");
// → { name: "demo", light: ColorTokens, dark: ColorTokens } | null
//   dark is read from a `.dark` / html[data-theme="dark"] block when present, else derived.
//   Omitted tokens are filled coherently; null only when the :root color essentials are absent.

if (t) {
  // remap the shadcn roles onto your own var vocabulary (hue-preserving tints stay coherent):
  const accent2 = withLightness(t.light.primary, t.light.primary.l + 0.07);
  const bg = formatOklch(t.light.background); // "oklch(0.99 0 0)"
}
```

### The OKLCH value type

```ts
import { oklch, parseOklch, formatOklch, withLightness, withAlpha } from "@suluk/theme";

oklch(0.64, 0.172, 36.44);                 // { l, c, h } — clamped to valid ranges
formatOklch(oklch(0.6, 0.1, 200, 0.5));    // "oklch(0.6 0.1 200 / 0.5)"
parseOklch("oklch(50% 0.1 120)");          // { l: 0.5, c: 0.1, h: 120 }  (percent L normalized)
parseOklch("rgb(1,2,3)");                  // null
```

### The a11y + motion base layer

```ts
import { renderBaseCss } from "@suluk/theme";

renderBaseCss();                                       // defaults to the shadcn role vars (var(--ring), var(--destructive))
renderBaseCss({ ring: "var(--accent)", destructive: "#ef4444" }); // point it at your own var vocabulary
```

Emit it once into your global stylesheet. It owns the keyboard focus ring, the invalid-field look, the skip-link, and the motion keyframes — all neutralized under `prefers-reduced-motion`.

## API

| Export | What it does |
| --- | --- |
| `oklch`, `clampOklch`, `formatOklch`, `parseOklch`, `withLightness`, `withAlpha`, `Oklch` | the OKLCH value type + parse/format/clamp helpers |
| `TokenSpec`, `ThemeSpec`, `ColorTokens`, `FontTokens` | the design-token contract types |
| `COLOR_ROLES`, `cssVarName` | the ordered color-role list + role → CSS-var name (`primaryForeground` → `--primary-foreground`) |
| `deriveDark`, `themeFromLight` | deterministic dark-from-light derivation; build a `{ light, dark }` spec |
| `toCssVars`, `toThemeCss`, `toTailwindTheme`, `toShadcnTokens`, `renderBaseCss` | the projections (+ `CssVarsOptions`, `ThemeCssOptions`, `BaseCssOptions`) |
| `parseShadcnCss` | import a shadcn/tweakcn theme CSS block into `ColorTokens` |
| `graphite`, `terracotta`, `ocean`, `REFERENCE_SCHEMES` | three reference schemes that prove the mechanism end-to-end |

## Boundary

This package is L3 — it **generates / projects, it does not host**. It hands you CSS strings, a Tailwind block, and a token map that you own and emit; there is no runtime, no theme server, no bundled picker. The curated scheme catalog, the no-flash `<html>` stamper, and the runtime picker are app-layer breadth (they live in the consuming app, e.g. saasuluk's `src/themes/`) and are authored on top of this same `TokenSpec`. The single entry point is `@suluk/theme` — no CLI and no sub-path exports.

## License

Apache-2.0

## Interfaces

- [BaseCssOptions](interfaces/BaseCssOptions.md)
- [ColorTokens](interfaces/ColorTokens.md)
- [CssVarsOptions](interfaces/CssVarsOptions.md)
- [FontTokens](interfaces/FontTokens.md)
- [Oklch](interfaces/Oklch.md)
- [ThemeCssOptions](interfaces/ThemeCssOptions.md)
- [ThemeSpec](interfaces/ThemeSpec.md)
- [TokenSpec](interfaces/TokenSpec.md)

## Variables

- [COLOR\_ROLES](variables/COLOR_ROLES.md)
- [graphite](variables/graphite.md)
- [ocean](variables/ocean.md)
- [REFERENCE\_SCHEMES](variables/REFERENCE_SCHEMES.md)
- [terracotta](variables/terracotta.md)

## Functions

- [clampOklch](functions/clampOklch.md)
- [cssVarName](functions/cssVarName.md)
- [deriveDark](functions/deriveDark.md)
- [formatOklch](functions/formatOklch.md)
- [oklch](functions/oklch.md)
- [parseOklch](functions/parseOklch.md)
- [parseShadcnCss](functions/parseShadcnCss.md)
- [renderBaseCss](functions/renderBaseCss.md)
- [themeFromLight](functions/themeFromLight.md)
- [toCssVars](functions/toCssVars.md)
- [toShadcnTokens](functions/toShadcnTokens.md)
- [toTailwindTheme](functions/toTailwindTheme.md)
- [toThemeCss](functions/toThemeCss.md)
- [withAlpha](functions/withAlpha.md)
- [withLightness](functions/withLightness.md)
