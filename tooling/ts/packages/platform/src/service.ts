/**
 * The common Service interface (C053) — "define what each core service is" so community shadcn registries can extend the
 * platform with the SAME shape. A service = how it MOUNTS + its PROVISION fragment + npm DEPS + runtime ENV (all present
 * since C051), PLUS (C053) the typed opts surfaces and the COMPOSITION surface (ports it EXPOSES / capabilities it OFFERS).
 *
 * PHASE 1 (this file) lands the interface + the 19 core services expressed through it (`CORE_SERVICES`); `catalog.ts`
 * DERIVES the old `CATALOG` view from it (`toCatalogEntry`) so `planPlatform` is byte-for-byte unchanged. The typed opts
 * schemas (`serviceOpts`/`brandOpts`) and the composition ENGINE are declared here but not yet consumed — Phase 2 wires the
 * opts, Phase 3 the composition. Every phase runs against the Phase-0 golden lock.
 */

/** How a module contributes to the generated `src/index.ts`. (Unchanged from C051.) */
export type Mount =
  | { kind: "base" } // the app skeleton — `createApp()`
  | { kind: "middleware"; symbol: string; from: string } // e.g. `mountAuthRoutes(app)`
  | { kind: "route"; path: string; symbol: string; from: string } // e.g. `app.route("/api/credits", creditsRoutes())`
  | { kind: "dev" }; // dev/CI tooling (journeys, audit) — files only, no runtime mount, no provision fragment

/** An env var a module (or the app's provisioning) needs — drives the generated `env.ts`, `.env.example`, `.env.temp`, the
 *  env-check preflight, and the provision/sync-secrets scripts. */
export interface EnvVar {
  name: string;
  /** the app WON'T work without it (the "minimum keys") — the env-check requires a non-empty value before it's happy. */
  required?: boolean;
  /** a credential (encrypted at rest in the committed `.env`, or — if `provisioning` — staged plaintext in `.env.temp`). */
  secret?: boolean;
  /** a one-line hint shown as a comment. */
  hint?: string;
  /**
   * Where the value is USED. `"cloudflare"` = a Worker RUNTIME secret (pushed by `sync-secrets` / decrypted by `loadEnv`);
   * `"local"` = used only by provisioning/deploy on this machine, NEVER shipped to the Worker. Defaults: a `secret` → the
   * Worker runtime (`"cloudflare"`); a `provisioning`/`minted` cred → `"local"`.
   */
  surface?: "local" | "cloudflare";
  /**
   * An EPHEMERAL provisioning credential (e.g. the Cloudflare API master token): supplied PLAINTEXT in `.env.temp`, used to
   * provision infra + mint scoped tokens, then DELETED after provisioning — never committed (not even encrypted). Implies
   * `surface: "local"`.
   */
  provisioning?: boolean;
  /** a scoped least-privilege token MINTED during provisioning (from the master), then kept ENCRYPTED in `.env`. `surface: "local"`. */
  minted?: boolean;
  /** a random secret the provisioning flow AUTO-GENERATES (e.g. `BETTER_AUTH_SECRET` ← 32 random bytes) if not already set —
   *  so the operator never supplies it in `.env.temp`; it still lands ENCRYPTED in the committed `.env`. */
  generated?: boolean;
}

/** The old catalog record — now a DERIVED VIEW of a {@link Service} (see {@link toCatalogEntry}); kept so `planPlatform`
 *  and the C051 helpers read the same shape they always did. */
export interface CatalogEntry {
  mount: Mount;
  provision?: { symbol: string; from: string };
  /** the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`). */
  contract?: { symbol: string; from: string };
  deps?: string[];
  env?: EnvVar[];
}

/**
 * Standard-Schema v1 shape (zod v4 implements it). Declared LOCALLY so the Service interface can carry the typed-opts slots
 * with NO runtime validator dependency in Phase 1; Phase 2 replaces this with `@standard-schema/spec` and populates
 * `serviceOpts`/`brandOpts` with real zod schemas (zod as a peerDependency). `Out` carries the inferred value type.
 */
