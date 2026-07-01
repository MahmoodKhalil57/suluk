import { test, expect, describe } from "bun:test";
import { definePlatform, planPlatform, mergeProvision, generatePlatform } from "../src/index";
import type { InstanceSpec } from "@suluk/provision";

/** C051 — the platform generator: manifest → plan (adds + wired entry + merged provision), the provision merge, and the
 *  generate orchestration (with recorders). */
const manifest = definePlatform({ name: "autotoolfactory", registry: "acme/reg", services: ["auth", "credits", "keys", "billing", "logs"] });

describe("planPlatform — manifest → shadcn adds + entry + provision.config", () => {
  const plan = planPlatform(manifest);

  test("orders app + auth first, then the rest; adds are registry refs", () => {
    expect(plan.services).toEqual(["app", "auth", "credits", "keys", "billing", "logs"]);
    expect(plan.adds).toEqual(["acme/reg/app", "acme/reg/auth", "acme/reg/credits", "acme/reg/keys", "acme/reg/billing", "acme/reg/logs"]);
  });

  test("the generated entry wires the base + auth middleware + each route", () => {
    expect(plan.entry).toContain('import { createApp } from "./app";');
    expect(plan.entry).toContain("const app = createApp();");
    expect(plan.entry).toContain('import { mountAuthRoutes } from "./auth";');
    expect(plan.entry).toContain("mountAuthRoutes(app);");
    expect(plan.entry).toContain('import { creditsRoutes } from "./routes/credits";');
    expect(plan.entry).toContain('app.route("/api/credits", creditsRoutes());');
    expect(plan.entry).toContain('app.route("/api/billing", billingRoutes());');
    expect(plan.entry).toContain("export default app;");
  });

  test("the generated provision.config imports each fragment + merges them", () => {
    expect(plan.provisionConfig).toContain('import { defineProvision } from "@suluk/provision";');
    expect(plan.provisionConfig).toContain('import { mergeProvision } from "@suluk/platform";');
    expect(plan.provisionConfig).toContain('import { authProvision } from "./src/provision/auth";');
    expect(plan.provisionConfig).toContain("mergeProvision([authProvision, creditsProvision, keysProvision, billingProvision, logsProvision])");
  });

  test("an unknown service throws", () => {
    expect(() => planPlatform({ name: "x", registry: "r", services: ["nope"] })).toThrow(/unknown service/);
  });
});

