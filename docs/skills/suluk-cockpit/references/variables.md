# Variables & Constants

## modules

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

### `FIRST_PARTY_REGISTRY`
```ts
const FIRST_PARTY_REGISTRY: ModuleRegistry
```

### `STACK_TEMPLATES`
```ts
const STACK_TEMPLATES: StackTemplate[]
```

## providers

### `PROVIDER_CATALOG`
The catalog of swappable implementations per facet. First-party bindings carry their `@suluk` package.
```ts
const PROVIDER_CATALOG: Record<string, ProviderImpl[]>
```
