/**
 * @suluk/journeys/hatch — the ESCAPE HATCHES (C039), a deliberately-secondary subpath. Importing it is the explicit,
 * visible act of stepping OUT of the user-path; a scenario that composes BDD as a real user imports NONE of this.
 *
 * No separate test infrastructure is provisioned. A hatch runs against one of two backends:
 *  - resolveBackend({ mode: "local", d1Path })            — bun:sqlite over the miniflare local D1 (completely local).
 *  - resolveBackend({ mode: "remote", cf, d1DatabaseId,   — the REAL deployment; seeded rows are TEST USERS, and the
 *                     acknowledgeRealDeployment: true })     write surface is test-user-scoped so it can't touch real ones.
 *
 *  - stateHatch  — typed D1 read (default) + scoped write (seed/cleanupScope; raw exec local-only).
 *  - signInAs    — the auth/OAuth hatch: mint via the app's OWN Better Auth, verified against the live API (fails
 *                  closed, never a false green).
 *
 * Runtime IO only — provably outside the deterministic core (bind.ts / vocabulary.ts), enforced by hatch-wall.test.ts.
 */
export { resolveBackend, localD1, remoteD1, type BackendSpec } from "./backends";
export { stateHatch, type StateHatchOptions } from "./state";
export { signInAs, type SignInAsOptions, type SignedInSession, type CleanupTarget } from "./auth";
export type { HatchBackendKind, TestUserScope, HatchUse, TestUser, D1Exec, D1Read, D1Write, StateHatchRead, StateHatchWrite } from "./types";
