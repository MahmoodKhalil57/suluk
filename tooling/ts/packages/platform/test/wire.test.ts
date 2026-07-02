import { test, expect, describe } from "bun:test";
import { planPlatform, definePlatform, defineSystem, defineBrand, resolveWiring, authService, creditsService, type Service } from "../src/index";

/** C053 Phase 3 — the port/capability composition engine + render-into-mount-opt. */

// synthetic services with mutual ports+caps, for the validation/cycle unit tests.
const mk = (id: string): Service => ({
  id,
  mount: { kind: "dev" },
  compose: {
    exposes: { p: { kind: "port", hookOptKey: `on_${id}`, render: (e) => `fn(${e.join("; ")})` } },
    offers: { c: { kind: "capability", symbol: `Cap_${id}`, from: `./${id}`, build: () => `${id}()` } },
  },
});

describe("resolveWiring — validation", () => {
  const cat = { a: mk("a"), b: mk("b") };

  test("throws when a NON-optional endpoint service is not selected", () => {
    expect(() => resolveWiring(["a"], [{ from: "a.p", to: "b.c" }], cat)).toThrow(/"b" not selected — mark \{ optional: true \}/);
  });
  test("PRUNES an optional edge when an endpoint is not selected (subset-robust); a typo throws even if optional", () => {
    const w = resolveWiring(["a"], [{ from: "a.p", to: "b.c", optional: true }], cat);
    expect(w.pruned).toEqual(['a.p → b.c ("b" not selected)']);
    expect(w.hooksByService).toEqual({}); // no mount-opt injected for the pruned edge
    expect(w.imports).toEqual([]); // no import injected for the pruned edge
    // typo-guard: an endpoint UNKNOWN to the catalog is a fat-finger — throw even with optional:true
    expect(() => resolveWiring(["a"], [{ from: "a.p", to: "zzz.c", optional: true }], cat)).toThrow(/unknown service "zzz" \(typo\?\)/);
  });
  test("throws when the port or capability does not exist", () => {
    expect(() => resolveWiring(["a", "b"], [{ from: "a.nope", to: "b.c" }], cat)).toThrow(/exposes no port "nope"/);
    expect(() => resolveWiring(["a", "b"], [{ from: "a.p", to: "b.nope" }], cat)).toThrow(/offers no capability "nope"/);
  });
  test("throws on a wiring cycle (a → b → a)", () => {
    expect(() => resolveWiring(["a", "b"], [{ from: "a.p", to: "b.c" }, { from: "b.p", to: "a.c" }], cat)).toThrow(/cycle/);
  });
  test("rejects a non-JSON (function) wire param — no code injection via `with`", () => {
    expect(() => resolveWiring(["a", "b"], [{ from: "a.p", to: "b.c", with: { f: () => 1 } }], cat)).toThrow(/must be JSON data/);
  });
  test("rejects an unsafe capability symbol (fail closed)", () => {
    const evil: Service = { id: "e", mount: { kind: "dev" }, compose: { offers: { c: { kind: "capability", symbol: "bad(); drop", from: "./e", build: () => "x" } } } };
    expect(() => resolveWiring(["a", "e"], [{ from: "a.p", to: "e.c" }], { a: mk("a"), e: evil })).toThrow(/unsafe capability symbol/);
  });

  test("fan-out — two wires on one port render in DECLARATION order", () => {
    const cat3 = { a: mk("a"), b: mk("b"), c: mk("c") };
    const w = resolveWiring(["a", "b", "c"], [{ from: "a.p", to: "b.c" }, { from: "a.p", to: "c.c" }], cat3);
    expect(w.hooksByService.a.on_a).toBe("fn(b(); c())"); // b() before c()
  });
});

describe("render-into-mount-opt — the auth.onUserCreated ← credits.grantOnSignup edge (real modules)", () => {
  const wired = planPlatform(
    definePlatform({
      system: defineSystem({
        registry: "acme/reg",
        services: [authService, creditsService],
        wire: [{ id: "signup-grant", from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 100 } }],
      }),
      brand: defineBrand({ name: "x" }),
    }),
  );

  test("the grant closure is injected INTO the auth mount opts (not a separate statement)", () => {
    expect(wired.entry).toContain('mountAuthRoutes(app, { "onUserCreated": async (userId, env) => {');
    expect(wired.entry).toContain('s.grant(userId, 100, "signup:" + userId, "signup grant")');
    expect(wired.entry).toContain("Effect.provide(CreditsLive), Effect.provide(DbLive(env))");
    // it is composed into the producer's mount call — there is NO post-route wire() statement.
    expect(wired.entry).not.toContain("wire(");
  });

  test("the consumed capability's imports are unioned into the entry", () => {
    expect(wired.entry).toContain('import { Effect } from "effect";');
    expect(wired.entry).toContain('import { Credits, CreditsLive } from "./services/credits";');
    expect(wired.entry).toContain('import { DbLive } from "./app";');
  });

  test("serviceOpts + a wire hook coexist in the same mount opts object", () => {
    const p = planPlatform(
      definePlatform({
        system: defineSystem({
          registry: "acme/reg",
          services: [authService, creditsService],
          serviceOpts: { auth: { mcp: { loginPage: "a", consentPage: "b", resource: "c", scopes: ["x"] } } },
          wire: [{ from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 250 } }],
        }),
        brand: defineBrand({ name: "y" }),
      }),
    );
    expect(p.entry).toContain('mountAuthRoutes(app, { "mcp": {"loginPage":"a","consentPage":"b","resource":"c","scopes":["x"]}, "onUserCreated":');
    expect(p.entry).toContain("s.grant(userId, 250,");
  });

  test("generatePlatform (the CLI path) renders the wire too — not just planPlatform", async () => {
    const written: Record<string, string> = {};
    const { generatePlatform } = await import("../src/generate");
    // a mock registry so the fetcher never touches the network (app is a shared dep of auth + credits).
    const REG = { items: [
      { name: "app", files: [{ path: "registry/foundation/app/app.ts", target: "src/app.ts" }] },
      { name: "auth", registryDependencies: ["acme/reg/app"], files: [{ path: "registry/services/auth/auth.ts", target: "src/auth.ts" }] },
      { name: "credits", registryDependencies: ["acme/reg/app"], files: [{ path: "registry/services/credits/credits.routes.ts", target: "src/routes/credits.ts" }] },
    ] };
    const mockFetch = (async (url: string | URL) => new Response(String(url).endsWith("registry.json") ? JSON.stringify(REG) : "// file")) as unknown as typeof fetch;
    await generatePlatform(
      definePlatform({ system: defineSystem({ registry: "acme/reg", services: [authService, creditsService], wire: [{ from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 100 } }] }), brand: defineBrand({ name: "g" }) }),
      { run: async () => {}, write: async (p, c) => void (written[p] = c), read: async () => null, fetch: mockFetch },
    );
    // regression: generatePlatform must pass the ORIGINAL platform to planPlatform (not a lowered manifest that drops wire).
    expect(written["src/index.ts"]).toContain('"onUserCreated": async (userId, env) => {');
    expect(written["src/index.ts"]).toContain("s.grant(userId, 100,");
  });

  test("NO wire → byte-identical legacy rendering (bare mount call, no hook object)", () => {
    const p = planPlatform(definePlatform({ system: defineSystem({ registry: "acme/reg", services: [authService, creditsService] }), brand: defineBrand({ name: "z" }) }));
    expect(p.entry).toContain("mountAuthRoutes(app);"); // exactly as today
    expect(p.entry).not.toContain("onUserCreated");
  });
});