export interface Schema<Out = unknown> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (value: unknown) => { value: Out } | { issues: readonly unknown[] } | Promise<unknown>;
  };
}

/**
 * A typed PORT a service EXPOSES: a named hook others fill. `hookOptKey` is the mount-opt field a bound edge renders INTO
 * (e.g. auth's `onUserCreated`), so an edge never emits a separate post-route statement — it composes into the producer's
 * own mount call. `render` wraps the consumer expressions for this hook's real signature. (Consumed in Phase 3.)
 */
export interface Port<P = unknown> {
  readonly kind: "port";
  readonly param?: Schema<P>;
  readonly hookOptKey: string;
  readonly render: (consumerExprs: string[]) => string;
  /** documents a FAN-IN port (several capabilities aggregate into one hook, e.g. erasure's cascade). No engine branch —
   *  fan-in already works (the engine groups by port-owner + `render` takes the full `string[]`); this marks intent. */
  readonly fanIn?: boolean;
}

/**
 * A typed CAPABILITY a service OFFERS to fill a port. `build` produces the consumer EXPRESSION rendered into the producer's
 * hook closure — it may reference the closure's fixed params `userId` and `env` (the seam threads env), plus the symbols it
 * declares in `imports` (all TRUSTED — from the service definition, never manifest free text). `with` is the wire's
 * schema-validated params (JSON data only). (Consumed in Phase 3.)
 */
export interface Capability<A = unknown> {
  readonly kind: "capability";
  readonly param?: Schema<A>;
  readonly symbol: string; // exported name in the service's owned code (import-checked)
  readonly from: string;
  readonly imports?: { symbol: string; from: string }[]; // what the built expr references → unioned into the entry imports
  // `with` = the wire's schema-validated params; `opts` = the CAPABILITY-OWNER service's resolved serviceOpts (so a capability
  // can render its producer's own config into the closure — e.g. auth's mcpAuthInstance needs auth.mcp to enable the plugin).
  readonly build: (ctx: { with: Record<string, unknown>; opts?: Record<string, unknown> }) => string;
}

/** What a service brings to the composition graph: the ports it exposes + the capabilities it offers. */
export interface CompositionSurface {
  exposes?: Record<string, Port>;
  offers?: Record<string, Capability>;
}

/**
 * THE COMMON INTERFACE. `SO` = the service-opts value type, `BO` = the brand-opts value type (both Phase 2). A core service
 * and a community service instantiate the exact same shape via {@link defineService}.
 */
export interface Service<SO = {}, BO = {}> {
  readonly id: string; // "auth" | "acme.analytics"
  readonly registry?: string; // owning registry (multi-registry, Phase 4); default = the manifest's core alias
  readonly mount: Mount;
  readonly provision?: { symbol: string; from: string };
  /** the module's CONTRACT fragment — its `RouteContract[]` (ops), composed into `src/contract.ops.ts` (mirrors `provision`). */
  readonly contract?: { symbol: string; from: string };
  readonly deps?: string[];
  /** MOUNT peers this module needs at RUNTIME (distinct from npm `deps`): e.g. a route that reads `c.get("user")`/scopes
   *  set by `mountAuthRoutes` declares `requires: ["auth"]`. The generator ERRORS if a selected service's requires aren't
   *  also selected — turning a silently-unauthenticated subset into a build failure, without force-adding auth everywhere. */
  readonly requires?: string[];
  readonly env?: EnvVar[];
  readonly serviceOpts?: Schema<SO>; // how THIS service works       → the ENTRY (mount 2nd arg)      [Phase 2]
  readonly brandOpts?: Schema<BO>; // THIS service's brand-facing   → [vars]/env by default            [Phase 2]
  readonly reads?: { globalService?: string[]; globalBrand?: string[] }; // which globals it consumes  [Phase 2]
  readonly compose?: CompositionSurface; // ports it exposes + capabilities it offers                   [Phase 3]
}

