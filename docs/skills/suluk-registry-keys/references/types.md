# Types & Enums

## keys.service

### `RequestedCaps`
The caps a caller REQUESTS for a new child (clamped to the parent's before minting).
**Properties:**
- `scopes: string[]`
- `creditLimit: number | null` (optional)
- `rateLimitSharePct: number | null` (optional)
- `expiresAt: number | null` (optional)
