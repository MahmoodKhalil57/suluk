import { test, expect, describe } from "bun:test";
import { planPlatform, definePlatform, defineSystem, defineBrand, defineService, authService, creditsService } from "../src/index";

/** C053 — regression tests for the 6 adversarial-review findings (byte-identity + fail-closed + typed + community-ready). */

describe("#1 — a {system,brand} with no registry FAILS CLOSED (like the legacy surface)", () => {
  test("definePlatform throws", () => {
    expect(() => definePlatform({ system: defineSystem({ services: [authService] }), brand: defineBrand({ name: "x" }) })).toThrow(/registry/);
  });
  test("liftSystemBrand backstop throws even if definePlatform is bypassed", () => {
    expect(() => planPlatform({ system: defineSystem({ services: [authService] }), brand: defineBrand({ name: "x" }) })).toThrow(/registry/);
  });
});

describe("#2 — a wrong-typed wire money param FAILS at generate time (never renders an invalid literal)", () => {
  test("amount: string throws", () => {
    expect(() =>
      planPlatform(
        definePlatform({
          system: defineSystem({ registry: "r", services: [authService, creditsService], wire: [{ from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: "50" } }] }),
          brand: defineBrand({ name: "x" }),
        }),
      ),
    ).toThrow(/must be a number/);
  });
  test("amount: number renders the literal", () => {
    const p = planPlatform(
      definePlatform({ system: defineSystem({ registry: "r", services: [authService, creditsService], wire: [{ from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 250 } }] }), brand: defineBrand({ name: "x" }) }),
    );
    expect(p.entry).toContain("s.grant(userId, 250,");
  });
});

describe("#3 — a string-referenced core service still gets TYPED serviceOpts (compile-time)", () => {
  test("string-id serviceOpts is typed by CoreServiceOptsMap", () => {
    const good = defineSystem({ registry: "r", services: ["auth", "credits"], serviceOpts: { auth: { mcp: { loginPage: "a", consentPage: "b", resource: "c", scopes: ["x"] } } } });
    expect(good.services.length).toBe(2);
    // @ts-expect-error — wrong type even via the STRING id "auth" (was `unknown` before the fix, silently accepted).
    defineSystem({ registry: "r", services: ["auth"], serviceOpts: { auth: { mcp: { loginPage: 123, consentPage: "", resource: "", scopes: [] } } } });
  });
});

describe("#4 — a wire import that collides with a base/mount symbol is REJECTED (no broken entry)", () => {
  test("a capability importing `createApp` from a different module throws", () => {
    const evilCredits = defineService({
      id: "credits", // reuse the core id → the inline fold replaces creditsService
      mount: creditsService.mount,
      compose: { offers: { pwn: { kind: "capability", symbol: "createApp", from: "./evil", imports: [{ symbol: "createApp", from: "./evil" }], build: () => "createApp()" } } },
    });
    expect(() =>
      planPlatform(definePlatform({ system: defineSystem({ registry: "r", services: [authService, evilCredits], wire: [{ from: "auth.onUserCreated", to: "credits.pwn" }] }), brand: defineBrand({ name: "x" }) })),
    ).toThrow(/collides/);
  });
});

describe("#5/#6 — an inline (community) Service contributes end-to-end + multi-registry adds", () => {
  const analytics = defineService({
    id: "analytics",
    registry: "acme/suluk-analytics",
    mount: { kind: "route", path: "/api/analytics", symbol: "analyticsRoutes", from: "./routes/analytics" },
    provision: { symbol: "analyticsProvision", from: "./src/provision/analytics" },
    deps: ["@acme/analytics"],
    env: [{ name: "ANALYTICS_KEY", secret: true, hint: "the analytics ingest key" }],
  });
  const plan = planPlatform(definePlatform({ system: defineSystem({ registry: "MahmoodKhalil57/suluk", services: [authService, creditsService, analytics] }), brand: defineBrand({ name: "app" }) }));

  test("it mounts, provisions, adds deps + env — not rejected by the unknown-service guard", () => {
    expect(plan.services).toContain("analytics");
    expect(plan.entry).toContain('import { analyticsRoutes } from "./routes/analytics";');
    expect(plan.entry).toContain('app.route("/api/analytics", analyticsRoutes());');
    expect(plan.provisionConfig).toContain("analyticsProvision");
    expect(plan.packageJson).toContain("@acme/analytics");
    expect(plan.envExample).toContain("ANALYTICS_KEY"); // secret → .env.example
  });
  test("multi-registry: the community service pulls from ITS registry, core from the system's", () => {
    expect(plan.adds).toContain("acme/suluk-analytics/analytics");
    expect(plan.adds).toContain("MahmoodKhalil57/suluk/auth");
    expect(plan.adds).toContain("MahmoodKhalil57/suluk/app");
  });
});
