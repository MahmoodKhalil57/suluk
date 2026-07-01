/**
 * The plan (C051) — PURE: a manifest → the shadcn-add list + the generated `src/index.ts` (the wired Hono entry) + the
 * generated `provision.config.ts` (importing + merging the fragments). No I/O; `generate` executes this. Testable to the
 * character.
 */
import { type PlatformManifest, type Platform, isPlatform } from "./manifest";
import { liftSystemBrand } from "./resolve";
import { resolveWiring, groupImports, type Wiring } from "./wire";
import { CATALOG, CORE_SERVICES, orderServices, collectEnv, BASE_DEPS, DEV_DEPS, resolveVersion, type EnvVar, type Service } from "./catalog";

export interface PlatformPlan {
  services: string[];
  /** shadcn refs to add, in order (e.g. "MahmoodKhalil57/suluk/credits"). */
  adds: string[];
  /** the generated `src/index.ts` content. */
  entry: string;
  /** the generated `provision.config.ts` content. */
  provisionConfig: string;
  /** the generated `package.json` content (the FRAMEWORK baseline — `generate` merges it with any existing so app-added
   *  deps/scripts survive). @suluk/* on "latest" so fixes flow via `bun update`; ecosystem deps on pinned ranges. */
  packageJson: string;
  /** the generated `tsconfig.json` content (the Workers + TS config; test files excluded from the build). */
  tsconfig: string;
  /** the generated `components.json` content (so `shadcn add` resolves the file targets). */
  componentsJson: string;
  /** the generated `.env.example` — the SECRET keys the selected services need (non-secrets live in the manifest `vars`). */
  envExample: string;
  /** the generated `wrangler.toml` — `[vars]` from the manifest's non-secret config + the D1/KV binding placeholders. */
  wranglerToml: string;
  /** the generated `.gitignore` — ignores `.env.keys` (the private key) + `.env.temp`, but NOT `.env` (committed ENCRYPTED). */
  gitignore: string;
  /** the generated `scripts/env-check.ts` — the encrypted-env preflight (keypair present? required secrets set + encrypted?). */
  envCheck: string;
  /** the generated `src/env.ts` — the @suluk/env `defineEnv` declaration (declare-once: the app's secrets, surfaced). */
  envTs: string;
  /** the generated `scripts/sync-secrets.ts` — decrypt the cloudflare-surfaced secrets from the committed .env and push them
   *  as `wrangler secret`s (the toolfactory-exact deploy path; the alternative is the entry's runtime `loadEnv`). */
  syncSecrets: string;
  /** the generated `scripts/link-key.ts` — register the private key into the centralized `~/.suluk/settings.json` (the store
   *  `@suluk/env` reads by default for local dev/deploy/CI), the toolfactory model. */
  linkKey: string;
  /** the generated `.env.temp` SCAFFOLD — the PLAINTEXT bootstrap for `bun run provision` (gitignored; consumed + deleted). */
  envTemp: string;
  /** the generated `scripts/provision.ts` — the credential lifecycle: source `.env.temp`/`.env` → provision → mint scoped
   *  tokens → encrypt keepers → DELETE the ephemeral master token → stage the encrypted `.env`. */
  provisionScript: string;
  /** the generated `scripts/mint-tokens.ts` — mint scoped least-privilege CF tokens from the master, encrypted into `.env`. */
  mintTokens: string;
  /** the generated `.env` SCAFFOLD (committed) — a header + the setup steps, NO values. `generate` writes it only if absent
   *  (never clobbering the operator's encrypted secrets). Secret VALUES are added encrypted via `suluk-env set`. */
  envScaffold: string;
}

export function planPlatform(input: PlatformManifest | Platform): PlatformPlan {
  // C053: a `{ system, brand }` platform lowers to the legacy manifest first, then the UNCHANGED lowering runs — so the
  // legacy path is byte-for-byte identical and the new surface is sugar over it.
  const manifest = isPlatform(input) ? liftSystemBrand(input) : input;
  // the EFFECTIVE catalog = core services + any inline (community) Service objects a `{system,brand}` platform carries. It
  // threads through EVERY emitter (mounts, provision, deps, env, wiring), so a community service contributes end-to-end. For
  // the legacy path and an all-core `{system,brand}` it === CORE_SERVICES → the Phase-0 golden lock still holds byte-for-byte.
  const catalog: Record<string, Service> = { ...CORE_SERVICES };
  if (isPlatform(input)) for (const ref of input.system.services) if (typeof ref !== "string") catalog[ref.id] = ref;
  const services = orderServices(manifest.services);
  const unknown = services.filter((s) => !catalog[s]);
  if (unknown.length) throw new Error(`platform: unknown service(s) [${unknown.join(", ")}] — not in the catalog`);
  const env = collectEnv(services, catalog);
  // resolve the wires (a `{system,brand}` platform may carry `wire`; a legacy manifest never does → no wiring → byte-identical).
  const wiring = resolveWiring(services, isPlatform(input) ? input.system.wire ?? [] : [], catalog);
  return {
    services,
    // a service may override the registry it's pulled from (multi-registry); core services fall back to the system registry.
    adds: services.map((s) => `${catalog[s].registry ?? manifest.registry}/${s}`),
    entry: buildEntry(services, manifest.opts, wiring, catalog),
    provisionConfig: buildProvisionConfig(services, catalog),
    packageJson: buildPackageJson(manifest.name, services, catalog),
    tsconfig: buildTsconfig(),
    componentsJson: buildComponentsJson(),
    envExample: buildEnvExample(env),
    wranglerToml: buildWranglerToml(manifest.name, services, env, manifest.vars ?? {}),
    gitignore: buildGitignore(),
    envCheck: buildEnvCheckScript(env),
    envTs: buildEnvTs(env),
    syncSecrets: buildSyncSecrets(),
    linkKey: buildLinkKey(),
    envTemp: buildEnvTemp(env),
    provisionScript: buildProvisionScript(env),
    mintTokens: buildMintTokens(env),
    envScaffold: buildEnvScaffold(env),
  };
}

