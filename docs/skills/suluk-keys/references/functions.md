# Functions

## chain

### `effectiveCaps`
The caller's EFFECTIVE grant, derived by walking UP the chain. Scopes = the intersection of every node's grant; the
 credit cap + rate share + expiry = the MIN (soonest) of the declared (non-null) ones. The depth-0 identity for a plain
 root key (one node → its own values), so single-key behaviour is preserved.
```ts
effectiveCaps(chain: ChainNode[]): EffectiveCaps
```
**Parameters:**
- `chain: ChainNode[]`
**Returns:** `EffectiveCaps`

### `expiredAncestor`
TRUE when any ANCESTOR (a node other than the caller) has already expired — so the caller auto-expires the moment a
 parent does. The caller's OWN expiry is enforced upstream (the token verify rejects it), so it's excluded.
```ts
expiredAncestor(chain: ChainNode[], callerKeyId: string, now: number): boolean
```
**Parameters:**
- `chain: ChainNode[]`
- `callerKeyId: string`
- `now: number`
**Returns:** `boolean`

### `disabledAncestor`
TRUE when any ANCESTOR has been soft-disabled — so a child auto-dies the moment a parent is revoked, EVEN when the
 revocation didn't cascade through the write path. The read-time half of the cascade. The caller's OWN disable is
 enforced upstream, so it's excluded.
```ts
disabledAncestor(chain: ChainNode[], callerKeyId: string): boolean
```
**Parameters:**
- `chain: ChainNode[]`
- `callerKeyId: string`
**Returns:** `boolean`

### `pooledHeadroom`
The chain's POOLED credit headroom — the BINDING constraint a charge must clear: over every node that declares an own
cap, the LEAST `cap − subtreeSpend(node)` (a node's subtree = itself ∪ descendants). Pooling is what makes a cap
abuse-proof: a parent capped at 50 can't mint children to spend 50 each, because every child's spend lands in the
parent's subtree. The app fetches `spendRows` (per-path spend over the topmost capped node's subtree — one grouped
query); this sums per node in O(nodes × rows). Returns null when no node declares a cap (uncapped — only the balance gates).
```ts
pooledHeadroom(chain: ChainNode[], spendRows: readonly SpendRow[]): Headroom | null
```
**Parameters:**
- `chain: ChainNode[]`
- `spendRows: readonly SpendRow[]`
**Returns:** `Headroom | null`

### `topCappedPath`
The topmost capped node in a chain (the shortest path) — whose subtree contains every other capped node's subtree, so
 one query over it suffices for pooledHeadroom. Null when no node declares a cap.
```ts
topCappedPath(chain: ChainNode[]): string | null
```
**Parameters:**
- `chain: ChainNode[]`
**Returns:** `string | null`

### `clampChildGrant`
Clamp a requested CHILD grant to the parent's EFFECTIVE grant — a child can never out-scope or out-spend an ancestor.
 scopes ⊆ parent's; each cap/expiry = min(requested ?? ∞, parent ?? ∞) (null only when BOTH are unbounded). Pure.
```ts
clampChildGrant(parent: EffectiveCaps, requested: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }): EffectiveCaps
```
**Parameters:**
- `parent: EffectiveCaps`
- `requested: { scopes: string[]; creditLimit?: number | null; rateLimitSharePct?: number | null; expiresAt?: number | null }`
**Returns:** `EffectiveCaps`

## path

### `escapeLike`
Escape SQL-LIKE metacharacters (a keyId can contain `_`, a LIKE wildcard) so a path prefix matches LITERALLY — pair
 with `ESCAPE '\'` in the query. Without this, a sibling whose id shares a `_`-adjacent prefix could leak into a
 subtree match.
```ts
escapeLike(s: string): string
```
**Parameters:**
- `s: string`
**Returns:** `string`

### `subtreeLikePattern`
The `LIKE` pattern for "<path>'s strict descendants" — pair with `ESCAPE '\'`. (The node itself is matched by `= path`.)
```ts
subtreeLikePattern(path: string): string
```
**Parameters:**
- `path: string`
**Returns:** `string`

### `inSubtree`
TRUE when `candidate` is within `path`'s subtree: the node itself (exact) OR a descendant (a "/"-prefix). The JS twin
 of the SQL subtree predicate — the single rule for spend pooling, log visibility, and cascade.
```ts
inSubtree(path: string, candidate: string): boolean
```
**Parameters:**
- `path: string`
- `candidate: string`
**Returns:** `boolean`