/**
 * Author a service. `const S` PRESERVES the literal `id` + the precise `serviceOpts`/`brandOpts` marker types, so the
 * manifest (`defineSystem`) can key typed opts by service id off the imported service objects — no codegen. Validates the id.
 */
export function defineService<const S extends Service<any, any>>(s: S): S {
  if (!s.id) throw new Error("defineService: `id` is required");
  return s;
}

/**
 * The composition-EXPRESSION for a data module's GDPR erase-step: delete its user-keyed rows over the `db` the erasure
 * `cascade` port supplies (same raw-SQL shape the old central `sulukCascade` used — safe: the table name is a trusted
 * constant + `sql.identifier` quotes it). SINGLE-QUOTED so the inner `sql`/`${}` stay literal in the emitted expr. */
const eraseStepExpr = (table: string): string =>
  'deleteStep("' + table + '", async (u) => { await db.run(sql`DELETE FROM ${sql.identifier("' + table + '")} WHERE ${sql.identifier("userId")} = ${u.id}`); })';
/** the capability a data module OFFERS to erasure's `cascade` fan-in port. */
const eraseStepCapability = (table: string): Capability => ({
  kind: "capability", symbol: "deleteStep", from: "@suluk/better-auth",
  imports: [{ symbol: "deleteStep", from: "@suluk/better-auth" }, { symbol: "sql", from: "drizzle-orm" }],
  build: () => eraseStepExpr(table),
});

/**
 * A TYPED opts marker for a service's `serviceOpts`/`brandOpts`. Phase 2 uses it purely for TYPES — the manifest author
 * gets autocomplete + type-checking on that service's opts. It carries the value type `T` in the `Schema<T>` slot; Phase 3
 * swaps it for a runtime-validating zod schema of the SAME type (a drop-in — the field type is `Schema<T>` either way).
 */
export function optsType<T>(): Schema<T> {
  return { "~standard": { version: 1, vendor: "suluk", validate: (value) => ({ value: value as T }) } };
}

/** The MCP OAuth authorization-server config (auth's `serviceOpts.mcp`) — the frontend OAuth pages + resource + scope set. */
export interface McpOAuthOpts {
  loginPage: string;
  consentPage: string;
  resource: string;
  scopes: string[];
}
/** auth's serviceOpts: optionally activate the MCP OAuth server (Better Auth `mcp()` plugin). */
export interface AuthServiceOpts {
  /** C058: activate the MCP OAuth server by declaring its SCOPE SET — the loginPage/consentPage/resource URLs are DERIVED
   *  from `LIVE_BASE_URL` (no host boilerplate). This is the single-source authoring path. */
  mcpScopes?: string[];
  /** LEGACY: the full MCP OAuth URL block. Prefer `mcpScopes` (URLs derived). Kept for back-compat with hand-authored URLs. */
  mcp?: McpOAuthOpts;
}

/**
 * Core service id → its serviceOpts value type. Lets a STRING-referenced core service (e.g. `services: ["auth", …]`) get the
 * SAME typed serviceOpts as the imported-object form (`services: [authService, …]`), instead of collapsing to `unknown`.
 * Extend as core services gain typed opts.
 */
export interface CoreServiceOptsMap {
  auth: AuthServiceOpts;
}

/** Project a Service onto the legacy {@link CatalogEntry} shape the C051 generator reads. Field-for-field — so a derived
 *  CATALOG is behaviourally identical to the old hardcoded one (proven by the Phase-0 golden lock). */
export function toCatalogEntry(s: Service): CatalogEntry {
  return { mount: s.mount, provision: s.provision, contract: s.contract, deps: s.deps, env: s.env };
}

