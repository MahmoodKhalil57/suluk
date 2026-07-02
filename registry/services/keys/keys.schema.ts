/**
 * The key-lineage schema (Suluk registry: `keys`) — re-exported from `@suluk/keys`, which owns the delegation-tree table
 * (the materialized path that makes the pooled-headroom cap + cascade revoke work). The `apikey` table itself is Better
 * Auth's (created by its apikey plugin in `auth`); this is only the lineage that hangs off it.
 */
export { keyLineage } from "@suluk/keys";