/** the app's SECRET env vars (the ones committed ENCRYPTED in `.env` + decrypted at runtime). */
const secretsOf = (env: EnvVar[]): EnvVar[] => env.filter((e) => e.secret);

/** The SECRET env keys → `.env.example` (required uncommented `KEY=`, optional commented `# KEY=`), each with its hint.
 *  Non-secret config is NOT here — it's in the manifest `vars` → wrangler `[vars]`. Safe to commit (no values). */
function buildEnvExample(env: EnvVar[]): string {
  const line = (e: EnvVar) => `${e.name}=${e.hint ? `        # ${e.hint}` : ""}`;
  const provisioning = provisioningOf(env).filter((e) => !e.minted); // the master + account id (the raw inputs)
  const minted = env.filter((e) => e.minted); // the scoped tokens the mint step creates
  const runtime = runtimeSecretsOf(env);
  return [
    "# Secret keys checklist (generated). SETUP: fill `.env.temp` (plaintext) → `bun run provision`. It creates the keypair,",
    "# provisions infra, mints the scoped tokens, ENCRYPTS the keepers into the COMMITTED `.env` (@suluk/env ML-KEM-768), and",
    "# DELETES the ephemeral CF master token. Non-secret config lives in platform.config.ts `vars` (→ wrangler.toml [vars]).",
    "",
    "# PROVISIONING creds — supply in .env.temp (plaintext). The master is EPHEMERAL (deleted after minting; never committed):",
    ...provisioning.map(line),
    "",
    "# Scoped least-privilege tokens — MINTED by `bun run provision`/`mint-tokens` (you don't supply these); kept encrypted:",
    ...minted.map((e) => `# ${line(e)}`),
    "",
    "# RUNTIME secrets — supply in .env.temp; encrypted into .env + shipped to the Worker:",
    ...runtime.map((e) => (e.required ? line(e) : `# ${line(e)}`)),
    "",
  ].join("\n");
}

/**
 * `src/env.ts` — the @suluk/env `defineEnv` DECLARE-ONCE for the app's SECRETS (from the catalog's secret env metadata). Each
 * secret is `surfaces: ["cloudflare"]` (a Worker-runtime secret); `sync-secrets` reads `forSurface("cloudflare")` to know what
 * to push, and the values live ENCRYPTED in the committed `.env`. Non-secret config stays in the manifest `vars` → [vars].
 */
function buildEnvTs(env: EnvVar[]): string {
  const secrets = secretsOf(env);
  const surface = (e: EnvVar): string => (e.provisioning || e.minted || e.surface === "local" ? '["local"]' : '["cloudflare"]');
  const spec = secrets
    .map((e) => `  ${e.name}: { secret: true, ${e.required ? "required: true, " : ""}surfaces: ${surface(e)}${e.hint ? `, description: ${JSON.stringify(e.hint)}` : ""} },`)
    .join("\n");
  return [
    "// AUTO-GENERATED by @suluk/platform — the @suluk/env declare-once for this app's SECRETS. Values live ENCRYPTED in the",
    "// committed .env (ML-KEM-768). Non-secret config is in platform.config.ts `vars` → wrangler.toml [vars].",
    'import { defineEnv } from "@suluk/env";',
    "",
    "export const env = defineEnv({",
    spec,
    "});",
    "",
  ].join("\n");
}

/**
 * `scripts/sync-secrets.ts` — the deploy-time path (toolfactory-exact): decrypt the cloudflare-surfaced secrets from the
 * committed .env (the private key comes from `.env.keys` / `~/.suluk` / `SULUK_PRIVATE_KEY`) and push each as a `wrangler
 * secret`. Idempotent. The alternative is the runtime `loadEnv` in `src/index.ts` (set SULUK_PRIVATE_KEY as a wrangler secret).
 */