/**
 * The 19 CORE services, expressed through the common interface (the dogfood). Ported field-for-field from the C051 CATALOG;
 * `auth` and `credits` additionally declare their composition surface (the `auth.onUserCreated` port + the
 * `credits.grantOnSignup` capability) — inert until the Phase-3 engine consumes them, and the render/build templates are
 * PROVISIONAL (Phase 3 pins them against the real auth seam signature, see ADR C053 open question #1).
 */
// Each core service is exported as a NAMED, precisely-typed const so a `defineSystem` author can import it and get typed
// serviceOpts keyed by id. Ported field-for-field from the C051 CATALOG (byte-identity via the Phase-0 golden lock).

export const appService = defineService({
  id: "app",
  mount: { kind: "base" },
  env: [
    { name: "TRUSTED_ORIGINS", hint: "comma-separated browser origins allowed on /api/* (CORS)" },
    // ── Cloudflare provisioning creds (surface "local" — used to stand up + deploy the infra, NEVER shipped to the Worker) ──
    // The MASTER token is EPHEMERAL: supply it plaintext in .env.temp, it mints the scoped tokens below + provisions, then
    // it's DELETED (never committed). Routine deploy/migrate then use the minted least-privilege tokens.
    { name: "CLOUDFLARE_API_TOKEN", required: true, secret: true, provisioning: true, hint: "CF account-scoped master token (Workers Scripts + D1 + KV Edit) — mints the scoped tokens + provisions, then DELETED (never in git)" },
    { name: "CLOUDFLARE_ACCOUNT_ID", required: true, secret: true, surface: "local", hint: "CF account id — a KEEPER (routine scoped-token ops need it), kept encrypted in .env" },
    // Scoped least-privilege tokens minted from the master during provisioning; kept ENCRYPTED in .env for routine ops.
    { name: "CLOUDFLARE_D1_TOKEN", secret: true, minted: true, hint: "scoped: D1 Write (migrations)" },
    { name: "CLOUDFLARE_WORKERS_TOKEN", secret: true, minted: true, hint: "scoped: Workers Scripts Write (deploy + secret put)" },
    { name: "CLOUDFLARE_KV_TOKEN", secret: true, minted: true, hint: "scoped: KV Write (rate-limit / rate-credit namespaces)" },
  ],
});

export const authService = defineService({
  id: "auth",
  mount: { kind: "middleware", symbol: "mountAuthRoutes", from: "./auth" },
  provision: { symbol: "authProvision", from: "./src/provision/auth" },
  deps: ["better-auth", "@better-auth/api-key", "@better-auth/passkey", "@suluk/better-auth"],
  env: [
    { name: "BETTER_AUTH_SECRET", required: true, secret: true, generated: true, hint: "session-signing key — AUTO-GENERATED by `bun run provision` (32 random bytes); no need to supply it" },
    { name: "BETTER_AUTH_URL", hint: "your deployed origin, e.g. https://api.example.com" },
    { name: "GOOGLE_CLIENT_ID", secret: true, hint: "optional — enables Google sign-in" },
    { name: "GOOGLE_CLIENT_SECRET", secret: true, hint: "optional — pairs with GOOGLE_CLIENT_ID" },
  ],
  serviceOpts: optsType<AuthServiceOpts>(), // typed: `serviceOpts.auth.mcp` autocompletes + type-checks
  compose: {
    exposes: {
      // the signup hook. The seam is PINNED to (userId, env) — registry/services/auth/auth.ts widened to pass the Worker env into the
      // databaseHook callback (env is already in buildAuth's closure), so a consumer expr can build its Effect layers.
      onUserCreated: { kind: "port", hookOptKey: "onUserCreated", render: (exprs) => `async (userId, env) => { ${exprs.join("; ")}; }` },
    },
    offers: {
      // the Better-Auth API factory the contract's /api/openapi.json merge consumes (cuts contract → ../auth).
      provideAuthApi: { kind: "capability", symbol: "createAuth", from: "./auth", imports: [{ symbol: "createAuth", from: "./auth" }], build: () => `(env) => createAuth(env).api` },
      // the Better-Auth INSTANCE the mcp OAuth discovery consumes (cuts mcp → ../auth). The discovery docs
      // (/.well-known/oauth-*) come from Better Auth's mcp() plugin, which createAuth adds ONLY when passed `{ mcp }` — so the
      // discovery instance MUST carry auth's OWN mcp config, else getMcpOAuthConfig is undefined and the routes 500. The
      // mcp-oauth wire is injected only when `auth.mcp` is set (plan.ts), so opts.mcp is present whenever this renders.
      mcpAuthInstance: {
        kind: "capability", symbol: "createAuth", from: "./auth", imports: [{ symbol: "createAuth", from: "./auth" }],
        build: ({ opts }) => {
          const mcp = (opts as { mcp?: unknown } | undefined)?.mcp;
          return mcp ? `(env) => createAuth(env, { mcp: ${JSON.stringify(mcp)} })` : `(env) => createAuth(env)`;
        },
      },
    },
  },
});

