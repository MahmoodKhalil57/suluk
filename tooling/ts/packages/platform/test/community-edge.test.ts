import { test, expect, describe } from "bun:test";
import { planPlatform, definePlatform, defineSystem, defineBrand, defineService, authService, creditsService, emailService } from "../src/index";

/**
 * C053 Phase 4 — the end-state: a COMMUNITY service (its own registry + npm dep) that PARTICIPATES in composition (offers a
 * capability filling a CORE port), fanning out alongside the core edge, in a SYSTEM that rebrands by swapping only the brand.
 */

// a community service from a third-party registry: it offers `identifyOnSignup`, which fills auth's onUserCreated port.
const analytics = defineService({
  id: "acme.analytics", // dotted community id (avoids shadowing a core id)
  registry: "acme/suluk-analytics",
  mount: { kind: "route", path: "/api/analytics", symbol: "analyticsRoutes", from: "./routes/analytics" },
  deps: ["@acme/analytics"],
  compose: {
    offers: {
      identifyOnSignup: {
        kind: "capability",
        symbol: "identify",
        from: "./routes/analytics",
        imports: [{ symbol: "identify", from: "./routes/analytics" }],
        build: ({ with: w }) => `await identify(userId, ${JSON.stringify(w.plan ?? "free")})`,
      },
    },
  },
});

const system = defineSystem({
  registry: "MahmoodKhalil57/suluk",
  services: [authService, creditsService, emailService, analytics],
  wire: [
    { id: "signup-grant", from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 100 } }, // CORE edge
    { id: "signup-identify", from: "auth.onUserCreated", to: "acme.analytics.identifyOnSignup", with: { plan: "starter" } }, // COMMUNITY edge (fan-out)
  ],
});
const brandA = defineBrand({ name: "acme-a", globalBrandOpts: { BRAND_NAME: "Acme A", EMAIL_FROM: "hi@a.example" } });
const brandB = defineBrand({ name: "acme-b", globalBrandOpts: { BRAND_NAME: "Acme B", EMAIL_FROM: "hi@b.example" } });

describe("a community capability fills a core port; fan-out composes core + community", () => {
  const p = planPlatform(definePlatform({ system, brand: brandA }));

  test("both edges render into the ONE auth.onUserCreated closure, in declaration order", () => {
    expect(p.entry).toContain('"onUserCreated": async (userId, env) => {');
    expect(p.entry).toContain("s.grant(userId, 100,"); // core
    expect(p.entry).toContain('await identify(userId, "starter")'); // community
    expect(p.entry.indexOf("s.grant")).toBeLessThan(p.entry.indexOf("identify(userId")); // core before community
  });
  test("the community capability's import is unioned in; its module pulls from ITS registry", () => {
    expect(p.entry).toContain('import { identify } from "./routes/analytics";');
    expect(p.adds).toContain("acme/suluk-analytics/acme.analytics");
    expect(p.adds).toContain("MahmoodKhalil57/suluk/auth");
    expect(p.packageJson).toContain("@acme/analytics");
  });
});

describe("rebrand — the SAME community system, a swapped brand", () => {
  const a = planPlatform(definePlatform({ system, brand: brandA }));
  const b = planPlatform(definePlatform({ system, brand: brandB }));

  test("entry code (incl. both edges) is byte-identical across brands", () => {
    expect(b.entry).toBe(a.entry);
    expect(b.provisionConfig).toBe(a.provisionConfig);
  });
  test("only [vars] differ", () => {
    expect(a.wranglerToml).toContain('BRAND_NAME = "Acme A"');
    expect(b.wranglerToml).toContain('BRAND_NAME = "Acme B"');
    expect(b.wranglerToml).not.toBe(a.wranglerToml);
  });
});
