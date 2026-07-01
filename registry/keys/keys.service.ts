/**
 * The Keys service (Suluk registry: `keys`) — an Effect-TS service over `@suluk/keys` (the hierarchical-API-key algebra:
 * the abuse-proof pooled-headroom cap + the cascade revocation). The money/abuse-correctness logic stays in the package;
 * this is the owned wiring. Depends on `Db` (`app`) + a `DisableKeys` hook you provide from your auth layer (Better Auth's
 * apikey plugin). Key CREATION lives in `auth` (the apikey plugin) — this module manages the lineage + headroom + revoke.
 */
import { Context, Effect, Layer } from "effect";
import { subtreeOf, revokeKeyTree, chainHeadroom, effectiveCaps, clampChildGrant, insertLineage, parentPathOf, type ChainNode, type EffectiveCaps, type Headroom, type KeysDB } from "@suluk/keys";
import { Db } from "../app";

/** Disable keys in your apikey table (Better Auth's apikey plugin) — `revokeKeyTree` calls it. Provided from `auth`. */
export class DisableKeys extends Context.Tag("DisableKeys")<DisableKeys, (userId: string, keyIds: string[]) => Promise<number>>() {}

/**
 * MINT a real api key — provided from your auth layer (Better Auth's `auth.api.createApiKey`, which hashes + prefixes the
 * key). The `keys` module can't mint a valid Better-Auth key itself (that logic is the auth plugin's), so `provision`
 * injects this hook; the module owns only the HEADROOM CLAMP + the lineage record. Returns the new key id + the plaintext
 * key (shown once).
 */
export class CreateKey extends Context.Tag("CreateKey")<
  CreateKey,
  (input: { userId: string; caps: EffectiveCaps; parentKeyId?: string }) => Promise<{ keyId: string; key: string }>
>() {}

/** The caps a caller REQUESTS for a new child (clamped to the parent's before minting). */
export interface RequestedCaps {
  scopes: string[];
  creditLimit?: number | null;
  rateLimitSharePct?: number | null;
  expiresAt?: number | null;
}

export class Keys extends Context.Tag("Keys")<
  Keys,
  {
    /** the descendant key ids of `keyId` (its subtree). */
    readonly subtree: (keyId: string) => Effect.Effect<string[]>;
    /** cascade-revoke a key + its whole subtree (fail-closed; disables them via the injected hook). */
    readonly revokeTree: (userId: string, keyId: string, callerKeyId?: string) => Effect.Effect<{ revoked: number }>;
    /** the pooled subtree headroom for a pre-built chain — the abuse-proof cap (parent bounds parent+children total spend). */
    readonly headroom: (chain: ChainNode[]) => Effect.Effect<Headroom | null>;
    /** the effective caps down a chain (scope-intersection + cap-min + soonest-expiry). Pure. */
    readonly effectiveCaps: (chain: ChainNode[]) => EffectiveCaps;
    /**
     * MINT a delegated child key: clamp the requested caps to the parent's effective caps (abuse-proof — a child can never
     * exceed its parent), mint via the injected {@link CreateKey}, and record the lineage. Requires `CreateKey` in context.
     * For a root key (no `parentKeyId`) the request is granted as-is. `parentCaps` is the parent's already-resolved
     * effective caps (resolve them however your app stores caps on the apikey row).
     */
    readonly provision: (input: {
      userId: string;
      parentKeyId?: string;
      parentCaps?: EffectiveCaps;
      requested: RequestedCaps;
    }) => Effect.Effect<{ keyId: string; key: string; caps: EffectiveCaps }, never, CreateKey>;
  }
>() {}

export const KeysLive = Layer.effect(
  Keys,
  Effect.gen(function* () {
    const db = (yield* Db) as KeysDB;
    const disable = yield* DisableKeys;
    return {
      subtree: (keyId) => Effect.promise(() => subtreeOf(db, keyId)),
      revokeTree: (userId, keyId, callerKeyId) => Effect.promise(() => revokeKeyTree(db, { userId, keyId, callerKeyId }, disable)),
      headroom: (chain) => Effect.promise(() => chainHeadroom(db, chain)),
      effectiveCaps: (chain) => effectiveCaps(chain),
      provision: (input) =>
        Effect.gen(function* () {
          const createKey = yield* CreateKey; // required only when provision is called — the app wires it from auth
          // a delegated child is CLAMPED to its parent's caps (the abuse-proof rule); a root key gets what it asked for.
          const caps: EffectiveCaps =
            input.parentKeyId && input.parentCaps
              ? clampChildGrant(input.parentCaps, input.requested)
              : {
                  scopes: input.requested.scopes,
                  creditLimit: input.requested.creditLimit ?? null,
                  rateLimitSharePct: input.requested.rateLimitSharePct ?? null,
                  expiresAt: input.requested.expiresAt ?? null,
                };
          const { keyId, key } = yield* Effect.promise(() => createKey({ userId: input.userId, caps, parentKeyId: input.parentKeyId }));
          const parentPath = yield* Effect.promise(() => parentPathOf(db, input.parentKeyId ?? null));
          yield* Effect.promise(() => insertLineage(db, { keyId, parentKeyId: input.parentKeyId ?? null, userId: input.userId, parentPath }));
          return { keyId, key, caps };
        }),
    };
  }),
);
