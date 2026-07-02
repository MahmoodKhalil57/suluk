import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import {
  planPlatform, definePlatform, defineSystem, defineBrand,
  authService, contractService, mcpService, rateLimitService, rateCreditService, i18nService, creditsService, keysService,
  billingService, costService, erasureService, emailService, webhooksService, logsService, referenceService, adminService, journeysService, auditService,
} from "../src/index";
import type { WireDecl } from "../src/manifest";

/**
 * C053 module-decoupling — the WIRED behavioural lock (companion to the legacy byte-lock in golden.test.ts). The legacy
 * autotoolfactory manifest carries NO cross-module wires, so every module imports only `../app` + its own `@suluk/*`; the
 * links that USED to be sibling imports (contract→auth for the doc-merge, mcp→auth for OAuth discovery, erasure's central
 * table list) are now COMPOSITION EDGES the manifest declares. This suite proves the full-oneshot adoption renders those
 * edges into the mount-opts (never a sibling import), in leaf-first order, and that the GDPR fan-in guard goes silent when
 * every installed data module is wired — and, conversely, that a SUBSET prunes the edges it can't satisfy.
 */

// The autotoolfactory system WITH the decoupling wires adopted (the live ~/apps/autotoolfactory/platform.config.ts form).
const ALL = [authService, contractService, mcpService, rateLimitService, rateCreditService, i18nService, creditsService, keysService, billingService, costService, erasureService, emailService, webhooksService, logsService, referenceService, adminService, journeysService, auditService];
const DECOUPLING_WIRES: WireDecl[] = [
  { id: "signup-grant", from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 100 } },
  { id: "doc-auth-merge", from: "contract.authApi", to: "auth.provideAuthApi", optional: true },
  { id: "mcp-oauth", from: "mcp.mcpAuthInstance", to: "auth.mcpAuthInstance", optional: true },
  // leaf-first (logs/cost audit rows before the money rows) so a partial failure aborts before the load-bearing rows.
  { id: "erase-logs", from: "erasure.cascade", to: "logs.eraseStep", optional: true },
  { id: "erase-cost", from: "erasure.cascade", to: "cost.eraseStep", optional: true },
  { id: "erase-billing", from: "erasure.cascade", to: "billing.eraseStep", optional: true },
  { id: "erase-keys", from: "erasure.cascade", to: "keys.eraseStep", optional: true },
  { id: "erase-credits", from: "erasure.cascade", to: "credits.eraseStep", optional: true },
];
const wiredSystem = (services = ALL, wire = DECOUPLING_WIRES) => defineSystem({
  registry: "MahmoodKhalil57/suluk",
  services,
  globalServiceOpts: { ENVIRONMENT: "production" },
  serviceOpts: { auth: { mcpScopes: ["credits:read", "logs:read"] } },
  wire,
});
const brand = defineBrand({ name: "autotoolfactory", globalBrandOpts: { LIVE_BASE_URL: "autotoolfactory.example", LOCAL_BASE_URL: "localhost:8787", BRAND_NAME: "autotoolfactory" } });

// console.warn spy — the GDPR + prune diagnostics are console.warn, never emitted bytes.
let warnings: string[] = [];
let origWarn: typeof console.warn;
beforeEach(() => { warnings = []; origWarn = console.warn; console.warn = (...a: unknown[]) => { warnings.push(a.map(String).join(" ")); }; });
afterEach(() => { console.warn = origWarn; });

