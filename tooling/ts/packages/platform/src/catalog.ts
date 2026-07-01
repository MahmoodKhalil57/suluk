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

export interface CatalogEntry {
  /** how it mounts into the entry. */
  mount: Mount;
  /** the provision fragment export, if any (`InstanceSpec[]`). */
  provision?: { symbol: string; from: string };
}

export const CATALOG: Record<string, CatalogEntry> = {
  app: { mount: { kind: "base" } },
  auth: { mount: { kind: "middleware", symbol: "mountAuthRoutes", from: "./auth" }, provision: { symbol: "authProvision", from: "./src/provision/auth" } },
  // the contract is a MIDDLEWARE mount: it installs the scope gate (enforceApiKeyScope) + GET /api/openapi.json. Place it
  // after `auth` in the manifest so the gate runs after identity/apiKeyAuth set keyId/scopes. Derived + stateless.
  contract: { mount: { kind: "middleware", symbol: "mountContract", from: "./routes/contract" } },
  // feature routes mount under /api/* — where the caller-resolution + cors + rate-limit middleware live (toolfactory parity).
  credits: { mount: { kind: "route", path: "/api/credits", symbol: "creditsRoutes", from: "./routes/credits" }, provision: { symbol: "creditsProvision", from: "./src/provision/credits" } },
  keys: { mount: { kind: "route", path: "/api/keys", symbol: "keysRoutes", from: "./routes/keys" }, provision: { symbol: "keysProvision", from: "./src/provision/keys" } },
  billing: { mount: { kind: "route", path: "/api/billing", symbol: "billingRoutes", from: "./routes/billing" }, provision: { symbol: "billingProvision", from: "./src/provision/billing" } },
  cost: { mount: { kind: "route", path: "/api/cost", symbol: "costRoutes", from: "./routes/cost" }, provision: { symbol: "costProvision", from: "./src/provision/cost" } },
  erasure: { mount: { kind: "route", path: "/api/erasure", symbol: "erasureRoutes", from: "./routes/erasure" }, provision: { symbol: "erasureProvision", from: "./src/provision/erasure" } },
  email: { mount: { kind: "route", path: "/api/email", symbol: "emailRoutes", from: "./routes/email" } }, // stateless binding — no provision fragment (C052)
  webhooks: { mount: { kind: "route", path: "/api/webhooks", symbol: "webhooksRoutes", from: "./routes/webhooks" }, provision: { symbol: "webhooksProvision", from: "./src/provision/webhooks" } },
  // cross-cutting MIDDLEWARE (apply globally via app.use, emitted before any route) — not routed resources.
  "rate-limit": { mount: { kind: "middleware", symbol: "mountRateLimit", from: "./services/rate-limit" } },
  i18n: { mount: { kind: "middleware", symbol: "mountI18n", from: "./services/i18n" } },
  reference: { mount: { kind: "route", path: "/api/reference", symbol: "referenceRoutes", from: "./routes/reference" } }, // derived doc render — no provision
  admin: { mount: { kind: "route", path: "/api/admin", symbol: "adminRoutes", from: "./routes/admin" } }, // reads existing tables — no provision
  logs: { mount: { kind: "route", path: "/api/logs", symbol: "logsRoutes", from: "./routes/logs" }, provision: { symbol: "logsProvision", from: "./src/provision/logs" } },
  // dev/CI tooling — pulled in as files, no runtime mount, no provision fragment.
  journeys: { mount: { kind: "dev" } },
  audit: { mount: { kind: "dev" } },
};

/** app + auth always come first (the base + the user/apikey tables others reference); the rest keep manifest order. */
export function orderServices(services: string[]): string[] {
  const want = new Set(services);
  const head = ["app", "auth"].filter((s) => want.has(s) || s === "app"); // app is always present
  const rest = services.filter((s) => !head.includes(s));
  return [...new Set([...head, ...rest])];
}
