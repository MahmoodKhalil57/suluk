/**
 * The STATE HATCH (C039) over a D1 backend (local bun:sqlite OR the real deployment's CF REST). Capability-by-type:
 * the read hatch is the default; WRITE methods exist on the returned object ONLY when `{ write: true }` is requested.
 *
 * TEST-USER SCOPING is the write-safety guarantee (works identically on local and prod):
 *  - `seed(table, ownerColumn, rows)` FORCES `row[ownerColumn] = scope.value` — you cannot seed a row owned by anyone
 *    but the test user.
 *  - `cleanupScope(targets)` deletes ONLY rows whose owner column equals the test user id.
 *  - `exec(rawSql)` (full, unscoped capability) is available ONLY on the LOCAL backend (a throwaway sqlite file); on
 *    the real deployment it THROWS — unscoped writes to live data are exactly the wipe-real-users risk.
 * All values are bound params; table/column identifiers are validated.
 */
import type { D1Exec, D1Read, HatchUse, StateHatchRead, StateHatchWrite, TestUserScope } from "./types";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ident = (name: string, kind: string): string => {
  if (!IDENT.test(name)) throw new Error(`@suluk/journeys/hatch: unsafe ${kind} identifier ${JSON.stringify(name)} — only [A-Za-z0-9_] allowed (values go through bound params, identifiers cannot).`);
  return name;
};

function d1Read(d1: D1Exec): D1Read {
  return {
    select: (sql, params) => d1.run(sql, params),
    async get(sql, params) {
      return (await d1.run(sql, params))[0] ?? null;
    },
  };
}

export interface StateHatchOptions {
  /** grant write capability (seed/cleanup, + raw exec on local). Default: read-only. */
  write?: boolean;
  /** the test-user scope — REQUIRED for seed/cleanup. The auth hatch supplies it. */
  scope?: TestUserScope;
}

export function stateHatch(d1: D1Exec): StateHatchRead;
export function stateHatch(d1: D1Exec, opts: StateHatchOptions & { write: true }): StateHatchWrite;
export function stateHatch(d1: D1Exec, opts?: StateHatchOptions): StateHatchRead | StateHatchWrite {
  const read: StateHatchRead = { kind: d1.kind, d1: d1Read(d1) };
  if (!opts?.write) return read;

  const scope = opts.scope;
  const needScope = (): TestUserScope => {
    if (!scope) throw new Error("@suluk/journeys/hatch: a scoped write (seed/cleanupScope) requires a test-user scope (the seeded test user id) — so it can only ever touch that user's rows.");
    return scope;
  };

  return {
    kind: d1.kind,
    scope,
    d1: {
      ...read.d1,
      async seed(table, ownerColumn, rows, why: HatchUse) {
        if (!why?.because) throw new Error("@suluk/journeys/hatch: seed requires a `because` (why no user-path can do this) — recorded for the audit trail.");
        const s = needScope();
        const t = ident(table, "table");
        const oc = ident(ownerColumn, "owner column");
        for (const row of rows) {
          const stamped = { ...row, [oc]: s.value }; // FORCE ownership to the test user — cannot seed another user's row
          const cols = Object.keys(stamped).map((c) => ident(c, "column"));
          const ph = cols.map(() => "?").join(", ");
          await d1.run(`INSERT INTO ${t} (${cols.join(", ")}) VALUES (${ph})`, cols.map((c) => stamped[c]));
        }
      },
      async cleanupScope(targets) {
        const s = needScope();
        for (const { table, column } of targets) {
          await d1.run(`DELETE FROM ${ident(table, "table")} WHERE ${ident(column, "column")} = ?`, [s.value]);
        }
      },
      async exec(sql, params) {
        if (d1.kind === "remote") {
          throw new Error("@suluk/journeys/hatch: raw exec is refused on the REAL deployment (an unscoped write to live data) — use seed/cleanupScope (test-user-scoped), or run mode:'local'.");
        }
        await d1.run(sql, params);
      },
    },
  };
}
