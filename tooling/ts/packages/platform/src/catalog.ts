/**
 * The catalog (C051) — the OSB "offerings": each service id → how to MOUNT its router into the Hono entry + where its
 * PROVISION fragment lives. This is the mapping the generator needs beyond `shadcn add` (which handles files/deps/order on
 * its own). Kept in sync with the registry's module set (C050). `app` is the base (no mount, no fragment).
 */

/** How a module contributes to the generated `src/index.ts`. */
export type Mount =
  | { kind: "base" } // the app skeleton — `createApp()`
  | { kind: "middleware"; symbol: string; from: string } // e.g. `mountAuthRoutes(app)`
  | { kind: "route"; path: string; symbol: string; from: string } // e.g. `app.route("/credits", creditsRoutes())`
  | { kind: "dev" }; // dev/CI tooling (journeys, audit) — files only, no runtime mount, no provision fragment

/** An env var a module needs at runtime — drives the generated `.env.example` + the env-check preflight. Bindings (D1/KV)
 *  are NOT here (they live in wrangler.toml); only string env vars. */
export interface EnvVar {
  name: string;
  /** the app WON'T work without it (the "minimum keys") — the env-check requires a non-empty value before it's happy. */
  required?: boolean;
  /** a credential (never commit) — shown commented in `.env.example` + flagged in the temp file. */
  secret?: boolean;
  /** a one-line hint shown as a comment in `.env.example`. */
  hint?: string;
}

export interface CatalogEntry {
  /** how it mounts into the entry. */
  mount: Mount;
  /** the provision fragment export, if any (`InstanceSpec[]`). */
  provision?: { symbol: string; from: string };
  /** the module's npm deps BEYOND the always-present base (see BASE_DEPS) — its @suluk/* logic packages + any extras
   *  (zod, better-auth). `shadcn add` also installs these; declaring them here lets the generator emit a complete,
   *  from-the-manifest package.json (so platform.config.ts is the only hand-authored surface). Kept in sync with the
   *  registry item's `dependencies`. */
  deps?: string[];
  /** the runtime env vars this module reads — the generator unions them into `.env.example` + the env-check preflight. */
  env?: EnvVar[];
}

export const CATALOG: Record<string, CatalogEntry> = {
  app: { mount: { kind: "base" }, env: [{ name: "TRUSTED_ORIGINS", hint: "comma-separated browser origins allowed on /api/* (CORS)" }] },
  auth: {
    mount: { kind: "middleware", symbol: "mountAuthRoutes", from: "./auth" },
    provision: { symbol: "authProvision", from: "./src/provision/auth" },
    deps: ["better-auth", "@better-auth/api-key", "@better-auth/passkey", "@suluk/better-auth"],
    env: [
      { name: "BETTER_AUTH_SECRET", required: true, secret: true, hint: "session-signing key — `openssl rand -base64 32`" },
      { name: "BETTER_AUTH_URL", hint: "your deployed origin, e.g. https://api.example.com" },
      { name: "GOOGLE_CLIENT_ID", secret: true, hint: "optional — enables Google sign-in" },
      { name: "GOOGLE_CLIENT_SECRET", secret: true, hint: "optional — pairs with GOOGLE_CLIENT_ID" },
    ],
  },
  // the contract is a MIDDLEWARE mount: it installs the scope gate (enforceApiKeyScope) + GET /api/openapi.json. Place it
  // after `auth` in the manifest so the gate runs after identity/apiKeyAuth set keyId/scopes. Derived + stateless.
  contract: { mount: { kind: "middleware", symbol: "mountContract", from: "./routes/contract" }, deps: ["@suluk/hono", "zod"] },
  // the API-as-MCP server + OAuth discovery + connections — a middleware mount (registers /api/mcp + /.well-known/*).
  mcp: { mount: { kind: "middleware", symbol: "mountMcp", from: "./routes/mcp" }, provision: { symbol: "mcpProvision", from: "./src/provision/mcp" }, deps: ["@suluk/mcp", "better-auth"] },
  // feature routes mount under /api/* — where the caller-resolution + cors + rate-limit middleware live (toolfactory parity).
  credits: { mount: { kind: "route", path: "/api/credits", symbol: "creditsRoutes", from: "./routes/credits" }, provision: { symbol: "creditsProvision", from: "./src/provision/credits" }, deps: ["@suluk/credits"] },
  keys: { mount: { kind: "route", path: "/api/keys", symbol: "keysRoutes", from: "./routes/keys" }, provision: { symbol: "keysProvision", from: "./src/provision/keys" }, deps: ["@suluk/keys"] },
  billing: {
    mount: { kind: "route", path: "/api/billing", symbol: "billingRoutes", from: "./routes/billing" },
    provision: { symbol: "billingProvision", from: "./src/provision/billing" },
    deps: ["@suluk/billing", "@suluk/payments", "@suluk/credits"],
    env: [
      { name: "STRIPE_SECRET_KEY", required: true, secret: true, hint: "your Stripe secret key" },
      { name: "STRIPE_PUBLISHABLE_KEY", hint: "returned by GET /api/billing/payment-config" },
    ],
  },
  cost: { mount: { kind: "route", path: "/api/cost", symbol: "costRoutes", from: "./routes/cost" }, provision: { symbol: "costProvision", from: "./src/provision/cost" }, deps: ["@suluk/cost"] },
  erasure: { mount: { kind: "route", path: "/api/erasure", symbol: "erasureRoutes", from: "./routes/erasure" }, provision: { symbol: "erasureProvision", from: "./src/provision/erasure" }, deps: ["@suluk/better-auth"] },
  email: {
    mount: { kind: "route", path: "/api/email", symbol: "emailRoutes", from: "./routes/email" }, // stateless binding — no provision fragment (C052)
    deps: ["@suluk/email"],
    env: [
      { name: "RESEND_API_KEY", secret: true, hint: "omit → the console provider (dev)" },
      { name: "EMAIL_FROM", hint: "the from-address" },
      { name: "BRAND_NAME", hint: "email template branding" },
      { name: "BASE_URL", hint: "email link base" },
      { name: "ENVIRONMENT", hint: '"production" → use Resend (else console)' },
    ],
  },
  webhooks: {
    mount: { kind: "route", path: "/api/webhooks", symbol: "webhooksRoutes", from: "./routes/webhooks" },
    provision: { symbol: "webhooksProvision", from: "./src/provision/webhooks" },
    deps: ["@suluk/payments"],
    env: [{ name: "STRIPE_WEBHOOK_SECRET", required: true, secret: true, hint: "verifies inbound Stripe events (POST /api/webhooks/stripe)" }],
  },
  // cross-cutting MIDDLEWARE (apply globally via app.use, emitted before any route) — not routed resources.
  "rate-limit": { mount: { kind: "middleware", symbol: "mountRateLimit", from: "./services/rate-limit" }, deps: ["@suluk/hono"] },
  "rate-credit": { mount: { kind: "middleware", symbol: "mountRateCredit", from: "./services/rate-credit" } }, // credit-backed free-tier bucket (KV binding); base deps cover it
  i18n: { mount: { kind: "middleware", symbol: "mountI18n", from: "./services/i18n" }, deps: ["@suluk/i18n"] },
  reference: { mount: { kind: "route", path: "/api/reference", symbol: "referenceRoutes", from: "./routes/reference" }, deps: ["@suluk/reference"] }, // derived doc render — no provision
  admin: { mount: { kind: "route", path: "/api/admin", symbol: "adminRoutes", from: "./routes/admin" }, deps: ["@suluk/credits"] }, // reads existing tables — no provision
  logs: { mount: { kind: "route", path: "/api/logs", symbol: "logsRoutes", from: "./routes/logs" }, provision: { symbol: "logsProvision", from: "./src/provision/logs" } },
  // dev/CI tooling — pulled in as files, no runtime mount, no provision fragment.
  journeys: { mount: { kind: "dev" }, deps: ["@suluk/journeys"] },
  audit: { mount: { kind: "dev" }, deps: ["@suluk/cockpit", "@suluk/harden"] },
};

