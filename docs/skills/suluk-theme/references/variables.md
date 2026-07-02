# Variables & Constants

## tokens

### `COLOR_ROLES`
the color roles, in CSS-var order — the single list emit + derive iterate.
```ts
const COLOR_ROLES: ReadonlyArray<keyof ColorTokens>
```

## schemes

### `graphite`
Neutral graphite (saastarter's default scheme name) — a chroma-free brand.
```ts
const graphite: TokenSpec
```

### `terracotta`
Terracotta — saastarter's signature accent (globals.css oklch(0.6397 0.172 36.44)).
```ts
const terracotta: TokenSpec
```

### `ocean`
Ocean — a cool blue brand, to show a colored hue derives correctly.
```ts
const ocean: TokenSpec
```

### `REFERENCE_SCHEMES`
The reference set, keyed by name.
```ts
const REFERENCE_SCHEMES: Record<string, TokenSpec>
```