describe("wired adoption — the decoupling edges render into mount-opts (not sibling imports)", () => {
  test("contract's doc-merge + mcp's OAuth instance wire from auth (no ../auth import in either module)", () => {
    const e = planPlatform(definePlatform({ system: wiredSystem(), brand })).entry;
    expect(e).toContain('mountContract(app, { "authApi": (env) => createAuth(env).api })');
    // mcp's mount carries BOTH the auth OAuth instance (optional wire) AND contract's apiDocument (auto-injected structural wire).
    // The discovery instance passes auth's OWN mcp config so createAuth builds the mcp() plugin (else /.well-known/oauth-* 500).
    expect(e).toContain('"mcpAuthInstance": (env) => createAuth(env, { mcp: {');
    expect(e).toContain('"resource":"https://autotoolfactory.example/api/mcp"'); // ...the derived mcp resource, threaded in
    expect(e).toContain('"apiDocument": apiDocument })'); // + contract's apiDocument, same mount
    expect(e).toContain('import { createAuth } from "./auth"'); // the ONE createAuth import the composed capabilities share
  });

  test("mcp + reference receive contract's apiDocument via an AUTO-INJECTED mount-opt (neither imports ../contract)", () => {
    const e = planPlatform(definePlatform({ system: wiredSystem(), brand })).entry;
    // structural wire: contract.provideApiDocument → {mcp,reference}.apiDocument — no user `wire[]` entry needed.
    expect(e).toContain('"apiDocument": apiDocument');
    expect(e).toContain('referenceRoutes({ "apiDocument": apiDocument })');
    expect(e).toContain('import { apiDocument } from "./contract"'); // the entry (composition root) holds the ONE import
    // a minimal auth+contract+mcp subset with NO user wires still auto-injects apiDocument (mcp requires contract → co-present).
    const minSystem = defineSystem({ registry: "MahmoodKhalil57/suluk", services: [authService, contractService, mcpService], globalServiceOpts: { ENVIRONMENT: "production" } });
    const min = planPlatform(definePlatform({ system: minSystem, brand })).entry;
    expect(min).toContain('mountMcp(app, { "apiDocument": apiDocument })'); // ONLY apiDocument (no auth.mcp → no mcpAuthInstance)
  });

  test("erasure cascade is composed leaf-first from each data module's eraseStep (no central table list)", () => {
    const e = planPlatform(definePlatform({ system: wiredSystem(), brand })).entry;
    // the five DELETEs, in declaration order = leaf-first: logs → cost → billing → keys → credits.
    const order = ["activity_log", "cost_event", "billing_account", "key_lineage", "credit_transaction"];
    const idx = order.map((t) => e.indexOf(`deleteStep("${t}"`));
    expect(idx.every((i) => i > 0)).toBe(true);
    expect(idx).toEqual([...idx].sort((a, b) => a - b)); // strictly increasing = leaf-first preserved
    expect(e).toContain('erasureRoutes({ "extraSteps": (db) => [ deleteStep("activity_log"');
    expect(e).toContain('import { deleteStep } from "@suluk/better-auth"');
    expect(e).toContain('import { sql } from "drizzle-orm"');
  });

  test("GDPR fan-in guard is SILENT when every installed data module is wired into the cascade", () => {
    planPlatform(definePlatform({ system: wiredSystem(), brand }));
    expect(warnings.some((w) => w.includes("GDPR"))).toBe(false);
  });

  test("GDPR fan-in guard WARNS (names the module) when an installed data module is left unwired", () => {
    const missingCredits = DECOUPLING_WIRES.filter((w) => w.id !== "erase-credits");
    planPlatform(definePlatform({ system: wiredSystem(ALL, missingCredits), brand }));
    const gdpr = warnings.find((w) => w.includes("GDPR"));
    expect(gdpr).toBeDefined();
    expect(gdpr).toContain("credits");
    expect(gdpr).not.toContain("logs"); // logs stays wired → not named
  });
});

describe("subsetting — ONE full config is valid across subsets (optional edges prune, requires-guard enforces peers)", () => {
  test("a minimal auth+contract+credits subset prunes the erasure/mcp edges it can't satisfy + still wires the grant", () => {
    const subset = [authService, contractService, creditsService];
    const plan = planPlatform(definePlatform({ system: wiredSystem(subset), brand }));
    // the credits grant still composes (auth + credits both present)…
    expect(plan.entry).toContain("mountAuthRoutes(app,");
    // …but every erasure edge + the mcp OAuth edge prune (erasure/mcp/logs/cost/billing/keys absent), reported once each.
    const pruned = warnings.find((w) => w.includes("pruned"));
    expect(pruned).toBeDefined();
    expect(plan.entry).not.toContain("erasureRoutes");
    expect(plan.entry).not.toContain("mountMcp");
    // no data module is unwired-yet-installed here (erasure absent) → no GDPR warning.
    expect(warnings.some((w) => w.includes("GDPR"))).toBe(false);
  });

  test("the requires-guard throws when mcp is selected without its contract+auth peers", () => {
    expect(() => planPlatform(definePlatform({ system: wiredSystem([mcpService]), brand }))).toThrow(/requires "contract"|requires "auth"/);
  });

  test("the requires-guard throws when keys is selected without auth", () => {
    expect(() => planPlatform(definePlatform({ system: wiredSystem([contractService, keysService]), brand }))).toThrow(/service "keys" requires "auth"/);
  });

  test("a wire naming an unknown endpoint fails CLOSED even when marked optional (typo-guard, not a silent prune)", () => {
    const typo: WireDecl[] = [{ id: "typo", from: "erasure.cascade", to: "creditz.eraseStep", optional: true }];
    expect(() => planPlatform(definePlatform({ system: wiredSystem([authService, contractService, creditsService, erasureService], typo), brand }))).toThrow(/creditz/);
  });
});
