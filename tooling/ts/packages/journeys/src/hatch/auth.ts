/**
 * The AUTH HATCH (C039) — "be a signed-in user" WITHOUT the OAuth dance, for auth that cannot be scripted as a user
 * (toolfactory is Google-OAuth-only). Works identically on a local or a real-deployment backend.
 *
 * Two safety properties make it fail-LOUD rather than manufacture a false green:
 *  1. It NEVER hand-forges a session row. The consumer supplies `mintSession` — Better Auth's OWN server-side session
 *     create (token hashing/signing, expiry, the OAuth account-link) — because only the app knows its session shape.
 *  2. It SELF-VERIFIES: after minting, it round-trips the cookie against ONE real authenticated endpoint and THROWS if
 *     the app does not accept it. A forged-but-invalid session fails the test loudly; it can never make a green.
 *
 * It writes only through a TEST-USER-SCOPED write hatch, so the seeded user + session belong to the test user alone —
 * safe even against the production database (the BDD-as-living-documentation model: the seeded entity IS a test user).
 */
import type { StateHatchWrite, TestUser } from "./types";

/** The tables/columns the teardown deletes the test user's rows from (app-specific; defaults to Better Auth's shape). */
export interface CleanupTarget {
  table: string;
  column: string;
}

export interface SignInAsOptions {
  /** a WRITE state hatch whose scope is THIS test user (provides the user row + scoped teardown). */
  state: StateHatchWrite;
  /** the test user to be signed in as. */
  user: TestUser;
  /**
   * INSERT-OR-GET the Better Auth `user` (and any required `account` link) row, returning the user id. The consumer
   * provides this because the exact Better Auth table/column shape is theirs (use state.d1.seed with the scope).
   */
  ensureUser: (state: StateHatchWrite, user: TestUser) => Promise<string>;
  /**
   * Mint a session via Better Auth's OWN API (e.g. `betterAuth({ database: drizzleAdapter(<D1>) })` + its session
   * create) and return the session cookie. NEVER hand-build the token. Required.
   */
  mintSession: (userId: string, user: TestUser) => Promise<{ cookie: string }>;
  /**
   * Probe ONE x-suluk-access:authenticated endpoint WITH the cookie through the real API and resolve true iff the app
   * ACCEPTS it (e.g. getSession returns a user / a 200, not 401). The hatch throws if false — fail-closed.
   */
  verify: (cookie: string) => Promise<boolean>;
  /** scoped teardown targets (default: Better Auth's `session.userId` + `user.id`). */
  cleanupTargets?: CleanupTarget[];
}

export interface SignedInSession {
  /** the session cookie to hand the @suluk/sdk client (the `token`/cookie seam in the generated runnable suite). */
  cookie: string;
  userId: string;
  /** delete the seeded session/user rows for THIS test user (scoped). Best-effort; pair with an external reaper. */
  teardown: () => Promise<void>;
}

/**
 * Sign in as a test user via the auth hatch, verifying the minted session against the live API before returning.
 * Throws (never returns a trusted-but-unverified credential) if the app rejects the minted session.
 */
export async function signInAs(opts: SignInAsOptions): Promise<SignedInSession> {
  const userId = await opts.ensureUser(opts.state, opts.user);
  const { cookie } = await opts.mintSession(userId, opts.user);

  const accepted = await opts.verify(cookie);
  if (!accepted) {
    throw new Error(
      "@suluk/journeys/hatch: the minted session was REJECTED by the live API (the auth hatch fails closed rather than manufacture a false green). Check the Better Auth session shape (cookie name/__Secure- prefix, token hashing, expiry, account-link).",
    );
  }

  const targets = opts.cleanupTargets ?? [{ table: "session", column: "userId" }, { table: "user", column: "id" }];
  return {
    cookie,
    userId,
    async teardown() {
      try {
        await opts.state.d1.cleanupScope(targets);
      } catch {
        /* best-effort; the external reaper sweep is the backstop */
      }
    },
  };
}