### `childPath`
A child's path = `parentPath/childId`, or the bare `childId` when the parent is a root (no path / a session caller).
```ts
childPath(parentPath: string | null | undefined, childId: string): string
```
**Parameters:**
- `parentPath: string | null | undefined`
- `childId: string`
**Returns:** `string`

### `pathDepth`
Depth of a path: 0 = root, >0 = a delegated child.
```ts
pathDepth(path: string): number
```
**Parameters:**
- `path: string`
**Returns:** `number`

### `ancestorIdsOf`
The ancestor keyIds in a path (everything before self), root→parent order.
```ts
ancestorIdsOf(path: string): string[]
```
**Parameters:**
- `path: string`
**Returns:** `string[]`

### `pathAt`
The own-path of the ancestor at index `i` in a path's segments (the prefix up to and including it).
```ts
pathAt(path: string, i: number): string
```
**Parameters:**
- `path: string`
- `i: number`
**Returns:** `string`

## scopes

### `parseScopes`
permissions JSON (`{resource:[actions]}`) → flat `["resource:action"]` scopes, defensively (a bad value → no scopes).
```ts
parseScopes(permissions: string | null): string[]
```
**Parameters:**
- `permissions: string | null`
**Returns:** `string[]`

### `parseKeyMeta`
metadata JSON → the per-key controls (each null when absent/invalid): the PAID credit cap + the rate-limit share %.
 Defensive — a bad value reads as "no override"; the share is clamped to [1,100] to mirror the auth-time clamp.
```ts
parseKeyMeta(metadata: string | null): { creditLimit: number | null; rateLimitSharePct: number | null }
```
**Parameters:**
- `metadata: string | null`
**Returns:** `{ creditLimit: number | null; rateLimitSharePct: number | null }`

## lineage

### `subtreeOf`
The keyIds in a node's subtree (itself + every descendant) — for cascade revoke. Falls back to `[keyId]` for a
 legacy caller with no lineage row (a childless root).
```ts
subtreeOf(db: KeysDB, keyId: string): Promise<string[]>
```
**Parameters:**
- `db: KeysDB`
- `keyId: string`
**Returns:** `Promise<string[]>`

### `parentPathOf`
A parent's materialized path (for building a child's path). A parent with no row is a root → its bare id; a null
 parent (a session/account caller) → null (the child is a root).
```ts
parentPathOf(db: KeysDB, parentKeyId: string | null): Promise<string | null>
```
**Parameters:**
- `db: KeysDB`
- `parentKeyId: string | null`
**Returns:** `Promise<string | null>`

### `insertLineage`
Record a freshly-minted child (or root, when parentKeyId is null) in the lineage tree. Idempotent on the keyId PK.
```ts
insertLineage(db: KeysDB, opts: { keyId: string; parentKeyId: string | null; userId: string; parentPath: string | null }): Promise<void>
```
**Parameters:**
- `db: KeysDB`
- `opts: { keyId: string; parentKeyId: string | null; userId: string; parentPath: string | null }`
**Returns:** `Promise<void>`

### `chainHeadroom`
The chain's POOLED credit headroom — one grouped query over the TOPMOST capped node's subtree (joining the credit
ledger via the `credit_key` sidecar), then pooledHeadroom. This is where the abuse-proof cap becomes real: a
parent's cap bounds its whole subtree's spend. Null when no node in the chain declares a cap (uncapped).
```ts
chainHeadroom(db: KeysDB, chain: ChainNode[]): Promise<Headroom | null>
```
**Parameters:**
- `db: KeysDB`
- `chain: ChainNode[]`
**Returns:** `Promise<Headroom | null>`

### `revokeKeyTree`
Cascade-revoke a key's subtree: compute the api-key ids in `keyId`'s subtree (a keyed caller may revoke ONLY a STRICT
descendant of itself — not itself, an ancestor, or another branch) and soft-disable them via the injected `disableKeys`
(the app's apikey update — so @suluk/keys stays free of the Better Auth apikey table). MCP ids are skipped (a
connection is revoked elsewhere). Returns the count disabled.
```ts
revokeKeyTree(db: KeysDB, opts: { userId: string; keyId: string; callerKeyId?: string }, disableKeys: (userId: string, keyIds: string[]) => Promise<number>): Promise<{ revoked: number }>
```
**Parameters:**
- `db: KeysDB`
- `opts: { userId: string; keyId: string; callerKeyId?: string }`
- `disableKeys: (userId: string, keyIds: string[]) => Promise<number>`
**Returns:** `Promise<{ revoked: number }>`
