import { test, expect, describe } from "bun:test";
import { definePlatform, planPlatform, mergeProvision, generatePlatform, buildPackageJson, mergePackageJson, mergeWranglerToml, mergeGitignore } from "../src/index";
import type { InstanceSpec } from "@suluk/provision";

/** C051 — the platform generator: manifest → plan (adds + wired entry + merged provision), the provision merge, and the
 *  generate orchestration (with recorders). */
const manifest = definePlatform({ name: "autotoolfactory", registry: "acme/reg", services: ["auth", "credits", "keys", "billing", "logs"] });

// A mock registry so the generate-orchestration tests never touch the network (the fetcher's `fetch` is injectable).
// `app` is a registryDependency of every service — the fetcher must resolve + write it exactly ONCE.
const FAKE_REGISTRY = {
  items: [
    { name: "app", files: [{ path: "registry/foundation/app/app.ts", target: "src/app.ts" }] },
    { name: "auth", registryDependencies: ["acme/reg/app"], dependencies: ["@suluk/better-auth"], files: [{ path: "registry/services/auth/auth.ts", target: "src/auth.ts" }] },
    { name: "credits", registryDependencies: ["acme/reg/app"], files: [{ path: "registry/services/credits/credits.routes.ts", target: "src/routes/credits.ts" }] },
    { name: "keys", registryDependencies: ["acme/reg/app"], files: [{ path: "registry/services/keys/keys.routes.ts", target: "src/routes/keys.ts" }] },
    { name: "billing", registryDependencies: ["acme/reg/app"], files: [{ path: "registry/services/billing/billing.routes.ts", target: "src/routes/billing.ts" }] },
    { name: "logs", registryDependencies: ["acme/reg/app"], files: [{ path: "registry/services/logs/logs.routes.ts", target: "src/routes/logs.ts" }] },
  ],
};
const mockFetch = (async (url: string | URL) => {
  const u = String(url);
  if (u.endsWith("registry.json")) return new Response(JSON.stringify(FAKE_REGISTRY));
  return new Response("// fetched " + u.split("/main/")[1]);
}) as unknown as typeof fetch;

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
    // reference is the contract rendered as a page → apiDocument auto-injected (reference requires contract, never imports it).
    expect(p.entry).toContain('app.route("/api/reference", referenceRoutes({ "apiDocument": apiDocument }));');
    expect(p.entry).toContain('app.route("/api/admin", adminRoutes());');
    expect(p.provisionConfig).not.toContain("referenceProvision");
    expect(p.provisionConfig).not.toContain("adminProvision");
  });

  test("mcp is a middleware mount (server + discovery + connections) with a provision fragment", () => {
    const p = planPlatform(definePlatform({ name: "m", registry: "acme/reg", services: ["auth", "contract", "mcp", "credits"] }));
    expect(p.entry).toContain('import { mountMcp } from "./routes/mcp";');
    // mcp is the contract projected → the generator AUTO-INJECTS contract's apiDocument as a mount-opt (mcp never imports ../contract).
    expect(p.entry).toContain('mountMcp(app, { "apiDocument": apiDocument });');
    expect(p.entry).toContain('import { apiDocument } from "./contract";');
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
  test("writes the scaffold config FIRST, then FETCHES each module (no shadcn spawn), then the glue + ONE bun install", async () => {
    const ran: string[] = [];
    const wrote: string[] = [];
    const res = await generatePlatform(manifest, {
      run: async (cmd, args) => void ran.push(`${cmd} ${args.join(" ")}`),
      write: async (path) => void wrote.push(path),
      read: async () => null, // a fresh app — no existing config
      fetch: mockFetch,
    });
    expect(ran).toEqual(["bun install"]); // the ONLY subprocess — the package manager. No `bunx shadcn add`.
    // the SCAFFOLD CONFIG is written first (before any fetch); the glue (src/index.ts …) last. Local-dev is the default →
    // src/dev.ts + purge + the API deploy script are always emitted.
    expect(wrote.slice(0, 14)).toEqual(["package.json", "wrangler.toml", ".gitignore", "tsconfig.json", "components.json", ".env.example", "scripts/env-check.ts", "src/env.ts", "scripts/deploy.ts", "scripts/sync-secrets.ts", "scripts/link-key.ts", "scripts/provision.ts", "scripts/mint-tokens.ts", ".env.temp"]);
    // the FETCHED module files land between the config + the glue; `app` (a dep of every service) is written EXACTLY once.
    expect(wrote).toContain("src/app.ts");
    expect(wrote.filter((p) => p === "src/app.ts").length).toBe(1);
    expect(wrote).toContain("src/auth.ts");
    expect(wrote).toContain("src/routes/credits.ts");
    expect(wrote.indexOf("src/app.ts")).toBeGreaterThan(wrote.indexOf("src/env.ts")); // fetched AFTER config
    expect(wrote.indexOf("src/index.ts")).toBeGreaterThan(wrote.indexOf("src/app.ts")); // glue AFTER the fetch
    expect(res.added).toEqual(["app", "auth", "credits", "keys", "billing", "logs"]); // dep-first, deduped
  });

  test("leaves an existing tsconfig/components.json untouched; always (re)writes package.json/.gitignore/.env.example", async () => {
    const wrote: string[] = [];
    await generatePlatform(manifest, {
      run: async () => {},
      write: async (path) => void wrote.push(path),
      read: async (p) => (p === "package.json" ? '{"name":"x","dependencies":{"my-lib":"^1.0.0"}}' : "existing"),
      fetch: mockFetch,
    });
    expect(wrote).toContain("package.json"); // merged + rewritten
    expect(wrote).toContain(".gitignore"); // MERGED (never skip — must ensure .env is ignored)
    expect(wrote).toContain(".env.example"); // template — always current
    expect(wrote).toContain("scripts/env-check.ts");
    expect(wrote).not.toContain("tsconfig.json"); // present → left as-is
  });

  test("mergeGitignore appends missing entries (generic, non-encrypted baseline)", () => {
    const merged = mergeGitignore("node_modules/\n.env\n.env.temp\n", "node_modules\n");
    expect(merged).toContain(".env");
    expect(merged).toContain(".env.temp");
    expect(merged.match(/node_modules/g)?.length).toBe(1); // deduped (node_modules vs node_modules/)
  });

  test("mergeGitignore encrypted-env transition: REMOVES a plaintext-era `.env` ignore, keeps `.env.keys`", () => {
    // an app whose old .gitignore ignored `.env` (build #8) → regenerated with the encrypted baseline (ignores .env.keys).
    const merged = mergeGitignore("node_modules/\n.env.keys\n.env.temp\ndist/\n", "node_modules\n.env\n.env.temp\nmy-extra/\n");
    expect(merged.split("\n").map((l) => l.trim())).not.toContain(".env"); // .env un-ignored → committable (encrypted)
    expect(merged).toContain(".env.keys"); // the PRIVATE key stays ignored
    expect(merged).toContain("my-extra/"); // app entries preserved
  });
});

