/** Shared cost helper for first-party modules — the five CRUD cost entries for an entity, so a fleshed-out
 *  module (many entities) still declares cost on every operation and grades A in the registry. */
import type { ModuleCost } from "../module";

// Each op also declares its INFRA COST MULTIPLIERS (the meters it actually consumes on Cloudflare) + a PAYMENT METHOD.
// The µ$ estimate is a coarse advisory; `infra` is the real multiplier weighed against the live pricing downstream. CRUD
// settles by `credit` (the token cost debits the user's credit) — the organic per-user tracking the cost calculator reads.
const rd = (n: number, rows: number): ModuleCost => ({
  components: [{ source: "db-read", basis: "per-call", microUsd: n }],
  estimateMicroUsd: n,
  infra: { "worker.request": 1, "d1.read": rows },
  settlement: { method: "credit" },
});
const wr = (n: number): ModuleCost => ({
  components: [{ source: "db-write", basis: "per-call", microUsd: n }],
  estimateMicroUsd: n,
  infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 },
  settlement: { method: "credit" },
});

/** CRUD cost for `entity` (PascalCase): list/get at the read tier, create/update/delete at the write tier. */
export function crudCost(entity: string, read = 10, write = 30): Record<string, ModuleCost> {
  return {
    [`list${entity}`]: rd(read, 20), // a page of rows
    [`get${entity}`]: rd(Math.round(read * 0.8), 1),
    [`create${entity}`]: wr(write),
    [`update${entity}`]: wr(write),
    [`delete${entity}`]: wr(Math.round(write * 0.67)),
  };
}