function buildSyncSecrets(): string {
  return `#!/usr/bin/env bun
// AUTO-GENERATED by @suluk/platform. Push the DECRYPTION key to the Worker (so src/index.ts's loadEnv decrypts the committed
// .env at runtime), and optionally each runtime secret directly. Run at deploy: \`bun run sync-secrets\` (needs a deployed
// Worker + a CF-authed wrangler; the private key comes from ~/.suluk/settings.json).
import { loadEnvFile, readPrivateKey } from "@suluk/env/node";
import { env } from "../src/env";

const put = async (name: string, value: string) => {
  const p = Bun.spawn(["bunx", "wrangler", "secret", "put", name], { stdin: "pipe", stdout: "inherit", stderr: "inherit" });
  p.stdin.write(value); await p.stdin.end();
  if ((await p.exited) !== 0) { console.error(\`✗ failed to put \${name}\`); process.exit(1); }
  console.log(\`✓ \${name}\`);
};

// 1. the DECRYPTION key — the Worker's loadEnv decrypts the committed .env with it (the primary runtime path).
const priv = readPrivateKey();
if (!priv) { console.error("✗ no private key (~/.suluk/settings.json / SULUK_PRIVATE_KEY) — run \`bun run link-key\`"); process.exit(1); }
await put("SULUK_PRIVATE_KEY", priv);

// 2. (optional, belt-and-suspenders) push each cloudflare-surfaced runtime secret directly too.
const values = await loadEnvFile(); // decrypt every value in .env into a { KEY: value } record
const names = env.forSurface("cloudflare").filter((k) => values[k] !== undefined && values[k] !== "");
if (!names.length) {
  console.log("✓ synced SULUK_PRIVATE_KEY (no cloudflare-surfaced runtime secrets set yet).");
  process.exit(0);
}
for (const name of names) {
  const proc = Bun.spawn(["wrangler", "secret", "put", name], { stdin: "pipe", stdout: "inherit", stderr: "inherit" });
  proc.stdin.write(values[name]);
  await proc.stdin.end();
  if ((await proc.exited) !== 0) { console.error(\`✗ failed to put \${name}\`); process.exit(1); }
  console.log(\`✓ \${name}\`);
}
console.log(\`✓ synced \${names.length} secret(s) to the Worker.\`);
`;
}

/**
 * `scripts/link-key.ts` — register THIS project's @suluk/env private key into the centralized `~/.suluk/settings.json`
 * (keyed by the repo's absolute path), the toolfactory model. `readPrivateKey()` then resolves it from there BY DEFAULT
 * (precedence: `SULUK_PRIVATE_KEY` env > `~/.suluk/settings.json` by path > legacy `.env.keys`), so local dev, deploy, and a
 * CI worktree (which checks out the encrypted .env but not `.env.keys`, via `SULUK_PROJECT_DIR`) all decrypt from one store.
 */
function buildLinkKey(): string {
  return `#!/usr/bin/env bun
// AUTO-GENERATED by @suluk/platform. Register this project's @suluk/env private key into ~/.suluk/settings.json (keyed by the
// repo path) — the central, out-of-git store @suluk/env reads by default. Run once after \`bunx suluk-env keygen\`; idempotent.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { readPrivateKey } from "@suluk/env/node";

const repo = process.cwd();
const name = repo.split("/").filter(Boolean).pop() ?? "project";
const priv = readPrivateKey(); // SULUK_PRIVATE_KEY env > ~/.suluk/settings.json > .env.keys (legacy)
if (!priv) { console.error("✗ no private key — run \`bunx suluk-env keygen\` first"); process.exit(1); }

const settingsPath = process.env.SULUK_SETTINGS_PATH || join(homedir(), ".suluk", "settings.json");
type Proj = { name?: string; path?: string; env?: Array<{ key: string; value: string }> };
let data: { projects?: Proj[] } = {};
try { data = JSON.parse(readFileSync(settingsPath, "utf8")); } catch { /* fresh */ }
const projects: Proj[] = Array.isArray(data.projects) ? data.projects : [];
let entry = projects.find((p) => p.path === repo);
if (!entry) { entry = { name, path: repo, env: [] }; projects.push(entry); }
entry.name = name; entry.path = repo; entry.env = Array.isArray(entry.env) ? entry.env : [];
const existing = entry.env.find((e) => e.key === "SULUK_PRIVATE_KEY");
if (existing) existing.value = priv; else entry.env.push({ key: "SULUK_PRIVATE_KEY", value: priv });
data.projects = projects;
mkdirSync(dirname(settingsPath), { recursive: true });
writeFileSync(settingsPath, JSON.stringify(data, null, 2) + "\\n");
console.log(\`✓ linked \${name} → \${settingsPath}. You can now \\\`rm .env.keys\\\` — the key lives in the central store.\`);
`;
}

/** the app's PROVISIONING creds (surface "local" — used to stand up + deploy, never shipped to the Worker). */
const provisioningOf = (env: EnvVar[]): EnvVar[] => env.filter((e) => e.provisioning || e.minted || e.surface === "local");
/** the ephemeral provisioning creds (the CF master token) — DELETED after provisioning, never committed. */
const ephemeralOf = (env: EnvVar[]): EnvVar[] => env.filter((e) => e.provisioning);
/** the RUNTIME secrets (surface "cloudflare") — encrypted in the committed .env + reach the Worker. */
const runtimeSecretsOf = (env: EnvVar[]): EnvVar[] => secretsOf(env).filter((e) => !e.provisioning && !e.minted && e.surface !== "local");

/**
 * `.env.temp` — the PLAINTEXT bootstrap (gitignored). The operator drops the raw provisioning creds (+ the runtime secrets)
 * here; `bun run provision` CONSUMES it (stages the values into `.env`, encrypts the keepers, DELETES the ephemeral master
 * token, then deletes `.env.temp`). `generate` writes this scaffold only if absent. NEVER committed.
 */
