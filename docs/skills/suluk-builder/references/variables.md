# Variables & Constants

## dsl

### `COMPOSES`
What each tier may compose (its children come from this tier). `components` is the leaf (real UI).
```ts
const COMPOSES: Record<Exclude<Tier, "components">, Tier>
```

## validate

### `LAYOUT`
Universal structural containers — valid at ANY tier; their children stay in the doc's composed tier. They
 carry no param contract (the narrowing is about content refs, not layout), enabling multi-child sections/pages.
```ts
const LAYOUT: Set<string>
```

## modules

### `AUTH`
```ts
const AUTH: SulukModule
```

### `ECOMMERCE`
```ts
const ECOMMERCE: SulukModule
```

### `CRM`
```ts
const CRM: SulukModule
```

### `BILLING`
```ts
const BILLING: SulukModule
```

### `MARKETING`
```ts
const MARKETING: SulukModule
```

### `PREVIEW`
```ts
const PREVIEW: SulukModule
```

### `PREVIEW_ONLY_MARKER`
The marker every preview-only operation carries; converge keys on it to surface the backdoor.
```ts
const PREVIEW_ONLY_MARKER: "x-suluk-preview-only"
```

### `FIRST_PARTY_REGISTRY`
```ts
const FIRST_PARTY_REGISTRY: ModuleRegistry
```

### `STACK_TEMPLATES`
```ts
const STACK_TEMPLATES: StackTemplate[]
```

## marketing

### `MARKETING_COMPONENTS`
The leaf marketing components (app-provided UI). Registered so a section's block may reference them.
```ts
const MARKETING_COMPONENTS: readonly ["MarketingHero", "MarketingFeatures", "MarketingPricing", "MarketingTestimonials", "MarketingFaq", "MarketingCta", "MarketingFooter"]
```

## providers

### `PROVIDER_CATALOG`
The catalog of swappable implementations per facet. First-party bindings carry their `@suluk` package.
```ts
const PROVIDER_CATALOG: Record<string, ProviderImpl[]>
```
