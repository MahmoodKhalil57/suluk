# Functions

## modules

### `resolveTemplate`
Resolve a template's module names to actual modules from a registry — REPORTING any name that doesn't resolve
 (a typo or a module missing from this registry) rather than silently dropping it.
```ts
resolveTemplate(t: StackTemplate, registry: ModuleRegistry): { modules: SulukModule[]; missing: string[] }
```
**Parameters:**
- `t: StackTemplate`
- `registry: ModuleRegistry` — default: `FIRST_PARTY_REGISTRY`
**Returns:** `{ modules: SulukModule[]; missing: string[] }`