export const contractService = defineService({ id: "contract", mount: { kind: "middleware", symbol: "mountContract", from: "./routes/contract" }, deps: ["@suluk/hono", "zod"],
  compose: {
    // EXPOSES the optional auth-doc-merge seam: auth wires its api in (single-value port); absent → the base doc (graceful).
    exposes: { authApi: { kind: "port", hookOptKey: "authApi", render: (e) => e[0] ?? "undefined" } },
    // OFFERS the v4 doc PROJECTOR: the `apiDocument` fn its projection modules (mcp/reference) consume — so THEY receive it
    // via a mount-opt instead of a `../contract` import. The generator auto-injects this structural edge (plan.ts); the
    // consumer calls it with its own arg (`apiDocument({scopes})` in mcp, `apiDocument()` in reference).
    offers: { provideApiDocument: { kind: "capability", symbol: "apiDocument", from: "./contract", imports: [{ symbol: "apiDocument", from: "./contract" }], build: () => "apiDocument" } },
  } });
export const mcpService = defineService({ id: "mcp", mount: { kind: "middleware", symbol: "mountMcp", from: "./routes/mcp" }, provision: { symbol: "mcpProvision", from: "./src/provision/mcp" }, contract: { symbol: "mcpOps", from: "./contract/mcp" }, deps: ["@suluk/mcp", "@suluk/better-auth", "better-auth"],
  requires: ["contract", "auth"], // mcp IS the contract doc projected + reads the auth-set principal — hard runtime peers
  // EXPOSES `mcpAuthInstance` (auth's OAuth instance, optional) + `apiDocument` (contract's projector, auto-injected — mcp is
  // the contract doc projected, so it never imports `../contract`; the wire feeds `apiDocument` in as a mount-opt).
  compose: { exposes: {
    mcpAuthInstance: { kind: "port", hookOptKey: "mcpAuthInstance", render: (e) => e[0] ?? "undefined" },
    apiDocument: { kind: "port", hookOptKey: "apiDocument", render: (e) => e[0] ?? "undefined" },
  } } });

