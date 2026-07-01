/**
 * The catalog (C051) — the OSB "offerings": each service id → how to MOUNT its router into the Hono entry + where its
 * PROVISION fragment lives. This is the mapping the generator needs beyond `shadcn add` (which handles files/deps/order on
 * its own). Kept in sync with the registry's module set (C050). `app` is the base (no mount, no fragment).
 */

/** How a module contributes to the generated `src/index.ts`. */
export type Mount =
  | { kind: "base" } // the app skeleton — `createApp()`
  | { kind: "middleware"; symbol: string; from: string } // e.g. `mountAuthRoutes(app)`
  | { kind: "route"; path: string; symbol: string; from: string }; // e.g. `app.route("/credits", creditsRoutes())`

export interface CatalogEntry {
  /** how it mounts into the entry. */
  mount: Mount;
  /** the provision fragment export, if any (`InstanceSpec[]`). */
  provision?: { symbol: string; from: string };
}

export const CATALOG: Record<string, CatalogEntry> = {
  app: { mount: { kind: "base" } },
  auth: { mount: { kind: "middleware", symbol: "mountAuthRoutes", from: "./auth" }, provision: { symbol: "authProvision", from: "./provision/auth" } },
  credits: { mount: { kind: "route", path: "/credits", symbol: "creditsRoutes", from: "./routes/credits" }, provision: { symbol: "creditsProvision", from: "./provision/credits" } },
  keys: { mount: { kind: "route", path: "/keys", symbol: "keysRoutes", from: "./routes/keys" }, provision: { symbol: "keysProvision", from: "./provision/keys" } },
  billing: { mount: { kind: "route", path: "/billing", symbol: "billingRoutes", from: "./routes/billing" }, provision: { symbol: "billingProvision", from: "./provision/billing" } },
  logs: { mount: { kind: "route", path: "/logs", symbol: "logsRoutes", from: "./routes/logs" }, provision: { symbol: "logsProvision", from: "./provision/logs" } },
};

/** app + auth always come first (the base + the user/apikey tables others reference); the rest keep manifest order. */
export function orderServices(services: string[]): string[] {
  const want = new Set(services);
  const head = ["app", "auth"].filter((s) => want.has(s) || s === "app"); // app is always present
  const rest = services.filter((s) => !head.includes(s));
  return [...new Set([...head, ...rest])];
}
