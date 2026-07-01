/**
 * devLoginHandler (C057) — the LOCAL-DEV any-email login: the mock for Google OAuth when no `GOOGLE_CLIENT_ID` is set,
 * so you sign in as ANY email with no password. It mints a REAL Better Auth session via the PUBLIC server API
 * (`signUpEmail` idempotently, then `signInEmail({ asResponse: true })` with a fixed internal dev password) — it never
 * hand-forges a cookie or touches the internal adapter, so the session is exactly what a real login produces.
 *
 * The security control lives HERE (npm), so it flows to every consumer and an app can't weaken it by editing its wiring:
 * it is FAIL-CLOSED behind an `armed` flag the caller must pass `true`, checked FIRST — before any request input is read.
 * The registry wiring arms it only in dev-mock mode (non-production AND no Google key); a prod deploy (ENVIRONMENT=
 * "production") passes `armed: false`, so the endpoint returns 404 as if it did not exist. The fixed dev password is an
 * internal detail (never surfaced) used purely to drive the email/password flow; it is not a real credential.
 */

/** The Better Auth surface this needs — its public `signUpEmail`/`signInEmail` server endpoints. Duck-typed. */
export interface DevLoginAuthLike {
  api: {
    signUpEmail(input: { body: { email: string; password: string; name: string } }): Promise<unknown>;
    signInEmail(input: { body: { email: string; password: string }; asResponse: true }): Promise<Response>;
  };
}

export interface DevLoginOptions {
  /** FAIL-CLOSED gate — MUST be `true` to arm the endpoint. The registry passes its dev-mock condition; prod passes false. */
  armed: boolean;
  /** the Better Auth instance (its `api.signUpEmail`/`signInEmail`). */
  auth: DevLoginAuthLike;
  /** the incoming request — a JSON body `{ email }`. */
  request: Request;
  /** override the fixed internal dev password (dev only; never surfaced). */
  devPassword?: string;
}

/** The fixed internal password the dev-login uses to drive email/password sign-up + sign-in. Not a real credential. */
export const DEV_LOGIN_PASSWORD = "suluk-dev-login-fixed-pw-00000000";

const isEmail = (s: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const json = (obj: unknown, status: number): Response => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

/**
 * Handle `POST /api/auth/dev-login` with `{ email }`. FAIL-CLOSED: 404 unless `armed` (checked before reading input);
 * 400 for a missing/invalid email; else mint a real session for that email and return the sign-in Response (Set-Cookie).
 * Never throws on a hostile request.
 */
export async function devLoginHandler(opts: DevLoginOptions): Promise<Response> {
  // GATE first — before any client input is read — so a request to a non-armed deploy can never reach the mint path.
  if (opts.armed !== true) return new Response("not found", { status: 404 });

  let email = "";
  try { email = String(((await opts.request.json()) as { email?: unknown }).email ?? "").trim().toLowerCase(); } catch { email = ""; }
  if (!email || !isEmail(email)) return json({ error: "a valid `email` is required" }, 400);

  const password = opts.devPassword ?? DEV_LOGIN_PASSWORD;
  // find-or-create: sign up (idempotent — a re-login of an existing dev user throws "exists", which we ignore), then
  // sign in AS A RESPONSE so the session Set-Cookie rides back exactly as a real login would set it.
  try { await opts.auth.api.signUpEmail({ body: { email, password, name: email } }); } catch { /* user already exists */ }
  return opts.auth.api.signInEmail({ body: { email, password }, asResponse: true });
}