function buildEnvTemp(env: EnvVar[]): string {
  const line = (e: EnvVar) => `${e.name}=        # ${e.hint ?? ""}`;
  return [
    "# .env.temp — PLAINTEXT bootstrap for `bun run provision`. Gitignored; consumed + DELETED after provisioning.",
    "# Fill in the raw values, then run `bun run provision` (it encrypts the keepers into .env + deletes this file + the",
    "# ephemeral CF master token). The DECRYPTION key is generated for you (→ ~/.suluk/settings.json + the Worker).",
    "",
    "# Provisioning creds (used to create infra + mint scoped tokens; the master is DELETED, never committed):",
    ...provisioningOf(env).filter((e) => !e.minted).map(line),
    "",
    "# Runtime secrets (encrypted into .env + committed; shipped to the Worker):",
    ...runtimeSecretsOf(env).map(line),
    "",
  ].join("\n");
}

/**
 * `scripts/mint-tokens.ts` — mint the scoped least-privilege CF tokens from the master (toolfactory's model), each encrypted
 * straight into `.env` via `suluk-env set`. Idempotent (skips a token already set). The value is never printed.
 */
function buildMintTokens(env: EnvVar[]): string {
  const minted = env.filter((e) => e.minted);
  // map each minted token → the CF permission-group name(s) its hint implies (the operator can refine in the CF dashboard).
  const groups: Record<string, string[]> = {
    CLOUDFLARE_D1_TOKEN: ["D1 Write"],
    CLOUDFLARE_WORKERS_TOKEN: ["Workers Scripts Write"],
    CLOUDFLARE_KV_TOKEN: ["Workers KV Storage Write"],
  };
  const specs = minted.map((e) => `  { name: ${JSON.stringify(e.name)}, groups: ${JSON.stringify(groups[e.name] ?? ["Workers Scripts Write"])} },`).join("\n");
  return `#!/usr/bin/env bun
// AUTO-GENERATED by @suluk/platform. Mint scoped least-privilege CF tokens FROM the master (CLOUDFLARE_API_TOKEN), each
// stored ENCRYPTED in .env via \`suluk-env set\`. Routine deploy/migrate then use these, not the master. Idempotent.
import { setVar, loadEnvFile, rawEnvRecord } from "@suluk/env/node";

await loadEnvFile({ override: true });
const token = process.env.CLOUDFLARE_API_TOKEN, acct = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !acct) { console.error("✗ CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID required (put them in .env.temp, run \`bun run provision\`)"); process.exit(1); }

const SCOPED = [
${specs}
];
// resolve the CF permission-group ids once (POST /accounts/{id}/tokens needs ids, not names).
const pgRes = await fetch("https://api.cloudflare.com/client/v4/user/tokens/permission_groups", { headers: { Authorization: \`Bearer \${token}\` } });
const pg = (await pgRes.json()) as { result?: Array<{ id: string; name: string }> };
const idOf = (name: string) => pg.result?.find((g) => g.name === name)?.id;

const have = rawEnvRecord();
for (const s of SCOPED) {
  if (have[s.name]) { console.log(\`– skip \${s.name} (already set)\`); continue; }
  const permission_groups = s.groups.map((n) => ({ id: idOf(n) })).filter((g) => g.id);
  const res = await fetch(\`https://api.cloudflare.com/client/v4/accounts/\${acct}/tokens\`, {
    method: "POST",
    headers: { Authorization: \`Bearer \${token}\`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: \`\${s.name.toLowerCase()}\`, policies: [{ effect: "allow", resources: { [\`com.cloudflare.api.account.\${acct}\`]: "*" }, permission_groups }] }),
  });
  const out = (await res.json()) as { success?: boolean; result?: { value?: string }; errors?: unknown };
  if (!out.success || !out.result?.value) { console.error(\`✗ mint \${s.name}: \${JSON.stringify(out.errors)}\`); process.exit(1); }
  await setVar(s.name, out.result.value); // encrypted into .env; never printed
  console.log(\`✓ minted \${s.name}\`);
}
console.log("✓ scoped tokens ready (encrypted in .env).");
`;
}

/**
 * `scripts/provision.ts` — the credential lifecycle (the encrypted-commit model): source the raw creds from `.env.temp`
 * (plaintext, first run — CONSUMED + deleted) OR the already-encrypted `.env`; ensure a keypair centralized in
 * `~/.suluk/settings.json`; stand up the infra; mint scoped tokens; ENCRYPT the keepers into `.env`; DELETE the ephemeral
 * master token (never committed); stage the encrypted `.env`. `bun run deploy` then ships the Worker + the decryption key.
 */
