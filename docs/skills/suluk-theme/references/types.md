# Types & Enums

## oklch

### `Oklch`
The OKLCH value type (saastarter-parity Phase 1). saastarter's themes are OKLCH (globals.css), the modern
perceptually-uniform color space — lightness, chroma, hue are independent, which is exactly what makes a
deterministic light→dark derivation tractable (you move L without smearing hue). Pure value type + parse/format;
no CSS engine, no deps.
**Properties:**
- `l: number` — perceptual lightness, 0 (black) … 1 (white).
- `c: number` — chroma (colorfulness), ≥ 0 (~0.37 max for sRGB).
- `h: number` — hue angle in degrees, 0 … 360.
- `alpha: number` (optional) — optional alpha, 0 … 1.

## tokens

### `ColorTokens`
The shadcn color-token roles (each a foreground/surface pair where applicable).
**Properties:**
- `background: Oklch`
- `foreground: Oklch`
- `card: Oklch`
- `cardForeground: Oklch`
- `popover: Oklch`
- `popoverForeground: Oklch`
- `primary: Oklch`
- `primaryForeground: Oklch`
- `secondary: Oklch`
- `secondaryForeground: Oklch`
- `muted: Oklch`
- `mutedForeground: Oklch`
- `accent: Oklch`
- `accentForeground: Oklch`
- `destructive: Oklch`
- `destructiveForeground: Oklch`
- `border: Oklch`
- `input: Oklch`
- `ring: Oklch`

### `FontTokens`
**Properties:**
- `sans: string` (optional)
- `serif: string` (optional)
- `mono: string` (optional)

### `TokenSpec`
One mode's tokens (light or dark).
**Properties:**
- `name: string` — scheme name (e.g. "terracotta").
- `colors: ColorTokens`
- `radius: number` — base corner radius in rem (drives --radius and the derived sm/md/lg).
- `fonts: FontTokens` (optional)
- `shadows: Record<string, string>` (optional) — named box-shadows → CSS shadow value.
- `typeScale: Record<string, string>` (optional) — named type-scale steps → font-size value (e.g. { base: "1rem", lg: "1.125rem" }).
- `spacing: Record<string, string>` (optional) — named spacing steps → length.
- `breakpoints: Record<string, string>` (optional) — named breakpoints → min-width (e.g. { md: "48rem" }).

### `ThemeSpec`
A complete scheme: the light mode + its dark mode (authored, or derived via deriveDark).
**Properties:**
- `light: TokenSpec`
- `dark: TokenSpec`
