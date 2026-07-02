# Functions

## mock

### `mockStripeFetch`
Build a mock Stripe `fetch`. Returns generic objects for the endpoints @suluk/billing drives; a permissive fallback
 for anything else. Ignores the auth header (any/no key works).
```ts
mockStripeFetch(): typeof fetch
```
**Returns:** `typeof fetch`