describe("cost (route + provision) + dev modules (journeys/audit — files only)", () => {
  const plan = planPlatform(definePlatform({ name: "full", registry: "acme/reg", services: ["auth", "credits", "cost", "logs", "journeys", "audit"] }));

  test("cost mounts a /cost route and contributes a provision fragment", () => {
    expect(plan.entry).toContain('import { costRoutes } from "./routes/cost";');
    expect(plan.entry).toContain('app.route("/api/cost", costRoutes());');
    expect(plan.provisionConfig).toContain('import { costProvision } from "./src/provision/cost";');
    expect(plan.provisionConfig).toContain("mergeProvision([authProvision, creditsProvision, costProvision, logsProvision])");
  });

  test("erasure mounts an /erasure route and contributes a provision fragment", () => {
    const p = planPlatform(definePlatform({ name: "e", registry: "acme/reg", services: ["auth", "erasure"] }));
    expect(p.entry).toContain('import { erasureRoutes } from "./routes/erasure";');
    expect(p.entry).toContain('app.route("/api/erasure", erasureRoutes());');
    expect(p.provisionConfig).toContain('import { erasureProvision } from "./src/provision/erasure";');
    expect(p.provisionConfig).toContain("mergeProvision([authProvision, erasureProvision])");
  });

  test("email mounts an /email route but contributes NO provision fragment (stateless binding)", () => {
    const p = planPlatform(definePlatform({ name: "m", registry: "acme/reg", services: ["auth", "email", "credits"] }));
    expect(p.entry).toContain('import { emailRoutes } from "./routes/email";');
    expect(p.entry).toContain('app.route("/api/email", emailRoutes());');
    // email has no provision fragment, so the merge is just auth + credits.
    expect(p.provisionConfig).not.toContain("emailProvision");
    expect(p.provisionConfig).toContain("mergeProvision([authProvision, creditsProvision])");
  });

  test("webhooks mounts a /webhooks route and contributes a provision fragment", () => {
    const p = planPlatform(definePlatform({ name: "w", registry: "acme/reg", services: ["auth", "webhooks"] }));
    expect(p.entry).toContain('import { webhooksRoutes } from "./routes/webhooks";');
    expect(p.entry).toContain('app.route("/api/webhooks", webhooksRoutes());');
    expect(p.provisionConfig).toContain("mergeProvision([authProvision, webhooksProvision])");
  });

  test("rate-limit + i18n are MIDDLEWARE mounts (app.use, no route, no provision) emitted BEFORE routes", () => {
    const p = planPlatform(definePlatform({ name: "mw", registry: "acme/reg", services: ["auth", "credits", "rate-limit", "i18n"] }));
    expect(p.entry).toContain("mountRateLimit(app);");
    expect(p.entry).toContain("mountI18n(app);");
    // no route, no provision for either.
    expect(p.entry).not.toContain('app.route("/rate-limit"');
    expect(p.provisionConfig).toContain("mergeProvision([authProvision, creditsProvision])");
    // two-pass ordering: every middleware mount precedes every route mount, so global middleware applies to all routes.
    const lastMw = Math.max(p.entry.indexOf("mountRateLimit(app);"), p.entry.indexOf("mountI18n(app);"), p.entry.indexOf("mountAuthRoutes(app);"));
    expect(lastMw).toBeLessThan(p.entry.indexOf('app.route("/api/credits"'));
  });

  test("contract mounts at /api (serving /api/openapi.json) with NO provision; feature routes are under /api/*", () => {
    const p = planPlatform(definePlatform({ name: "c", registry: "acme/reg", services: ["auth", "contract", "credits"] }));
    expect(p.entry).toContain('import { contractRoutes } from "./routes/contract";');
    expect(p.entry).toContain('app.route("/api", contractRoutes());');
    expect(p.entry).toContain('app.route("/api/credits", creditsRoutes());'); // toolfactory-parity /api/* prefix
    expect(p.provisionConfig).not.toContain("contractProvision");
  });

  test("dev modules add shadcn refs but NO entry mount and NO provision fragment", () => {
    expect(plan.adds).toContain("acme/reg/journeys");
    expect(plan.adds).toContain("acme/reg/audit");
    expect(plan.entry).not.toContain("journeys");
    expect(plan.entry).not.toContain("audit");
    expect(plan.provisionConfig).not.toContain("journeys");
    expect(plan.provisionConfig).not.toContain("audit");
  });
});

describe("mergeProvision — combine same-ref instances, union migrations in order", () => {
  test("two `db` fragments merge into one with both migrations (fragment order preserved)", () => {
    const auth: InstanceSpec[] = [{ ref: "db", service: "cloudflare-d1", name: "app-db", params: { migrations: [{ name: "0000_auth", sql: "A" }] }, bind: { database_id: "ID" }, protected: true }];
    const credits: InstanceSpec[] = [{ ref: "db", service: "cloudflare-d1", name: "app-db", params: { migrations: [{ name: "0001_credits", sql: "C" }] }, bind: { database_id: "ID" }, protected: true }];
    const merged = mergeProvision([auth, credits]);
    expect(merged.length).toBe(1);
    expect(merged[0].ref).toBe("db");
    expect((merged[0].params!.migrations as { name: string }[]).map((m) => m.name)).toEqual(["0000_auth", "0001_credits"]);
    expect(merged[0].protected).toBe(true);
  });

  test("distinct refs stay separate", () => {
    const a: InstanceSpec[] = [{ ref: "db", service: "cloudflare-d1", name: "db", params: {} }];
    const b: InstanceSpec[] = [{ ref: "kv", service: "cloudflare-kv", name: "cache", params: {} }];
    expect(mergeProvision([a, b]).map((i) => i.ref).sort()).toEqual(["db", "kv"]);
  });
});

describe("generatePlatform — the orchestration (with recorders)", () => {
  test("runs a shadcn add per service, then writes the entry + provision.config", async () => {
    const ran: string[] = [];
    const wrote: string[] = [];
    const res = await generatePlatform(manifest, {
      run: async (cmd, args) => void ran.push(`${cmd} ${args.join(" ")}`),
      write: async (path) => void wrote.push(path),
    });
    expect(ran).toEqual(plannedAdds()); // exactly the planned adds, in order
    expect(ran.length).toBe(6); // app+auth+credits+keys+billing+logs
    expect(wrote).toEqual(["src/index.ts", "provision.config.ts"]);
    expect(res.added.length).toBe(6);
  });
});

function plannedAdds() {
  return planPlatform(manifest).adds.map((a) => `bunx shadcn@latest add ${a} --yes`);
}
