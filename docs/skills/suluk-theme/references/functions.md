# Functions

## oklch

### `oklch`
Construct an OKLCH color (clamped to valid ranges).
```ts
oklch(l: number, c: number, h: number, alpha?: number): Oklch
```
**Parameters:**
- `l: number`
- `c: number`
- `h: number`
- `alpha: number` (optional)
**Returns:** `Oklch`

### `clampOklch`
Clamp to valid ranges: l∈[0,1], c≥0, h wrapped to [0,360), alpha∈[0,1]. Non-finite inputs collapse to 0.
```ts
clampOklch(color: Oklch): Oklch
```
**Parameters:**
- `color: Oklch`
**Returns:** `Oklch`

### `formatOklch`
Format as a CSS `oklch(L C H)` / `oklch(L C H / A)` string.
```ts
formatOklch(color: Oklch): string
```
**Parameters:**
- `color: Oklch`
**Returns:** `string`

### `parseOklch`
Parse a CSS `oklch(L C H)` / `oklch(L C H / A)` string. Percentages on L are normalized (50% → 0.5). Null on miss.
```ts
parseOklch(input: string): Oklch | null
```
**Parameters:**
- `input: string`
**Returns:** `Oklch | null`

### `withLightness`
A copy with a new lightness (kept in [0,1]).
```ts
withLightness(color: Oklch, l: number): Oklch
```
**Parameters:**
- `color: Oklch`
- `l: number`
**Returns:** `Oklch`

### `withAlpha`
A copy with a new alpha.
```ts
withAlpha(color: Oklch, alpha: number): Oklch
```
**Parameters:**
- `color: Oklch`
- `alpha: number`
**Returns:** `Oklch`

## tokens

### `cssVarName`
The CSS custom-property name for a color role (kebab-cased: primaryForeground → --primary-foreground).
```ts
cssVarName(role: keyof ColorTokens): string
```
**Parameters:**
- `role: keyof ColorTokens`
**Returns:** `string`

## derive

### `deriveDark`
Derive a dark TokenSpec from a light one (colors remapped; radius/fonts/scales carried through).
```ts
deriveDark(light: TokenSpec): TokenSpec
```
**Parameters:**
- `light: TokenSpec`
**Returns:** `TokenSpec`

### `themeFromLight`
Build a complete {light, dark} ThemeSpec, deriving dark when not supplied.
```ts
themeFromLight(light: TokenSpec, dark?: TokenSpec): { light: TokenSpec; dark: TokenSpec }
```
**Parameters:**
- `light: TokenSpec`
- `dark: TokenSpec` (optional)
**Returns:** `{ light: TokenSpec; dark: TokenSpec }`

## parse-css

### `parseShadcnCss`
Parse a shadcn/tweakcn theme CSS string into light + dark ColorTokens. Dark is read from a `.dark` /
 `html[data-theme="dark"]` block when present, otherwise deterministically derived from light. Returns null when
 the CSS has no recognizable `:root` shadcn token block.
```ts
parseShadcnCss(css: string, name: string): { name: string; light: ColorTokens; dark: ColorTokens } | null
```
**Parameters:**
- `css: string`
- `name: string` — default: `""`
**Returns:** `{ name: string; light: ColorTokens; dark: ColorTokens } | null`

## emit

### `toCssVars`
A scheme's CSS custom properties — the colors (OKLCH) + radius + any fonts/shadows/scales — under one selector.
```ts
toCssVars(spec: TokenSpec, opts: CssVarsOptions): string
```
**Parameters:**
- `spec: TokenSpec`
- `opts: CssVarsOptions` — default: `{}`
**Returns:** `string`

### `toThemeCss`
Both modes as CSS: light at :root, dark at the dark selector.
```ts
toThemeCss(theme: ThemeSpec, opts: ThemeCssOptions): string
```
**Parameters:**
- `theme: ThemeSpec`
- `opts: ThemeCssOptions` — default: `{}`
**Returns:** `string`

### `toTailwindTheme`
The Tailwind v4 `@theme inline` block — maps each token to its utility variable (`--color-background`,
`--radius-lg`, `--font-sans`, breakpoints) referencing the `:root` custom properties, so Tailwind utilities
(`bg-background`, `rounded-lg`) resolve to the same source the CSS vars define.
```ts
toTailwindTheme(spec: TokenSpec): string
```
**Parameters:**
- `spec: TokenSpec`
**Returns:** `string`

### `toShadcnTokens`
The shadcn token map: CSS-var name → OKLCH value (+ --radius). What a shadcn `components.json`/globals consumes.
```ts
toShadcnTokens(spec: TokenSpec): Record<string, string>
```
**Parameters:**
- `spec: TokenSpec`
**Returns:** `Record<string, string>`

### `renderBaseCss`
The reusable design-system BASE layer — the accessibility + motion contract every builder inherits, independent
of the scheme colors. Parameterized by CSS-var names so an app on its OWN color vocabulary (not the shadcn role
names) can point it at its own ring/destructive vars. Emits, all reduced-motion-gated:
  - keyboard-only focus rings (`:focus-visible`) on every interactive element — mouse clicks stay clean;
  - the `[aria-invalid]` destructive border+ring contract (app toggles the attribute, theme owns the look);
  - the `.sr-only` + `.skip-link` accessibility utilities (skip-to-content);
  - motion primitives — `shake`/`fade-in-down` (form errors), `[data-reveal]` staggered scroll-reveal, and the
    asymptotic `.navprogress` bar — so each app drives behavior while the look is one inherited source;
  - a GLOBAL `prefers-reduced-motion` baseline that neutralizes all of the above for users who ask for it.
```ts
renderBaseCss(opts: BaseCssOptions): string
```
**Parameters:**
- `opts: BaseCssOptions` — default: `{}`
**Returns:** `string`
