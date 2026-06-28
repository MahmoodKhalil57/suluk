/**
 * @suluk/journeys/hatch — types for the ESCAPE HATCHES (C039).
 *
 * Composing BDD AS A REAL USER (through @suluk/sdk) is the default. A hatch is the deliberately-secondary, clearly-
 * marked escape for the cases a user-path cannot reach: AUTH bootstrap (OAuth — mint a session), an irreducible
 * precondition with no API, internal-state inspection a Then can't observe, and teardown.
 *
 * NO separate test infrastructure is provisioned. A hatch runs against one of two backends:
 *  - `local`  — bun:sqlite over the miniflare LOCAL D1 file (`wrangler dev` state): completely local, zero-cost,
 *               zero prod risk, full capability (it is a throwaway file).
 *  - `remote` — the REAL deployment over the CF REST API: highest fidelity, "use prod, the seeded entities ARE test
 *               users" (BDD-as-living-documentation). The write surface is SCOPED to a test user so it cannot touch
 *               real users — raw unscoped exec/delete is refused on remote.
 *
 * These types live OUTSIDE the deterministic core (bind.ts / vocabulary.ts): a hatch is runtime IO over live state,
 * never an input to the contract or the request→operation matcher (the C038 wall; enforced by hatch-wall.test.ts).
 */

/** The two backends a hatch can run against. */
export type HatchBackendKind = "local" | "remote";

/**
 * A TEST-USER SCOPE — the structural write-safety guarantee, just the seeded test user's id. Every scoped write FORCES
 * the row's owner column to this value (you cannot seed another user's row); every scoped delete is bounded to it. So a
 * hatch can never touch a real user's data — even on the production database. The auth hatch sets this.
 */
export interface TestUserScope {
  /** the seeded test user's id — the ONLY owner value any scoped write/delete may touch. */
  value: string;
}

/** A typed marker that a scenario stepped OUT of the user-path — surfaced in the gap report so hatch use is visible. */
export interface HatchUse {
  kind: "auth" | "state";
  /** the author's justification (why a user-path can't do this) — recorded; an empty `because` is a lint smell. */
  because: string;
  /** did the author confirm no user-path exists? false → the linter ▲-nudges back to the front door. */
  userPathChecked: boolean;
}

/** A seeded test user for the auth hatch. */
export interface TestUser {
  email: string;
  name?: string;
  /** provider id link for the OAuth account row (defaults to a synthetic test id). */
  providerAccountId?: string;
}

/** The low-level D1 access a backend provides (params ALWAYS bound — never string-interpolated). */
export interface D1Exec {
  readonly kind: HatchBackendKind;
  run(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
  close?(): void;
}

// ---- capability-by-type: read methods always present; WRITE methods exist only on a write-granted hatch ----

export interface D1Read {
  /** SELECT — values bound via params. Returns the rows of the last statement. */
  select(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
  /** the first row, or null. */
  get(sql: string, params?: unknown[]): Promise<Record<string, unknown> | null>;
}
export interface D1Write extends D1Read {
  /**
   * Seed rows the user-path genuinely cannot create. Each row's `ownerColumn` is FORCED to the test-user scope value,
   * so a seeded row can only ever belong to the test user. `why` is recorded (anti-rot audit trail).
   */
  seed(table: string, ownerColumn: string, rows: Record<string, unknown>[], why: HatchUse): Promise<void>;
  /** delete the test user's rows across the given `{ table, column }` targets (the scoped teardown). Requires a scope. */
  cleanupScope(targets: { table: string; column: string }[]): Promise<void>;
  /**
   * Raw SQL (full capability) — available ONLY on the LOCAL backend (a throwaway sqlite file). On the remote/real
   * deployment this THROWS: unscoped writes against live data are the wipe-real-users risk; use `seed`/`cleanupScope`.
   */
  exec(sql: string, params?: unknown[]): Promise<void>;
}

export interface StateHatchRead {
  kind: HatchBackendKind;
  d1: D1Read;
}
export interface StateHatchWrite {
  kind: HatchBackendKind;
  scope?: TestUserScope;
  d1: D1Write;
}