export const creditsService = defineService({
  id: "credits",
  mount: { kind: "route", path: "/api/credits", symbol: "creditsRoutes", from: "./routes/credits" },
  provision: { symbol: "creditsProvision", from: "./src/provision/credits" },
  contract: { symbol: "creditsOps", from: "./contract/credits" },
  deps: ["@suluk/credits"],
  compose: {
    offers: {
      // grant N credits on signup, idempotent per user (the real Credits Effect service + grantOnce, over the request DB).
      // References the closure's `userId` + `env`; provides CreditsLive + DbLive(env) and runs the program.
      grantOnSignup: {
        kind: "capability",
        symbol: "Credits",
        from: "./services/credits",
        imports: [
          { symbol: "Effect", from: "effect" },
          { symbol: "Credits", from: "./services/credits" },
          { symbol: "CreditsLive", from: "./services/credits" },
          { symbol: "DbLive", from: "./app" },
        ],
        build: ({ with: w }) => {
          // fail LOUDLY at generate time on a wrong-typed money param — never render an invalid literal into the app.
          if (w.amount !== undefined && typeof w.amount !== "number") throw new Error(`credits.grantOnSignup: 'amount' must be a number (got ${typeof w.amount})`);
          const amount = (w.amount as number | undefined) ?? 100;
          return `await Effect.runPromise(Effect.flatMap(Credits, (s) => s.grant(userId, ${JSON.stringify(amount)}, "signup:" + userId, "signup grant")).pipe(Effect.provide(CreditsLive), Effect.provide(DbLive(env))))`;
        },
      },
      // GDPR: erase this module's user-keyed rows — composed into erasure's cascade fan-in (never a central table list).
      eraseStep: eraseStepCapability("credit_transaction"),
    },
  },
});

export const keysService = defineService({ id: "keys", mount: { kind: "route", path: "/api/keys", symbol: "keysRoutes", from: "./routes/keys" }, provision: { symbol: "keysProvision", from: "./src/provision/keys" }, contract: { symbol: "keysOps", from: "./contract/keys" }, deps: ["@suluk/keys"], requires: ["auth"],
  // keys is ALREADY import-decoupled (it mints via an injected CreateKey Effect layer, not a ../auth import). It only OFFERS
  // its GDPR erase-step; a future `createKey` port could wire auth's mint in (deferred — the caps→permissions map needs care).
  compose: { offers: { eraseStep: eraseStepCapability("key_lineage") } } });

export const billingService = defineService({
  id: "billing",
  mount: { kind: "route", path: "/api/billing", symbol: "billingRoutes", from: "./routes/billing" },
  provision: { symbol: "billingProvision", from: "./src/provision/billing" },
  contract: { symbol: "billingOps", from: "./contract/billing" },
  deps: ["@suluk/billing", "@suluk/payments", "@suluk/credits"],
  env: [
    { name: "STRIPE_SECRET_KEY", required: true, secret: true, hint: "your Stripe secret key" },
    { name: "STRIPE_PUBLISHABLE_KEY", hint: "returned by GET /api/billing/payment-config" },
  ],
  compose: { offers: { eraseStep: eraseStepCapability("billing_account") } },
});

export const costService = defineService({ id: "cost", mount: { kind: "route", path: "/api/cost", symbol: "costRoutes", from: "./routes/cost" }, provision: { symbol: "costProvision", from: "./src/provision/cost" }, contract: { symbol: "costOps", from: "./contract/cost" }, deps: ["@suluk/cost"], compose: { offers: { eraseStep: eraseStepCapability("cost_event") } } });
export const erasureService = defineService({ id: "erasure", mount: { kind: "route", path: "/api/erasure", symbol: "erasureRoutes", from: "./routes/erasure" }, provision: { symbol: "erasureProvision", from: "./src/provision/erasure" }, contract: { symbol: "erasureOps", from: "./contract/erasure" }, deps: ["@suluk/better-auth"],
  compose: { exposes: { cascade: { kind: "port", fanIn: true, hookOptKey: "extraSteps", render: (exprs) => `(db) => [ ${exprs.join(", ")} ]` } } } });

export const emailService = defineService({
  id: "email",
  mount: { kind: "route", path: "/api/email", symbol: "emailRoutes", from: "./routes/email" }, // stateless binding — no provision fragment (C052) // stateless binding — no provision fragment (C052)
  contract: { symbol: "emailOps", from: "./contract/email" },
  deps: ["@suluk/email"],
  env: [
    { name: "RESEND_API_KEY", secret: true, hint: "omit → the console provider (dev)" },
    { name: "EMAIL_FROM", hint: "the from-address" },
    { name: "BRAND_NAME", hint: "email template branding" },
    { name: "BASE_URL", hint: "email link base" },
    { name: "ENVIRONMENT", hint: '"production" → use Resend (else console)' },
  ],
});

