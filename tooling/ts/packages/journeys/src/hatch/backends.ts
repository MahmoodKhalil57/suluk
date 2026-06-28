/**
 * The two D1 BACKENDS (C039) — no separate test infrastructure is ever provisioned.
 *
 *  - LOCAL  : bun:sqlite directly over the miniflare local D1 file (the `wrangler dev` state). Completely local,
 *             zero-cost, zero prod risk, param-bound, full capability (a throwaway sqlite file).
 *  - REMOTE : the REAL deployment over @suluk/cloudflare's CF REST `queryD1`. Highest fidelity; the seeded entities
 *             ARE test users (BDD-as-living-documentation). The write surface is SCOPED (see state.ts) so it cannot
 *             touch real users; reaching it requires an explicit `acknowledgeRealDeployment` — a conscious choice, not
 *             an accident.
 */
import { queryD1, d1Rows, type CloudflareClient } from "@suluk/cloudflare";
import type { D1Exec } from "./types";

/** A D1 backend over the miniflare LOCAL sqlite file (bun:sqlite). Pass ":memory:" for tests, or the `.wrangler` path. */
export async function localD1(d1Path: string): Promise<D1Exec> {
  const { Database } = await import("bun:sqlite"); // lazy: only loaded when running locally
  const db = new Database(d1Path);
  return {
    kind: "local",
    async run(sql, params) {
      return db.query(sql).all(...((params ?? []) as never[])) as Record<string, unknown>[];
    },
    close() {
      db.close();
    },
  };
}

/** A D1 backend over the REAL deployment's database via the CF REST /query endpoint (params bound). */
export function remoteD1(cf: CloudflareClient, databaseId: string): D1Exec {
  return {
    kind: "remote",
    async run(sql, params) {
      return d1Rows(await queryD1(cf, databaseId, sql, params));
    },
  };
}

export type BackendSpec =
  | { mode: "local"; d1Path: string }
  | { mode: "remote"; cf: CloudflareClient; d1DatabaseId: string; acknowledgeRealDeployment: true };

/**
 * Resolve a D1 backend. `local` needs nothing remote. `remote` runs against the REAL deployment and therefore requires
 * an explicit `acknowledgeRealDeployment: true` — the operator consciously accepting that seeded rows are test users on
 * the live database (the write surface is still test-user-scoped; see stateHatch). Fail-closed without it.
 */
export async function resolveBackend(spec: BackendSpec): Promise<D1Exec> {
  if (spec.mode === "local") return localD1(spec.d1Path);
  if (!spec.acknowledgeRealDeployment) {
    throw new Error(
      "@suluk/journeys/hatch: a remote hatch runs against the REAL deployment — pass acknowledgeRealDeployment:true to confirm the seeded rows are test users on live data. (Prefer mode:'local' for CI; the remote write surface is test-user-scoped regardless.)",
    );
  }
  return remoteD1(spec.cf, spec.d1DatabaseId);
}
