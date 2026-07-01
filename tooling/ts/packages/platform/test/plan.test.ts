import { test, expect, describe } from "bun:test";
import { definePlatform, planPlatform, mergeProvision, generatePlatform, buildPackageJson, mergePackageJson, mergeWranglerToml, mergeGitignore } from "../src/index";
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
    expect(plan.entry).toContain("export default {"); // the fetch bootstrap (the @suluk/env loadEnv wrapper)
    expect(plan.entry).toContain("return app.fetch(request,");
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

  test("per-service opts are passed to the mount (e.g. auth mcp OAuth config)", () => {
    const p = planPlatform(definePlatform({ name: "o", registry: "acme/reg", services: ["auth", "credits"], opts: { auth: { mcp: { resource: "https://api.x", scopes: ["credits:read"] } } } }));
    expect(p.entry).toContain('mountAuthRoutes(app, {"mcp":{"resource":"https://api.x","scopes":["credits:read"]}});');
    // a service with no opts still gets the bare call.
    expect(p.entry).toContain('app.route("/api/credits", creditsRoutes());');
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

  test("contract is a MIDDLEWARE mount (scope gate + /api/openapi.json), emitted before routes; feature routes under /api/*", () => {
    const p = planPlatform(definePlatform({ name: "c", registry: "acme/reg", services: ["auth", "contract", "credits"] }));
    expect(p.entry).toContain('import { mountContract } from "./routes/contract";');
    expect(p.entry).toContain("mountContract(app);");
    expect(p.entry).toContain('app.route("/api/credits", creditsRoutes());'); // toolfactory-parity /api/* prefix
    // the gate (middleware) is emitted before any route.
    expect(p.entry.indexOf("mountContract(app);")).toBeLessThan(p.entry.indexOf('app.route("/api/credits"'));
    expect(p.provisionConfig).not.toContain("contractProvision");
  });

  test("reference + admin mount /api routes with NO provision (derived / reads existing tables)", () => {
    const p = planPlatform(definePlatform({ name: "ra", registry: "acme/reg", services: ["auth", "contract", "reference", "admin", "credits"] }));
    expect(p.entry).toContain('app.route("/api/reference", referenceRoutes());');
    expect(p.entry).toContain('app.route("/api/admin", adminRoutes());');
    expect(p.provisionConfig).not.toContain("referenceProvision");
    expect(p.provisionConfig).not.toContain("adminProvision");
  });

  test("mcp is a middleware mount (server + discovery + connections) with a provision fragment", () => {
    const p = planPlatform(definePlatform({ name: "m", registry: "acme/reg", services: ["auth", "contract", "mcp", "credits"] }));
    expect(p.entry).toContain('import { mountMcp } from "./routes/mcp";');
    expect(p.entry).toContain("mountMcp(app);");
    expect(p.entry).not.toContain('app.route("/api/mcp"'); // it's a mount, not a route
    expect(p.provisionConfig).toContain("mcpProvision");
  });

  test("rate-credit is a middleware mount (KV binding) with NO provision fragment", () => {
    const p = planPlatform(definePlatform({ name: "rc", registry: "acme/reg", services: ["auth", "rate-credit", "credits"] }));
    expect(p.entry).toContain("mountRateCredit(app);");
    expect(p.provisionConfig).not.toContain("rateCreditProvision");
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
  test("writes the scaffold config FIRST, then a shadcn add per service, then the glue", async () => {
    const ran: string[] = [];
    const wrote: string[] = [];
    const res = await generatePlatform(manifest, {
      run: async (cmd, args) => void ran.push(`${cmd} ${args.join(" ")}`),
      write: async (path) => void wrote.push(path),
      read: async () => null, // a fresh app — no existing config
    });
    expect(ran).toEqual(plannedAdds()); // exactly the planned adds, in order
    expect(ran.length).toBe(6); // app+auth+credits+keys+billing+logs
    // config is written BEFORE the shadcn adds; the glue after. env-example + env-check + wrangler + gitignore included.
    expect(wrote).toEqual(["package.json", "wrangler.toml", ".gitignore", "tsconfig.json", "components.json", ".env.example", "scripts/env-check.ts", "src/env.ts", "scripts/sync-secrets.ts", ".env", "src/index.ts", "provision.config.ts"]);
    expect(res.added.length).toBe(6);
  });

  test("leaves an existing tsconfig/components.json untouched; always (re)writes package.json/.gitignore/.env.example", async () => {
    const wrote: string[] = [];
    await generatePlatform(manifest, {
      run: async () => {},
      write: async (path) => void wrote.push(path),
      read: async (p) => (p === "package.json" ? '{"name":"x","dependencies":{"my-lib":"^1.0.0"}}' : "existing"),
    });
    expect(wrote).toContain("package.json"); // merged + rewritten
    expect(wrote).toContain(".gitignore"); // MERGED (never skip — must ensure .env is ignored)
    expect(wrote).toContain(".env.example"); // template — always current
    expect(wrote).toContain("scripts/env-check.ts");
    expect(wrote).not.toContain("tsconfig.json"); // present → left as-is
  });

  test("mergeGitignore appends missing entries so .env is always ignored", () => {
    const merged = mergeGitignore("node_modules/\n.env\n.env.temp\n", "node_modules\n");
    expect(merged).toContain(".env");
    expect(merged).toContain(".env.temp");
    expect(merged.match(/node_modules/g)?.length).toBe(1); // deduped (node_modules vs node_modules/)
  });
});

describe("env — secrets in .env (temp lifecycle), non-secrets in the manifest vars", () => {
  test(".env.example lists ONLY required + optional secrets, never non-secret config", () => {
    const p = planPlatform(definePlatform({ name: "e", registry: "acme/reg", services: ["auth", "billing", "webhooks", "email"] }));
    expect(p.envExample).toContain("BETTER_AUTH_SECRET="); // required secret, uncommented
    expect(p.envExample).toContain("STRIPE_SECRET_KEY=");
    expect(p.envExample).toContain("STRIPE_WEBHOOK_SECRET=");
    expect(p.envExample).toContain("# RESEND_API_KEY="); // optional secret, commented
    expect(p.envExample).not.toContain("BASE_URL"); // non-secret → the manifest vars, NOT .env
    expect(p.envExample).not.toContain("TRUSTED_ORIGINS");
  });

  test("wrangler.toml [vars] come from the manifest vars; unset non-secrets are commented; D1 binding present", () => {
    const p = planPlatform(definePlatform({ name: "myapp", registry: "acme/reg", services: ["auth", "email", "rate-credit"], vars: { BASE_URL: "https://x.dev", ENVIRONMENT: "production" } }));
    expect(p.wranglerToml).toContain('BASE_URL = "https://x.dev"'); // set in the manifest
    expect(p.wranglerToml).toContain('ENVIRONMENT = "production"');
    expect(p.wranglerToml).toContain("# EMAIL_FROM ="); // unset → commented
    expect(p.wranglerToml).toContain('binding = "DB"');
    expect(p.wranglerToml).toContain('binding = "RATE_CREDIT_KV"'); // rate-credit selected
    expect(p.wranglerToml).not.toContain("BETTER_AUTH_SECRET"); // secrets never in [vars]
  });

  test("the env-check script bakes in the required secrets + checks the encrypted model; merge preserves binding ids", () => {
    const p = planPlatform(definePlatform({ name: "e", registry: "acme/reg", services: ["auth", "billing"] }));
    expect(p.envCheck).toContain('["BETTER_AUTH_SECRET","STRIPE_SECRET_KEY"]');
    expect(p.envCheck).toContain("SULUK_PUBLIC_KEY"); // keypair check (not .env.temp anymore)
    expect(p.envCheck).toContain('startsWith("encrypted:")'); // flags plaintext secrets
    // wrangler merge keeps the operator's database_id across a regen
    const merged = mergeWranglerToml(p.wranglerToml, 'name="e"\n[[d1_databases]]\nbinding = "DB"\ndatabase_id = "abc-123"');
    expect(merged).toContain('database_id = "abc-123"');
  });

  test("env encryption: .gitignore commits .env (ignores .env.keys); env.ts declares secrets; sync-secrets + loadEnv both emitted", () => {
    const p = planPlatform(definePlatform({ name: "e", registry: "acme/reg", services: ["auth", "billing", "email"] }));
    // .env is COMMITTED (encrypted); the PRIVATE key is what's ignored.
    expect(p.gitignore).toContain(".env.keys");
    expect(p.gitignore.split("\n")).not.toContain(".env");
    // env.ts = the @suluk/env declare-once for the secrets (surfaced cloudflare).
    expect(p.envTs).toContain("import { defineEnv }");
    expect(p.envTs).toContain('BETTER_AUTH_SECRET: { secret: true, required: true, surfaces: ["cloudflare"]');
    // BOTH runtime paths: the entry's loadEnv bootstrap + the sync-secrets deploy script.
    expect(p.entry).toContain('import { loadEnv } from "@suluk/env";');
    expect(p.entry).toContain("privateKey: env.SULUK_PRIVATE_KEY");
    expect(p.syncSecrets).toContain('forSurface("cloudflare")');
    expect(p.syncSecrets).toContain("wrangler");
    // the committed .env scaffold has NO real values (every non-empty line is a comment); package.json deps @suluk/env.
    expect(p.envScaffold.split("\n").filter((l) => l.trim()).every((l) => l.trim().startsWith("#"))).toBe(true);
    expect(JSON.parse(p.packageJson).dependencies["@suluk/env"]).toBe("latest");
    expect(JSON.parse(p.packageJson).scripts["sync-secrets"]).toBe("bun run scripts/sync-secrets.ts");
  });
});

describe("package.json generation — the manifest is the only surface", () => {
  test("buildPackageJson unions base + service deps; @suluk/* → latest, ecosystem pinned", () => {
    const plan = planPlatform(definePlatform({ name: "myapp", registry: "acme/reg", services: ["auth", "credits", "billing"] }));
    const pkg = JSON.parse(plan.packageJson);
    expect(pkg.name).toBe("myapp");
    expect(pkg.dependencies["@suluk/credits"]).toBe("latest"); // fixes flow via bun update
    expect(pkg.dependencies["@suluk/billing"]).toBe("latest");
    expect(pkg.dependencies["hono"]).toBe("^4.0.0"); // ecosystem pinned
    expect(pkg.dependencies["better-auth"]).toBe("^1.0.0"); // auth's dep
    expect(pkg.devDependencies["typescript"]).toBeDefined();
    expect(pkg.scripts.generate).toBe("suluk-platform");
  });

  test("mergePackageJson keeps app-added deps + scripts, baseline wins for framework deps", () => {
    const baseline = buildPackageJson("myapp", ["auth", "credits"]);
    const existing = JSON.stringify({ name: "myapp", dependencies: { "@suluk/credits": "^0.1.0", "my-product-lib": "^2.0.0" }, scripts: { deploy: "wrangler deploy" } });
    const merged = JSON.parse(mergePackageJson(baseline, existing));
    expect(merged.dependencies["my-product-lib"]).toBe("^2.0.0"); // app extra preserved
    expect(merged.dependencies["@suluk/credits"]).toBe("latest"); // baseline wins → stays up to date
    expect(merged.scripts.deploy).toBe("wrangler deploy"); // app script preserved
    expect(merged.scripts.typecheck).toBe("tsc --noEmit -p ."); // framework script filled in
  });

  test("planPlatform emits tsconfig + components.json", () => {
    const plan = planPlatform(manifest);
    expect(JSON.parse(plan.tsconfig).exclude).toContain("src/**/*.test.ts");
    expect(JSON.parse(plan.componentsJson).aliases.utils).toBe("src/lib/utils");
  });
});

function plannedAdds() {
  return planPlatform(manifest).adds.map((a) => `bunx shadcn@latest add ${a} --yes`);
}
