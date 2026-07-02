import { test, expect, describe } from "bun:test";
import * as z from "zod";
import { zodToV4 } from "@suluk/zod";
import { cloudflare, providers, deployCloudflare, toCloudflarePlan, slug, DEFAULT_COMPAT_DATE, schemaToSql, type DeployEntity } from "../src/index";

describe("cloudflare executor — spec → @suluk/cloudflare DeployPlan mapping (pure, no network)", () => {
  test("toCloudflarePlan fills the Suluk defaults (compat date, nodejs_compat, observability) + passes bindings through", () => {
    const plan = toCloudflarePlan({
      scriptName: "app",
      module: "export default {};",
      d1: { binding: "DB", databaseName: "app-db" },
      kv: [{ binding: "RATE_LIMIT_KV", title: "app-ratelimit" }],
      vars: { BASE_URL: "https://app.example" },
      secrets: { BETTER_AUTH_SECRET: "s" },
    });
    expect(plan.compatibilityDate).toBe(DEFAULT_COMPAT_DATE);
    expect(plan.compatibilityFlags).toEqual(["nodejs_compat"]);
    expect(plan.observability).toBe(true);
    expect(plan.d1?.binding).toBe("DB");
    expect(plan.kv?.[0].title).toBe("app-ratelimit");
    expect(plan.vars).toEqual({ BASE_URL: "https://app.example" });
    expect(plan.secrets).toEqual({ BETTER_AUTH_SECRET: "s" });
  });

  test("caller-supplied compat/flags/observability win; nodejs_compat is present exactly once (de-duped)", () => {
    const plan = toCloudflarePlan({ scriptName: "app", module: "x", compatibilityDate: "2026-01-01", compatibilityFlags: ["nodejs_compat", "streams_enable_constructors"], observability: false });
    expect(plan.compatibilityDate).toBe("2026-01-01");
    expect(plan.compatibilityFlags).toEqual(["nodejs_compat", "streams_enable_constructors"]);
    expect(plan.observability).toBe(false);
  });

  test("the provider registry exposes the cloudflare executor (name + deploy + toPlan)", () => {
    expect(providers.cloudflare).toBe(cloudflare);
    expect(cloudflare.name).toBe("cloudflare");
    expect(typeof cloudflare.deploy).toBe("function");
    expect(cloudflare.toPlan({ scriptName: "app", module: "x" }).compatibilityFlags).toContain("nodejs_compat");
  });
});

describe("slug — Cloudflare resource name", () => {
  test("slugifies to [a-z0-9-]; empty → suluk-app", () => {
    expect(slug("My Petshop!")).toBe("my-petshop");
    expect(slug("  Café Déjà ")).toBe("caf-d-j"); // non-ascii collapse (safe charset only)
    expect(slug("")).toBe("suluk-app");
  });
});

describe("deployCloudflare — credential hygiene", () => {
  test("throws a clear error without an API token (no wrangler / ambient fallback)", async () => {
    await expect(deployCloudflare({ apiToken: "" }, { scriptName: "app", module: "export default {};" })).rejects.toThrow(/CLOUDFLARE_API_TOKEN/);
  });
});

describe("schemaToSql — D1 DDL from entities (unchanged helper)", () => {
  const entities: DeployEntity[] = [
    { name: "Pet", schema: zodToV4(z.object({ id: z.number().int().optional(), name: z.string(), status: z.enum(["available", "sold"]), price: z.number() })).schema },
    { name: "Category", schema: zodToV4(z.object({ id: z.number().int().optional(), name: z.string() })).schema },
  ];
  test("a CREATE TABLE per entity with a sane SQLite column mapping", () => {
    const sql = schemaToSql(entities);
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS pet");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS category");
    expect(sql).toContain("id INTEGER PRIMARY KEY AUTOINCREMENT");
    expect(sql).toContain("name TEXT NOT NULL"); // required string → TEXT NOT NULL
    expect(sql).toContain("price REAL"); // number → REAL
    expect(sql).toContain("status TEXT"); // enum → TEXT
  });
});
