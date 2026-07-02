# Functions

## compose

### `planComposition`
Topologically order modules by `requires`/`provides`, modelling the collision invariants installModule enforces.
```ts
planComposition(base: OpenAPIv4Document, modules: SulukModule[]): CompositionPlan
```
**Parameters:**
- `base: OpenAPIv4Document`
- `modules: SulukModule[]`
**Returns:** `CompositionPlan`

### `composeModules`
Install a set of modules in dependency order, returning the merged platform contract + a per-step trace.
```ts
composeModules(base: OpenAPIv4Document, modules: SulukModule[]): ComposeResult
```
**Parameters:**
- `base: OpenAPIv4Document`
- `modules: SulukModule[]`
**Returns:** `ComposeResult`
