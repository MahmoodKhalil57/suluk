import { test, expect, describe } from "bun:test";
import {
  planPlatform, definePlatform, defineSystem, defineBrand,
  authService, contractService, mcpService, rateLimitService, rateCreditService, i18nService, creditsService, keysService,
  billingService, costService, erasureService, emailService, webhooksService, logsService, referenceService, adminService, journeysService, auditService,
} from "../src/index";
import { AUTOTOOLFACTORY } from "./golden.test";

/**
 * C053 Phase 2 — the typed 2×2 node quadrants + defineSystem/defineBrand. The PROOF: a `{ system, brand }` platform
 * equivalent to the legacy autotoolfactory manifest lowers to BYTE-IDENTICAL output (so the golden lock covers it too), and
 * the SAME system rebranded swaps only `[vars]`. Plus a compile-time check that serviceOpts is typed by service id.
 */

// The autotoolfactory 18 services, split into a SYSTEM (behaviour) + a BRAND (identity) — the same product, factored.
const atfSystem = defineSystem({
  registry: "MahmoodKhalil57/suluk",
  services: [authService, contractService, mcpService, rateLimitService, rateCreditService, i18nService, creditsService, keysService, billingService, costService, erasureService, emailService, webhooksService, logsService, referenceService, adminService, journeysService, auditService],
  globalServiceOpts: { TRUSTED_ORIGINS: "https://autotoolfactory.example", ENVIRONMENT: "production" },
  serviceOpts: {
    auth: {
      mcp: {
        loginPage: "https://autotoolfactory.example/oauth/sign-in",
        consentPage: "https://autotoolfactory.example/oauth/consent",
        resource: "https://autotoolfactory.example/api/mcp",
        scopes: ["credits:read", "credits:write", "keys:read", "keys:write", "billing:read", "billing:write", "cost:read", "logs:read"],
      },
    },
  },
});
const atfBrand = defineBrand({
  name: "autotoolfactory",
  globalBrandOpts: {
    BASE_URL: "https://autotoolfactory.example",
    BETTER_AUTH_URL: "https://autotoolfactory.example",
    EMAIL_FROM: "noreply@autotoolfactory.example",
    BRAND_NAME: "autotoolfactory",
  },
});

describe("system/brand → byte-identical to the legacy manifest (the C053 parity proof)", () => {
  const legacy = planPlatform(AUTOTOOLFACTORY);
  const split = planPlatform(definePlatform({ system: atfSystem, brand: atfBrand }));

  for (const key of ["entry", "provisionConfig", "packageJson", "tsconfig", "componentsJson", "envExample", "wranglerToml", "gitignore", "envCheck"] as const) {
    test(`${key} is byte-identical between the split and legacy manifests`, () => {
      expect(split[key]).toBe(legacy[key]);
    });
  }
  test("the shadcn adds match exactly", () => {
    expect(split.adds).toEqual(legacy.adds);
  });
});

describe("rebrand — the SAME system, a swapped brand: identical entry CODE, different [vars]", () => {
  const system = defineSystem({
    registry: "acme/reg",
    services: [authService, creditsService, emailService],
    globalServiceOpts: { ENVIRONMENT: "production" },
  });
  const brandA = defineBrand({ name: "brand-a", globalBrandOpts: { BRAND_NAME: "Brand A", EMAIL_FROM: "hi@a.example", BASE_URL: "https://a.example" } });
  const brandB = defineBrand({ name: "brand-b", globalBrandOpts: { BRAND_NAME: "Brand B", EMAIL_FROM: "hi@b.example", BASE_URL: "https://b.example" } });

  const a = planPlatform(definePlatform({ system, brand: brandA }));
  const b = planPlatform(definePlatform({ system, brand: brandB }));

  test("entry code is byte-identical across brands (a system is brand-free)", () => {
    expect(b.entry).toBe(a.entry);
    expect(b.provisionConfig).toBe(a.provisionConfig);
  });
  test("[vars] differ per brand", () => {
    expect(a.wranglerToml).toContain('BRAND_NAME = "Brand A"');
    expect(b.wranglerToml).toContain('BRAND_NAME = "Brand B"');
    expect(a.wranglerToml).toContain('EMAIL_FROM = "hi@a.example"');
    expect(b.wranglerToml).toContain('EMAIL_FROM = "hi@b.example"');
    expect(b.wranglerToml).not.toBe(a.wranglerToml);
  });
});

describe("typed opts — serviceOpts is checked per service id (compile-time)", () => {
  test("a correct manifest type-checks; a wrong opt is a type error", () => {
    const good = defineSystem({
      registry: "r",
      services: [authService, creditsService],
      serviceOpts: { auth: { mcp: { loginPage: "a", consentPage: "b", resource: "c", scopes: ["x"] } } },
    });
    expect(good.services.length).toBe(2);

    // @ts-expect-error — `loginPag` is a typo; the typed serviceOpts rejects it (proves per-id typing is live).
    defineSystem({ registry: "r", services: [authService], serviceOpts: { auth: { mcp: { loginPag: "x", consentPage: "", resource: "", scopes: [] } } } });

    // @ts-expect-error — `nope` is not a selected service id.
    defineSystem({ registry: "r", services: [authService], serviceOpts: { nope: {} } });
  });
});
