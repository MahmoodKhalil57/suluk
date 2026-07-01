/**
 * The Keys service (Suluk registry: `keys`) — an Effect-TS service over `@suluk/keys` (the hierarchical-API-key algebra:
 * the abuse-proof pooled-headroom cap + the cascade revocation). The money/abuse-correctness logic stays in the package;
 * this is the owned wiring. Depends on `Db` (`app`) + a `DisableKeys` hook you provide from your auth layer (Better Auth's
 * apikey plugin). Key CREATION lives in `auth` (the apikey plugin) — this module manages the lineage + headroom + revoke.
 */
import { Context, Effect, Layer } from "effect";
import { subtreeOf, revokeKeyTree, chainHeadroom, effectiveCaps, type ChainNode, type EffectiveCaps, type Headroom, type KeysDB } from "@suluk/keys";
import { Db } from "../app";

/** Disable keys in your apikey table (Better Auth's apikey plugin) — `revokeKeyTree` calls it. Provided from `auth`. */
export class DisableKeys extends Context.Tag("DisableKeys")<DisableKeys, (userId: string, keyIds: string[]) => Promise<number>>() {}

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
    };
  }),
);
