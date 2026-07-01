[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/keys

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/keys</h1>

<p align="center"><b>The delegation-chain algebra for hierarchical API keys — a child can never out-scope or out-spend an ancestor, and a parent's cap bounds its whole subtree's total spend.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/keys
```

## What it does

When an API key can mint child keys — and each key carries its own scopes, credit cap, rate share,
and expiry — you need one place that decides what a caller may actually do. `@suluk/keys` is that
place: the **pure, portable algebra** (extracted verbatim from a real app, C046) for a materialized-
path key tree. The app builds a `ChainNode[]` (a caller plus its ancestors, root → self) and the
per-path `SpendRow[]` from its **own** store — the DB query is the seam — then calls these functions
so the money/abuse rules can never drift:

- **`effectiveCaps`** — the caller's real grant, walking up the chain: scopes = the **intersection**
  of every node's grant; credit cap / rate share / expiry = the **min** (soonest) declared. A child
  can't out-scope or out-spend an ancestor.
- **`pooledHeadroom`** — a node's cap bounds its **whole subtree's total spend**. This is the
  abuse-proof property: a parent capped at 50 can't mint children that each spend 50, because every
  child's spend lands in the parent's subtree.
- **`expiredAncestor` / `disabledAncestor`** — the read-time revocation cascade: a child dies the
  moment any ancestor expires or is disabled.
- **`clampChildGrant`** — clamp a freshly-minted child to the parent's effective grant.

Plus the materialized-path utilities (`inSubtree`, `childPath`, …) and the scope/metadata parsers.

## Usage

### The pure algebra (no DB)

```ts
import { effectiveCaps, pooledHeadroom, clampChildGrant, type ChainNode } from "@suluk/keys";

// A caller's chain: root → parent → self (each with its OWN grant).
const chain: ChainNode[] = [
  { keyId: "root", path: "root", scopes: ["credits:read", "ask"], ownCreditLimit: 100, ownRateSharePct: null, ownExpiresAt: null },
  { keyId: "child", path: "root/child", scopes: ["ask"], ownCreditLimit: 30, ownRateSharePct: null, ownExpiresAt: null },
];

const caps = effectiveCaps(chain);
caps.scopes;       // ["ask"]  — the intersection
caps.creditLimit;  // 30       — the min declared cap

// Pooled headroom: the BINDING constraint a charge must clear across the subtree.
const headroom = pooledHeadroom(chain, [{ path: "root/child", spent: 10 }]);
headroom; // { limit: 30, spent: 10, remaining: 20 } — or null when nothing is capped
```

### With the injected DB (lineage tree + pooled query)

```ts
import { insertLineage, chainHeadroom, subtreeOf, revokeKeyTree } from "@suluk/keys";

// Mint a child under a parent (materialized path is computed for you).
await insertLineage(db, { keyId: "child", parentKeyId: "root", userId: "user_42", parentPath: "root" });

// The pooled headroom, joined against the @suluk/credits ledger in one grouped query.
const room = await chainHeadroom(db, chain); // Headroom | null

// Cascade revoke — the whole subtree (self + every descendant).
await revokeKeyTree(db, "root");
```

## What's inside

| Export | What it does |
| --- | --- |
| `effectiveCaps(chain)` | The caller's real grant: scope ∩, cap/share/expiry min up the chain. |
| `pooledHeadroom(chain, spendRows)` | The binding subtree constraint → `Headroom` (`{ limit, spent, remaining }`), or null. |
| `topCappedPath(chain)` | The topmost capped node — whose subtree covers all others, so one query suffices. |
| `expiredAncestor` / `disabledAncestor` | The read-time expiry / revocation cascade. |
| `clampChildGrant(parent, requested)` | Clamp a minted child to the parent's effective grant. |
| `escapeLike` / `subtreeLikePattern` / `inSubtree` / `childPath` / `pathDepth` / `ancestorIdsOf` / `pathAt` / `MAX_KEY_DEPTH` | The materialized-path utilities. |
| `parseScopes` / `parseKeyMeta` | The scope + metadata model. |
| `keyLineage` / `keyLineage` DB ops (`subtreeOf`, `parentPathOf`, `insertLineage`, `chainHeadroom`, `revokeKeyTree`) | The lineage-tree schema + queries over an injected Drizzle handle. |

Types `ChainNode`, `EffectiveCaps`, `SpendRow`, `Headroom`, and `KeysDB` are exported alongside.

## Boundary

This package owns the **algebra + the table-owned queries**; the grant-fetch that builds a
`ChainNode[]` is app-specific (an `apikey` table vs an MCP-token table), so it stays in the app and
calls the pure functions. The pooled-headroom query is where `@suluk/keys` **joins**
[`@suluk/credits`](../credits/README.md) — the key tree meets the ledger. It also depends on
`@suluk/better-auth` + `drizzle-orm`.

## License

Apache-2.0

## Interfaces

- [ChainNode](interfaces/ChainNode.md)
- [EffectiveCaps](interfaces/EffectiveCaps.md)
- [Headroom](interfaces/Headroom.md)
- [SpendRow](interfaces/SpendRow.md)

## Type Aliases

- [KeysDB](type-aliases/KeysDB.md)

## Variables

- [keyLineage](variables/keyLineage.md)
- [MAX\_KEY\_DEPTH](variables/MAX_KEY_DEPTH.md)

## Functions

- [ancestorIdsOf](functions/ancestorIdsOf.md)
- [chainHeadroom](functions/chainHeadroom.md)
- [childPath](functions/childPath.md)
- [clampChildGrant](functions/clampChildGrant.md)
- [disabledAncestor](functions/disabledAncestor.md)
- [effectiveCaps](functions/effectiveCaps.md)
- [escapeLike](functions/escapeLike.md)
- [expiredAncestor](functions/expiredAncestor.md)
- [insertLineage](functions/insertLineage.md)
- [inSubtree](functions/inSubtree.md)
- [parentPathOf](functions/parentPathOf.md)
- [parseKeyMeta](functions/parseKeyMeta.md)
- [parseScopes](functions/parseScopes.md)
- [pathAt](functions/pathAt.md)
- [pathDepth](functions/pathDepth.md)
- [pooledHeadroom](functions/pooledHeadroom.md)
- [revokeKeyTree](functions/revokeKeyTree.md)
- [subtreeLikePattern](functions/subtreeLikePattern.md)
- [subtreeOf](functions/subtreeOf.md)
- [topCappedPath](functions/topCappedPath.md)