function buildProvisionScript(env: EnvVar[]): string {
  const ephemeral = ephemeralOf(env).map((e) => e.name);
  return `#!/usr/bin/env bun
// AUTO-GENERATED by @suluk/platform — stand up the infra + SEAL the secrets (@suluk/env encrypted-commit model). Run once
// after filling .env.temp (or with an existing encrypted .env). Idempotent.
import { existsSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { loadEnvFile, setVar } from "@suluk/env/node";

const EPHEMERAL = ${JSON.stringify(ephemeral)}; // the CF master token(s): used to provision + mint, then DELETED (never committed)
const sh = async (cmd: string, args: string[]) => { const p = Bun.spawn([cmd, ...args], { stdout: "inherit", stderr: "inherit" }); if ((await p.exited) !== 0) { console.error(\`✗ \${cmd} \${args.join(" ")}\`); process.exit(1); } };

// 1. keypair → the central ~/.suluk/settings.json (the private key never stays in the repo).
await Bun.spawn(["bunx", "suluk-env", "keygen"]).exited; // idempotent (nonzero if a key already exists)
await sh("bun", ["run", "scripts/link-key.ts"]);
rmSync(".env.keys", { force: true });

// 2. source the raw creds: .env.temp (plaintext, first run) → stage into .env, then it's consumed; else the encrypted .env.
if (existsSync(".env.temp")) {
  for (const l of readFileSync(".env.temp", "utf8").split("\\n")) {
    const m = l.match(/^\\s*([A-Z0-9_]+)\\s*=\\s*(.+)$/);
    if (m && m[2].trim()) await setVar(m[1], m[2].trim().replace(/^["']|["']$/g, ""), { plain: true }); // stage plaintext (encrypted at step 5)
  }
}
await loadEnvFile({ override: true }); // decrypt everything into process.env
if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) { console.error("✗ CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID missing — put them in .env.temp"); process.exit(1); }

// 3. provision the infra (D1/KV — the C047 provision.config), 4. mint the scoped least-privilege tokens from the master.
await sh("bunx", ["suluk-provision", "apply"]);
await sh("bun", ["run", "scripts/mint-tokens.ts"]);

// 5. ENCRYPT every keeper value in .env in place (runtime secrets + account id + minted tokens).
await sh("bunx", ["suluk-env", "encrypt"]);

// 6. DELETE the ephemeral master token from .env (never committed) — routine ops use the minted scoped tokens.
if (EPHEMERAL.length) {
  const kept = readFileSync(".env", "utf8").split("\\n").filter((l) => { const m = l.match(/^\\s*([A-Z0-9_]+)\\s*=/); return !(m && EPHEMERAL.includes(m[1])); });
  writeFileSync(".env", kept.join("\\n"));
}
// 7. consume the plaintext bootstrap + stage the encrypted .env.
rmSync(".env.temp", { force: true });
await sh("git", ["add", "-f", ".env"]);
console.log("✓ provisioned + sealed: infra up, secrets encrypted in .env; the CF master token was removed from .env.");
console.log("");
console.log("⚠ REVOKE the master CF token in the dashboard now (https://dash.cloudflare.com/profile/api-tokens) — it minted the");
console.log("  scoped least-privilege tokens and is no longer needed. Routine deploy/migrate use the minted tokens. To create new");
console.log("  services / mint new tokens / teardown later, generate a FRESH master token, put it in .env.temp, re-run \`bun run provision\`.");
console.log("");
console.log("Next: \`bun run deploy\` (ships the Worker + pushes SULUK_PRIVATE_KEY so it decrypts the committed .env at runtime).");
`;
}

/**
 * The `.env` SCAFFOLD — a header + setup steps, NO values (safe to commit). `generate` writes it ONLY IF ABSENT so it never
 * clobbers the operator's encrypted secrets. Its presence also lets `src/index.ts`'s `import "../.env"` resolve on a fresh app.
 */
function buildEnvScaffold(env: EnvVar[]): string {
  const required = secretsOf(env).filter((e) => e.required);
  return [
    "# This file is COMMITTED. Secret VALUES are stored ENCRYPTED (@suluk/env, post-quantum ML-KEM-768) — safe to push to git.",
    "# Setup:",
    "#   bunx suluk-env keygen              # keypair: SULUK_PUBLIC_KEY here (commit); private key → .env.keys",
    "#   bun run link-key                   # register the private key in ~/.suluk/settings.json (the central store @suluk/env",
    "#                                      #   reads by DEFAULT for local dev/deploy/CI); then `rm .env.keys` if you like",
    "#   bunx suluk-env set BETTER_AUTH_SECRET=...   # encrypts + adds each secret" + (required.length ? ` (required: ${required.map((e) => e.name).join(", ")})` : ""),
    "# Get the secrets into the Worker EITHER way:",
    "#   • runtime:  `wrangler secret put SULUK_PRIVATE_KEY`  → src/index.ts decrypts this file on the first request",
    "#   • deploy:   `bun run sync-secrets`                    → pushes each secret via `wrangler secret put`",
    "# NEVER commit a plaintext secret — `suluk-env set` encrypts; `bunx suluk-env encrypt` seals any leftover plaintext.",
    "",
  ].join("\n");
}

/** The `wrangler.toml` — `[vars]` from the manifest's non-secret config (unset ones commented with a hint) + the D1 binding
 *  (always) + a KV binding when rate-credit is selected. `generate` merges it so provisioned binding ids survive a regen. */
function buildWranglerToml(name: string, services: string[], env: EnvVar[], vars: Record<string, string>): string {
  const nonSecret = env.filter((e) => !e.secret);
  const varLines = nonSecret.map((e) =>
    vars[e.name] !== undefined
      ? `${e.name} = ${JSON.stringify(vars[e.name])}`
      : `# ${e.name} = ""        # ${e.hint ?? "set in platform.config.ts `vars`"}`,
  );
  const kv: string[] = [];
  if (services.includes("rate-credit")) kv.push('\n[[kv_namespaces]]\nbinding = "RATE_CREDIT_KV"\nid = ""                 # ← `wrangler kv namespace create RATE_CREDIT_KV`');
  if (services.includes("rate-limit")) kv.push('\n[[kv_namespaces]]\nbinding = "RATE_LIMIT_KV"\nid = ""                 # optional durable rate-limit store');
  return [
    `# AUTO-GENERATED by @suluk/platform — [vars] come from platform.config.ts \`vars\`; the binding ids are yours (from`,
    `# \`suluk-provision apply\` / \`wrangler kv namespace create\`) and are PRESERVED across a regenerate.`,
    `name = ${JSON.stringify(name)}`,
    `main = "src/index.ts"`,
    `compatibility_date = "2026-07-01"`,
    "",
    "[vars]",
    ...varLines,
    "",
    "[[d1_databases]]",
    `binding = "DB"`,
    `database_name = ${JSON.stringify(name)}`,
    `database_id = ""        # ← the id \`suluk-provision apply\` lands`,
    ...kv,
    "",
  ].join("\n");
}