describe("env — secrets in .env (temp lifecycle), non-secrets in the manifest vars", () => {
  test(".env.example mirrors the POST-provisioning .env: public key + keepers + minted + runtime; NO ephemeral master, no non-secret config", () => {
    const p = planPlatform(definePlatform({ name: "e", registry: "acme/reg", services: ["auth", "billing", "webhooks", "email"] }));
    expect(p.envExample).toContain("SULUK_PUBLIC_KEY="); // the committed public key (plaintext)
    expect(p.envExample).toContain("CLOUDFLARE_ACCOUNT_ID="); // provisioning KEEPER (encrypted)
    expect(p.envExample).toContain("CLOUDFLARE_D1_TOKEN="); // minted scoped token (in .env after provisioning)
    expect(p.envExample).not.toContain("CLOUDFLARE_API_TOKEN="); // the EPHEMERAL master is DELETED → NOT a key in the end-state (the header just names it)
    expect(p.envExample.split("\n").some((l) => /^#?\s*CLOUDFLARE_API_TOKEN\s*=/.test(l))).toBe(false);
    expect(p.envExample).toContain("BETTER_AUTH_SECRET="); // required runtime secret, uncommented
    expect(p.envExample).toContain("STRIPE_SECRET_KEY=");
    expect(p.envExample).toContain("STRIPE_WEBHOOK_SECRET=");
    expect(p.envExample).toContain("# RESEND_API_KEY="); // optional runtime secret, commented
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
    expect(p.envCheck).toContain('["CLOUDFLARE_ACCOUNT_ID","BETTER_AUTH_SECRET","STRIPE_SECRET_KEY"]'); // required keepers (master EXCLUDED — it's ephemeral)
    expect(p.envCheck).not.toContain('"CLOUDFLARE_API_TOKEN"'); // the ephemeral master is not a required-in-.env keeper
    expect(p.envCheck).toContain("SULUK_PUBLIC_KEY"); // keypair check
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
    expect(p.syncSecrets).toContain("putSecrets"); // pushed over the CF REST API — NOT `wrangler secret put`
    expect(p.syncSecrets).not.toContain("Bun.spawn"); // no subprocess
    expect(p.syncSecrets).not.toContain("wrangler secret"); // no wrangler CLI
    // link-key registers the private key into the central ~/.suluk/settings.json store (the @suluk/env default).
    expect(p.linkKey).toContain(".suluk");
    expect(p.linkKey).toContain("settings.json");
    expect(p.linkKey).toContain("readPrivateKey");
    expect(JSON.parse(p.packageJson).scripts["link-key"]).toBe("bun run scripts/link-key.ts");
    expect(p.envScaffold).toContain("~/.suluk/settings.json");
    // the committed .env scaffold has NO real values (every non-empty line is a comment); package.json deps @suluk/env.
    expect(p.envScaffold.split("\n").filter((l) => l.trim()).every((l) => l.trim().startsWith("#"))).toBe(true);
    expect(JSON.parse(p.packageJson).dependencies["@suluk/env"]).toBe("latest");
    expect(JSON.parse(p.packageJson).scripts["sync-secrets"]).toBe("bun run scripts/sync-secrets.ts");
  });

  test("provisioning: CF creds declared (master ephemeral, scoped minted); .env.temp bootstrap; provision/mint scripts; key→Worker", () => {
    const p = planPlatform(definePlatform({ name: "e", registry: "acme/reg", services: ["auth", "billing", "admin"] }));
    // env.ts declares the full set: CF provisioning creds (surface local) + SUPERADMIN + runtime secrets (cloudflare).
    expect(p.envTs).toContain('CLOUDFLARE_API_TOKEN: { secret: true, required: true, surfaces: ["local"]');
    expect(p.envTs).toContain('CLOUDFLARE_D1_TOKEN: { secret: true, surfaces: ["local"]');
    expect(p.envTs).toContain("SUPERADMIN_EMAILS");
    expect(p.envTs).toContain('BETTER_AUTH_SECRET: { secret: true, required: true, surfaces: ["cloudflare"]');
    // .env.temp = the PLAINTEXT bootstrap (provisioning creds + operator-supplied runtime secrets).
    expect(p.envTemp).toContain("CLOUDFLARE_API_TOKEN=");
    expect(p.envTemp).toContain("STRIPE_SECRET_KEY="); // operator-supplied runtime secret
    // BETTER_AUTH_SECRET is AUTO-GENERATED — NOT a key the operator supplies in .env.temp.
    expect(p.envTemp.split("\n").some((l) => /^#?\s*BETTER_AUTH_SECRET\s*=/.test(l))).toBe(false);
    // provision.ts: consume .env.temp → auto-generate BETTER_AUTH_SECRET → provision → mint → encrypt → DELETE master → revoke.
    expect(p.provisionScript).toContain('GENERATED = ["BETTER_AUTH_SECRET"]');
    expect(p.provisionScript).toContain("randomBytes(32).toString");
    expect(p.provisionScript).toContain('EPHEMERAL = ["CLOUDFLARE_API_TOKEN"]');
    expect(p.provisionScript).toContain('rmSync(".env.temp"');
    expect(p.provisionScript).toContain('from "@suluk/provision"'); // IMPORTS runCli — no `bunx suluk-provision apply` spawn
    expect(p.provisionScript).toContain("runCli(provisionApp");
    expect(p.provisionScript).toContain("REVOKE the master CF token");
    // mint-tokens: scoped least-privilege tokens from the master.
    expect(p.mintTokens).toContain("CLOUDFLARE_D1_TOKEN");
    expect(p.mintTokens).toContain("permission_groups");
    // sync-secrets pushes the DECRYPTION key to the Worker (via putSecrets); .gitignore ignores .env.temp; scripts wired.
    expect(p.syncSecrets).toContain("SULUK_PRIVATE_KEY");
    expect(p.gitignore).toContain(".env.temp");
    const pkg = JSON.parse(p.packageJson);
    expect(pkg.scripts.provision).toBe("bun run scripts/provision.ts");
    expect(pkg.scripts["mint-tokens"]).toBe("bun run scripts/mint-tokens.ts");
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

  test("mergePackageJson keeps app-added deps + app-only scripts; baseline wins for framework deps + generator scripts", () => {
    const baseline = buildPackageJson("myapp", ["auth", "credits"]);
    const existing = JSON.stringify({ name: "myapp", dependencies: { "@suluk/credits": "^0.1.0", "my-product-lib": "^2.0.0" }, scripts: { deploy: "wrangler deploy", "my-lint": "eslint ." } });
    const merged = JSON.parse(mergePackageJson(baseline, existing));
    expect(merged.dependencies["my-product-lib"]).toBe("^2.0.0"); // app extra preserved
    expect(merged.dependencies["@suluk/credits"]).toBe("latest"); // baseline wins → stays up to date
    expect(merged.scripts["my-lint"]).toBe("eslint ."); // an APP-ONLY script survives
    expect(merged.scripts.deploy).toBe("bun run scripts/deploy.ts"); // a GENERATOR-owned script is (re)updated (a stale `wrangler deploy` is replaced)
    expect(merged.scripts.typecheck).toBe("tsc --noEmit -p ."); // framework script present
  });

  test("planPlatform emits tsconfig + components.json", () => {
    const plan = planPlatform(manifest);
    expect(JSON.parse(plan.tsconfig).exclude).toContain("src/**/*.test.ts");
    expect(JSON.parse(plan.componentsJson).aliases.utils).toBe("src/lib/utils");
  });
});