export const webhooksService = defineService({
  id: "webhooks",
  mount: { kind: "route", path: "/api/webhooks", symbol: "webhooksRoutes", from: "./routes/webhooks" },
  provision: { symbol: "webhooksProvision", from: "./src/provision/webhooks" },
  contract: { symbol: "webhooksOps", from: "./contract/webhooks" },
  deps: ["@suluk/payments"],
  env: [{ name: "STRIPE_WEBHOOK_SECRET", required: true, secret: true, hint: "verifies inbound Stripe events (POST /api/webhooks/stripe)" }],
});

export const rateLimitService = defineService({ id: "rate-limit", mount: { kind: "middleware", symbol: "mountRateLimit", from: "./services/rate-limit" }, deps: ["@suluk/hono"] });
export const rateCreditService = defineService({ id: "rate-credit", mount: { kind: "middleware", symbol: "mountRateCredit", from: "./services/rate-credit" } }); // credit-backed free-tier bucket (KV binding)
export const i18nService = defineService({ id: "i18n", mount: { kind: "middleware", symbol: "mountI18n", from: "./services/i18n" }, deps: ["@suluk/i18n"] });
export const referenceService = defineService({ id: "reference", mount: { kind: "route", path: "/api/reference", symbol: "referenceRoutes", from: "./routes/reference" }, contract: { symbol: "referenceOps", from: "./contract/reference" }, deps: ["@suluk/scalar", "@suluk/cloudflare"], requires: ["contract"], // derived — no provision (renders via @suluk/scalar; @suluk/cloudflare weightTable() feeds Scalar LIVE infra weights)
  // EXPOSES `apiDocument` (contract's projector, auto-injected) — reference is the contract rendered as a page; it receives
  // `apiDocument` as a mount-opt rather than importing `../contract`.
  compose: { exposes: { apiDocument: { kind: "port", hookOptKey: "apiDocument", render: (e) => e[0] ?? "undefined" } } } });
export const adminService = defineService({ id: "admin", mount: { kind: "route", path: "/api/admin", symbol: "adminRoutes", from: "./routes/admin" }, contract: { symbol: "adminOps", from: "./contract/admin" }, deps: ["@suluk/credits"], env: [{ name: "SUPERADMIN_EMAILS", secret: true, hint: "comma/space-separated admin emails → the admin scope (secret-surfaced so they stay out of git plaintext)" }] }); // reads existing tables — no provision
export const logsService = defineService({ id: "logs", mount: { kind: "route", path: "/api/logs", symbol: "logsRoutes", from: "./routes/logs" }, provision: { symbol: "logsProvision", from: "./src/provision/logs" }, contract: { symbol: "logsOps", from: "./contract/logs" }, compose: { offers: { eraseStep: eraseStepCapability("activity_log") } } });
export const journeysService = defineService({ id: "journeys", mount: { kind: "dev" }, deps: ["@suluk/journeys"] });
export const auditService = defineService({ id: "audit", mount: { kind: "dev" }, deps: ["@suluk/cockpit", "@suluk/harden"] });

/** The 19 core services, in the C051 catalog order. */
const CORE_SERVICE_LIST: Service[] = [
  appService, authService, contractService, mcpService, creditsService, keysService, billingService, costService, erasureService, emailService,
  webhooksService, rateLimitService, rateCreditService, i18nService, referenceService, adminService, logsService, journeysService, auditService,
];

/** The core services keyed by id (key === `service.id`, guaranteed by construction). */
export const CORE_SERVICES: Record<string, Service> = Object.fromEntries(CORE_SERVICE_LIST.map((s) => [s.id, s]));