/** Preserve the operator's provisioned binding ids (keyed by `binding = "NAME"`) across a wrangler.toml regenerate. */
export function mergeWranglerToml(generated: string, existing: string | null): string {
  if (!existing) return generated;
  const ids = new Map<string, string>();
  let cur: string | null = null;
  for (const l of existing.split("\n")) {
    const b = l.match(/^\s*binding\s*=\s*"([^"]+)"/);
    if (b) {
      cur = b[1];
      continue;
    }
    const id = l.match(/^\s*(?:database_id|id)\s*=\s*"([^"]+)"/);
    if (id && cur && id[1]) ids.set(cur, id[1]);
  }
  if (!ids.size) return generated;
  cur = null;
  return generated
    .split("\n")
    .map((l) => {
      const b = l.match(/^\s*binding\s*=\s*"([^"]+)"/);
      if (b) {
        cur = b[1];
        return l;
      }
      const m = l.match(/^(\s*(?:database_id|id)\s*=\s*)""(.*)$/);
      if (m && cur && ids.has(cur)) return `${m[1]}${JSON.stringify(ids.get(cur))}${m[2]}`;
      return l;
    })
    .join("\n");
}

function buildGitignore(): string {
  // NOTE: `.env` is NOT ignored — it is COMMITTED with its secret values ENCRYPTED (@suluk/env). The PRIVATE key
  // (`.env.keys`) is what must never be committed; that + `.env.temp`/`.dev.vars` are ignored.
  return ["node_modules/", ".env.keys", ".env.temp", ".dev.vars", ".wrangler/", "dist/", ""].join("\n");
}

/** Merge the generated .gitignore into an existing one — APPEND any missing entries (never skip-if-present, so an app's
 *  minimal .gitignore can't leave `.env.keys`/`.env.temp` UNIGNORED and risk committing the private key). Dedup, preserve app
 *  entries. ENCRYPTED-ENV TRANSITION: if the new baseline ignores `.env.keys` (the private key) but NOT `.env`, a plaintext-era
 *  `.env` ignore is REMOVED — the .env is now COMMITTED with its values encrypted, so ignoring it is wrong (and safe to undo). */
export function mergeGitignore(generated: string, existing: string | null): string {
  if (!existing) return generated;
  const norm = (s: string) => s.trim().replace(/\/$/, "");
  const genLines = generated.split("\n").map(norm);
  const encryptedModel = genLines.includes(".env.keys") && !genLines.includes(".env");
  const existingClean = encryptedModel ? existing.split("\n").filter((l) => norm(l) !== ".env").join("\n") : existing;
  const have = new Set(existingClean.split("\n").map(norm).filter(Boolean));
  const add = generated.split("\n").filter((l) => l.trim() && !have.has(norm(l)));
  if (!add.length) return existingClean.endsWith("\n") ? existingClean : existingClean + "\n";
  const base = existingClean.replace(/\n*$/, "");
  return `${base}\n${add.join("\n")}\n`;
}

/** The encrypted-env preflight (run via `predev` / `bun run check`): is there a keypair, and is every REQUIRED secret set
 *  (encrypted) in the committed `.env`? A plaintext secret sitting in `.env` is flagged (encrypt it before you commit). */
function buildEnvCheckScript(env: EnvVar[]): string {
  // the required secrets that should be SET + ENCRYPTED in the committed .env after provisioning — the ephemeral master is
  // EXCLUDED (it's deleted after provisioning, so its absence is correct).
  const required = env.filter((e) => e.secret && e.required && !e.provisioning).map((e) => e.name);
  return `#!/usr/bin/env bun
/**
 * AUTO-GENERATED by @suluk/platform — the env preflight (wired as \`predev\` + \`bun run check\`). SETUP: fill \`.env.temp\`
 * (plaintext) then \`bun run provision\`. This verifies the END STATE: a keypair exists, the required secrets are set +
 * ENCRYPTED in the committed .env, and none is sitting in plaintext. Non-secret config is in platform.config.ts \`vars\`.
 */
import { existsSync, readFileSync } from "node:fs";

const REQUIRED = ${JSON.stringify(required)};

const parse = (p: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const line of readFileSync(p, "utf8").split("\\n")) {
    const m = line.match(/^\\s*([A-Z0-9_]+)\\s*=\\s*(.*)$/);
    if (m && m[2].trim()) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
};
const fail = (msg: string) => { console.error("✗ " + msg); process.exit(1); };

// a plaintext bootstrap is waiting to be consumed → provision it (encrypts the keepers, deletes the master).
if (existsSync(".env.temp")) fail(".env.temp is present (plaintext) — run \`bun run provision\` to consume it (seals secrets into .env, deletes the master token).");

const have = existsSync(".env") ? parse(".env") : {};
const isEncrypted = (v: string) => v.startsWith("encrypted:");
if (!have.SULUK_PUBLIC_KEY) fail("no keypair yet — fill .env.temp with your creds/secrets and run \`bun run provision\` (creates the keypair, provisions, seals secrets).");

const missing = REQUIRED.filter((k) => !have[k] && !process.env[k]);
if (missing.length) fail("missing required secret(s) in .env: " + missing.join(", ") + "\\n  → add them to .env.temp + \`bun run provision\`, or \`bunx suluk-env set KEY=value\`");

const plaintext = Object.keys(have).filter((k) => k !== "SULUK_PUBLIC_KEY" && have[k] && !isEncrypted(have[k]));
if (plaintext.length) fail("PLAINTEXT secret(s) in .env (never commit these): " + plaintext.join(", ") + "\\n  → encrypt: bunx suluk-env encrypt");

console.log("✓ .env ready — keypair present, required secrets set + encrypted.");
process.exit(0);
`;
}