/**
 * The always-present framework deps (every generated app: the Effect services + Hono entry + the merged provision.config
 * that imports mergeProvision from @suluk/platform + defineProvision from @suluk/provision). Union'd with each service's
 * `deps` to build package.json.
 */
export const BASE_DEPS = ["@suluk/platform", "@suluk/provision", "@suluk/core", "effect", "hono", "drizzle-orm"];

/** Pinned ranges for the NON-@suluk ecosystem deps — the single place they're kept current for every generated app.
 *  @suluk/* are NOT here: they resolve to "latest" so a package fix flows to the app via `bun update` (the C052 payoff). */
export const ECOSYSTEM_VERSIONS: Record<string, string> = {
  "better-auth": "^1.0.0",
  "@better-auth/api-key": "^1.0.0",
  "@better-auth/passkey": "^1.0.0",
  "drizzle-orm": "^0.45.2",
  effect: "^3.0.0",
  hono: "^4.0.0",
  zod: "^4.0.0",
};

/** The generated app's devDeps (the Workers + TS toolchain). */
export const DEV_DEPS: Record<string, string> = {
  "@cloudflare/workers-types": "^4.20260701.1",
  "@types/node": "^26.0.1",
  typescript: "^6.0.3",
  wrangler: "^4.0.0",
};

/** Resolve a dep to its version: an @suluk/* package → "latest" (fixes flow via `bun update`); a known ecosystem dep →
 *  its pinned range; anything else → "latest" (a best-effort default). */
export function resolveVersion(dep: string): string {
  if (dep.startsWith("@suluk/")) return "latest";
  return ECOSYSTEM_VERSIONS[dep] ?? "latest";
}

/** The env vars the selected services need, de-duped by name (first declaration wins). Split with `.secret` into the
 *  `.env` secrets (the .env.temp lifecycle) vs the non-secret CONFIG (defined in platform.config.ts `vars` → wrangler `[vars]`). */
export function collectEnv(services: string[]): EnvVar[] {
  const seen = new Set<string>();
  const out: EnvVar[] = [];
  for (const s of services) for (const e of CATALOG[s]?.env ?? []) if (!seen.has(e.name)) (seen.add(e.name), out.push(e));
  return out;
}

/** app + auth always come first (the base + the user/apikey tables others reference); the rest keep manifest order. */
export function orderServices(services: string[]): string[] {
  const want = new Set(services);
  const head = ["app", "auth"].filter((s) => want.has(s) || s === "app"); // app is always present
  const rest = services.filter((s) => !head.includes(s));
  return [...new Set([...head, ...rest])];
}