/** The framework baseline package.json — name from the manifest, the union of BASE + each service's deps (versions
 *  resolved: @suluk/* → "latest", ecosystem → pinned), + the toolchain devDeps + the regenerate/typecheck scripts. */
export function buildPackageJson(name: string, services: string[], catalog: Record<string, Service> = CORE_SERVICES): string {
  const deps = new Set<string>(BASE_DEPS);
  for (const s of services) for (const d of catalog[s]?.deps ?? []) deps.add(d);
  const dependencies: Record<string, string> = {};
  for (const d of [...deps].sort()) dependencies[d] = resolveVersion(d);
  const pkg = {
    name,
    private: true,
    type: "module",
    scripts: {
      generate: "suluk-platform", // re-pull modules + rewrite the scaffold config + src/index.ts + provision.config.ts
      check: "bun run scripts/env-check.ts", // the encrypted-env preflight (keypair present? required secrets set + encrypted?)
      predev: "bun run scripts/env-check.ts", // runs automatically before `dev`
      dev: "wrangler dev",
      deploy: "wrangler deploy",
      "env:keygen": "suluk-env keygen", // create the @suluk/env keypair (SULUK_PUBLIC_KEY → .env; private → .env.keys)
      "link-key": "bun run scripts/link-key.ts", // register the private key in ~/.suluk/settings.json (the central store)
      "env:set": "suluk-env set", // encrypt + add a secret: `bun run env:set BETTER_AUTH_SECRET=...`
      provision: "bun run scripts/provision.ts", // stand up infra + mint scoped tokens + seal secrets (consumes .env.temp)
      "mint-tokens": "bun run scripts/mint-tokens.ts", // (re)mint the scoped least-privilege CF tokens from the master
      "sync-secrets": "bun run scripts/sync-secrets.ts", // push SULUK_PRIVATE_KEY + runtime secrets to the Worker
      typecheck: "tsc --noEmit -p .",
      test: "bun test",
    },
    dependencies,
    devDependencies: { ...DEV_DEPS },
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}

/**
 * Merge the generated framework baseline package.json with the app's EXISTING one (if any). The baseline WINS for the
 * framework + module deps (so `@suluk/*` stay `"latest"` and the ecosystem stays on its pinned range — deps stay current
 * across a regenerate), while any deps / scripts / top-level fields the app added are PRESERVED. No existing ⇒ the baseline
 * verbatim. Keys are sorted for stable output. Pure + testable.
 */
export function mergePackageJson(baselineJson: string, existingJson: string | null): string {
  if (!existingJson) return baselineJson;
  const baseline = JSON.parse(baselineJson) as Record<string, unknown>;
  let existing: Record<string, unknown>;
  try {
    existing = JSON.parse(existingJson) as Record<string, unknown>;
  } catch {
    return baselineJson; // an unparseable existing file → the baseline (don't silently keep broken JSON)
  }
  const obj = (v: unknown): Record<string, string> => (v && typeof v === "object" ? (v as Record<string, string>) : {});
  const sortedMerge = (a: Record<string, string>, b: Record<string, string>): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const k of Object.keys({ ...a, ...b }).sort()) out[k] = (b as Record<string, string>)[k] ?? a[k];
    return out;
  };
  const merged = {
    ...existing, // app-added top-level fields (engines, wrangler, …) survive
    ...baseline, // baseline sets name/private/type
    // app extras preserved; the baseline (framework + modules) WINS for overlaps → @suluk/* stay "latest".
    dependencies: sortedMerge(obj(existing.dependencies), obj(baseline.dependencies)),
    devDependencies: sortedMerge(obj(existing.devDependencies), obj(baseline.devDependencies)),
    // app scripts win (custom commands survive); the framework's generate/typecheck/test fill any gaps.
    scripts: { ...obj(baseline.scripts), ...obj(existing.scripts) },
  };
  return JSON.stringify(merged, null, 2) + "\n";
}

function buildTsconfig(): string {
  return (
    JSON.stringify(
      {
        compilerOptions: { module: "ESNext", target: "ESNext", moduleResolution: "bundler", types: ["node", "@cloudflare/workers-types"], skipLibCheck: true, strict: true, noEmit: true },
        include: ["src", "provision.config.ts", "platform.config.ts"],
        exclude: ["src/**/*.test.ts"], // the bun:test journeys harness runs under `bun test`, not the Worker build
      },
      null,
      2,
    ) + "\n"
  );
}

function buildComponentsJson(): string {
  return (
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: false,
        tsx: true,
        tailwind: { config: "", css: "", baseColor: "neutral", cssVariables: false },
        aliases: { components: "src/components", utils: "src/lib/utils" },
      },
      null,
      2,
    ) + "\n"
  );
}

function buildEntry(services: string[], opts?: Record<string, Record<string, unknown>>, wiring?: Wiring, catalog: Record<string, Service> = CORE_SERVICES): string {
  const imports = [
    'import { createApp } from "./app";',
    'import { loadEnv } from "@suluk/env";',
    "// @ts-ignore — the committed, @suluk/env-encrypted .env, bundled as text (bun + wrangler text import).",
    'import envText from "../.env" with { type: "text" };',
  ];
  const middleware: string[] = [];
  const routes: string[] = [];
  const hooksByService = wiring?.hooksByService ?? {};
  // every identifier bound at the top of the entry (base + each mount) → its module. A wire import that reuses a symbol from
  // a DIFFERENT module would shadow/duplicate-declare it, so reject it (fail closed); a same-module re-import is deduped.
  const bound = new Map<string, string>([["createApp", "./app"]]);
  // a service's mount opts = its serviceOpts (JSON) + any wire-injected hook closures (raw code). With NO hooks, render is
  // the EXACT legacy JSON.stringify path (byte-identical); with hooks, a mixed object literal (JSON values + code fields).
  const optOf = (s: string): string => {
    const so = opts?.[s];
    const hooks = hooksByService[s];
    if (!hooks || !Object.keys(hooks).length) {
      return so && Object.keys(so).length ? `, ${JSON.stringify(so)}` : "";
    }
    const parts: string[] = [];
    for (const [k, v] of Object.entries(so ?? {})) parts.push(`${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    for (const [k, code] of Object.entries(hooks)) parts.push(`${JSON.stringify(k)}: ${code}`);
    return `, { ${parts.join(", ")} }`;
  };
  // TWO passes: ALL middleware mounts (app.use / handler) emit BEFORE any route mount, so a cross-cutting concern
  // (auth, rate-limit, i18n) applies to every route regardless of where it sits in the manifest.
  for (const s of services) {
    const m = catalog[s].mount;
    if (m.kind === "middleware") {
      imports.push(`import { ${m.symbol} } from "${m.from}";`);
      bound.set(m.symbol, m.from);
      middleware.push(`${m.symbol}(app${optOf(s)});`);
    } else if (m.kind === "route") {
      imports.push(`import { ${m.symbol} } from "${m.from}";`);
      bound.set(m.symbol, m.from);
      routes.push(`app.route("${m.path}", ${m.symbol}(${optOf(s).replace(/^, /, "")}));`);
    }
  }
  // the wires' consumed capabilities need imports (e.g. Effect / Credits / CreditsLive / DbLive) — appended after the mounts,
  // rejecting any that collides with a base/mount symbol from a different module (would break the generated entry).
  const safeWireImports = (wiring?.imports ?? []).filter((imp) => {
    const existing = bound.get(imp.symbol);
    if (existing === undefined) return (bound.set(imp.symbol, imp.from), true);
    if (existing !== imp.from) throw new Error(`wire: import symbol "${imp.symbol}" (from "${imp.from}") collides with an existing import from "${existing}" — rename the capability's export`);
    return false; // same symbol + module already imported → dedup
  });
  for (const line of groupImports(safeWireImports)) imports.push(line);
  const body = ["const app = createApp();", ...middleware, ...routes];
  // the @suluk/env bootstrap: the committed .env holds the app's secrets ENCRYPTED. If SULUK_PRIVATE_KEY is set (a wrangler
  // secret), decrypt them into the request env on first use (the runtime path); otherwise this is a no-op and the secrets come
  // from `wrangler secret put` (the `bun run sync-secrets` deploy path). Decrypt once per isolate (env is stable across requests).
  const bootstrap = [
    "let secrets: Record<string, string> | null = null;",
    "export default {",
    "  async fetch(request: Request, env: Record<string, unknown>, ctx: ExecutionContext): Promise<Response> {",
    "    if (!secrets && typeof env.SULUK_PRIVATE_KEY === \"string\") secrets = await loadEnv({ content: envText, privateKey: env.SULUK_PRIVATE_KEY });",
    "    const merged = secrets ? { ...secrets, ...env } : env;",
    "    return app.fetch(request, merged as Parameters<typeof app.fetch>[1], ctx);",
    "  },",
    "};",
  ];
  return `// AUTO-GENERATED by @suluk/platform from platform.config.ts — the wired Hono entry. Edit freely.\n${imports.join("\n")}\n\n${body.join("\n")}\n\n${bootstrap.join("\n")}\n`;
}

function buildProvisionConfig(services: string[], catalog: Record<string, Service> = CORE_SERVICES): string {
  const frags = services.map((s) => catalog[s].provision).filter((p): p is NonNullable<typeof p> => !!p);
  const imports = frags.map((f) => `import { ${f.symbol} } from "${f.from}";`);
  return [
    "// AUTO-GENERATED by @suluk/platform — the merged provision config. Run `suluk-provision apply`.",
    'import { defineProvision } from "@suluk/provision";',
    'import { mergeProvision } from "@suluk/platform";',
    ...imports,
    "",
    `export default defineProvision({ instances: mergeProvision([${frags.map((f) => f.symbol).join(", ")}]) });`,
    "",
  ].join("\n");
}
