/**
 * The plan (C051) — PURE: a manifest → the shadcn-add list + the generated `src/index.ts` (the wired Hono entry) + the
 * generated `provision.config.ts` (importing + merging the fragments). No I/O; `generate` executes this. Testable to the
 * character.
 */
import { type PlatformManifest, type Platform, type WireDecl, isPlatform } from "./manifest";
import { liftSystemBrand, deriveHosts } from "./resolve";
import { resolveWiring, groupImports, type Wiring } from "./wire";
import { CATALOG, CORE_SERVICES, orderServices, collectEnv, BASE_DEPS, DEV_DEPS, resolveVersion, type EnvVar, type Service } from "./catalog";
import { buildPrePushHook, buildCiRun, buildCiStages, buildCiLocal, buildCiWorktree, buildEmitContract, buildEmitAsyncApi, buildEslintConfig, buildPrettierrc } from "./ci";

export interface PlatformPlan {
  services: string[];
  /** shadcn refs to add, in order (e.g. "MahmoodKhalil57/suluk/credits"). */
  adds: string[];
  /** the generated `src/index.ts` content. */
  entry: string;
  /** the generated `provision.config.ts` content. */
  provisionConfig: string;
  /** the generated `src/contract.ops.ts` — the COMPOSED contract surface (one `RouteContract[]` fragment per module). Present
   *  ONLY when the `contract` service is installed; the base `src/contract.ts` consumes its `ALL_OPS`. */
  contractOps?: string;
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
  /** the generated `scripts/deploy.ts` — the API-driven Cloudflare deploy (`@suluk/deploy` over `@suluk/cloudflare`):
   *  bundle `src/index.ts` → provision + deploy + push secrets, credentials from the `@suluk/env`-decrypted `.env`. No wrangler. */
  deployScript: string;
  /** the generated `src/dev.ts` — the bun local dev server (mock-or-live autodetect: bun:sqlite + JSON KV mocks, or live
   *  D1/KV over the CF HTTP API when the decrypted `.env` carries the CF keys). Always emitted (`dev` = the local server). */
  devEntry?: string;
  /** the generated `scripts/purge-state.ts` — clears dev/live state (recommended on a mock↔real swap or a provision
   *  migration). Always emitted. */
  purgeScript?: string;
  /** the LOCAL on-push CI/CD (modeled on toolfactory): the pre-push hook + the worktree runner + the shared stage list +
   *  the in-place/manual variants + the lint/format config. Async, idempotent stages → deploy on the default branch. */
  prePushHook: string;
  ciRun: string;
  ciStages: string;
  ciLocal: string;
  ciWorktree: string;
  eslintConfig: string;
  prettierrc: string;
  /** `scripts/emit-contract.ts` — derives openapi.v4.json from the contract for the suluk gate. Only when `contract` installed. */
  emitContract?: string;
  /** `scripts/emit-asyncapi.ts` — derives asyncapi.json (AsyncAPI 3.0 + CloudEvents) from the contract's event surface. Only when `contract` installed. */
  emitAsyncApi?: string;
}

export function planPlatform(input: PlatformManifest | Platform): PlatformPlan {
  // C053: a `{ system, brand }` platform lowers to the legacy manifest first, then the UNCHANGED lowering runs — so the
  // legacy path is byte-for-byte identical and the new surface is sugar over it.
  const normalized = isPlatform(input) ? liftSystemBrand(input) : input;
  // C058: the single-source URL derivation, on a PRIVATE copy so planPlatform never mutates the caller's manifest (the
  // legacy full-URL manifest is a no-op — byte-identical). vars/opts are cloned; localVars/__localHost land on `manifest`.
  const manifest: PlatformManifest = {
    ...normalized,
    ...(normalized.vars ? { vars: { ...normalized.vars } } : {}),
    ...(normalized.opts ? { opts: structuredClone(normalized.opts) } : {}),
  };
  deriveHosts(manifest);
  // the EFFECTIVE catalog = core services + any inline (community) Service objects a `{system,brand}` platform carries. It
  // threads through EVERY emitter (mounts, provision, deps, env, wiring), so a community service contributes end-to-end. For
  // the legacy path and an all-core `{system,brand}` it === CORE_SERVICES → the Phase-0 golden lock still holds byte-for-byte.
  const catalog: Record<string, Service> = { ...CORE_SERVICES };
  if (isPlatform(input)) for (const ref of input.system.services) if (typeof ref !== "string") catalog[ref.id] = ref;
  const services = orderServices(manifest.services);
  const unknown = services.filter((s) => !catalog[s]);
  if (unknown.length) throw new Error(`platform: unknown service(s) [${unknown.join(", ")}] — not in the catalog`);
  // REQUIRES-VALIDATION (decoupling): a selected service's MOUNT peers must also be selected (the runtime contract — a route
  // reading the auth-set principal needs `auth`; mcp needs `contract`). A missing peer is a BUILD ERROR — never a silent
  // unauthenticated/ungated subset — WITHOUT force-adding auth to every app.
  for (const s of services)
    for (const req of catalog[s].requires ?? [])
      if (!services.includes(req)) throw new Error(`platform: service "${s}" requires "${req}" (the c.get("user")/scope-gate runtime contract) — add "${req}" to services[], or drop "${s}"`);
  const env = collectEnv(services, catalog);
  // resolve the wires (a `{system,brand}` platform may carry `wire`; a legacy manifest never does → no wiring → byte-identical).
  // mcp-discovery gate: the OAuth /.well-known/* routes need auth's mcp() plugin, enabled only when `auth.mcp` (derived from
  // `mcpScopes`) is set — so drop the `mcp.mcpAuthInstance` edge otherwise (a mcp+auth subset without mcp OAuth mustn't wire it).
  const rawWires = isPlatform(input) ? input.system.wire ?? [] : [];
  const userWires = manifest.opts?.auth?.mcp ? rawWires : rawWires.filter((w) => w.from !== "mcp.mcpAuthInstance");
  // STRUCTURAL wires (not user policy → never in platform.config.ts): mcp/reference are contract PROJECTIONS (each
  // `requires: ["contract"]`) that consume contract's `apiDocument`. Auto-inject `<consumer>.apiDocument → contract.provideApiDocument`
  // so NEITHER module imports `../contract` — with ZERO config burden. Injected only when both endpoints are selected (the
  // requires-guard above guarantees contract is co-present whenever mcp/reference are). This is to a HARD peer, so no `optional`.
  const structuralWires: WireDecl[] = services.includes("contract")
    ? ["mcp", "reference"].filter((c) => services.includes(c)).map((c) => ({ from: `${c}.apiDocument`, to: "contract.provideApiDocument" }))
    : [];
  const wires = [...userWires, ...structuralWires];
  const wiring = resolveWiring(services, wires, catalog, manifest.opts);
  // diagnostics (never affect the emitted bytes): report pruned optional edges + the scope-gate-absent subset choice.
  if (wiring.pruned.length) console.warn(`[platform] pruned ${wiring.pruned.length} optional wire(s):\n  ${wiring.pruned.join("\n  ")}`);
  if ((services.includes("keys") || services.includes("mcp")) && !services.includes("contract"))
    console.warn('[platform] scope gate absent — x-api-key callers to keys/mcp are UNGATED (add "contract" to enforce per-op scopes)');
  // GDPR build-guard (fan-in completeness): with `erasure` installed, every installed data module that OFFERS an `eraseStep`
  // MUST be wired into `erasure.cascade` — else that module's user-keyed rows SURVIVE an account erasure (silent under-deletion,
  // a real compliance gap the distributed cascade otherwise hides). WARN (not throw) so a deliberate omission stays possible,
  // but is never silent. The legacy manifest carries no wires → this fires there too, flagging the fan-in each app must adopt.
  if (services.includes("erasure")) {
    const wiredErasers = new Set(wires.filter((w) => w.from === "erasure.cascade").map((w) => w.to));
    const unwired = services.filter((s) => catalog[s]?.compose?.offers?.eraseStep && !wiredErasers.has(`${s}.eraseStep`));
    if (unwired.length)
      console.warn(`[platform] GDPR: erasure is installed but these data modules are NOT wired into its cascade (their user rows survive account erasure): ${unwired.join(", ")} — add { from: "erasure.cascade", to: "<module>.eraseStep", optional: true } for each`);
  }
  // The LOCAL bun-dev runtime is now the DEFAULT for every app: `dev` = a local bun server (mock-or-live autodetect), never
  // wrangler. `dev:cf` (wrangler dev) + `deploy` (the @suluk/deploy API deploy) are the opt-in Workers path, gated at runtime
  // on the Cloudflare env keys. The `manifest.local` field is accepted for back-compat but no longer gates anything.
  const local = true;
  return {
    services,
    // a service may override the registry it's pulled from (multi-registry); core services fall back to the system registry.
    adds: services.map((s) => `${catalog[s].registry ?? manifest.registry}/${s}`),
    entry: buildEntry(services, manifest.opts, wiring, catalog, local),
    provisionConfig: buildProvisionConfig(services, catalog),
    ...(services.includes("contract") ? { contractOps: buildContractOps(services, catalog) } : {}),
    packageJson: buildPackageJson(manifest.name, services, catalog, local),
    tsconfig: buildTsconfig(local),
    componentsJson: buildComponentsJson(),
    envExample: buildEnvExample(env),
    wranglerToml: buildWranglerToml(manifest.name, services, env, manifest.vars ?? {}),
    gitignore: buildGitignore(local),
    envCheck: buildEnvCheckScript(env),
    envTs: buildEnvTs(env),
    syncSecrets: buildSyncSecrets(manifest.name),
    linkKey: buildLinkKey(),
    envTemp: buildEnvTemp(env),
    provisionScript: buildProvisionScript(env),
    mintTokens: buildMintTokens(env),
    envScaffold: buildEnvScaffold(env),
    deployScript: buildDeployScript(manifest.name, services, env, manifest.vars ?? {}),
    devEntry: buildDevEntry(services, manifest.localVars, manifest.__localHost),
    purgeScript: buildPurgeScript(services),
    // the LOCAL on-push CI/CD (async worktree → idempotent stages → deploy on the default branch) + its lint/format config.
    prePushHook: buildPrePushHook(),
    ciRun: buildCiRun(),
    ciStages: buildCiStages(services),
    ciLocal: buildCiLocal(),
    ciWorktree: buildCiWorktree(),
    eslintConfig: buildEslintConfig(),
    prettierrc: buildPrettierrc(),
    ...(services.includes("contract") ? { emitContract: buildEmitContract(), emitAsyncApi: buildEmitAsyncApi() } : {}),
  };
}

/** the app's SECRET env vars (the ones committed ENCRYPTED in `.env` + decrypted at runtime). */
const secretsOf = (env: EnvVar[]): EnvVar[] => env.filter((e) => e.secret);

/** The SECRET env keys → `.env.example` (required uncommented `KEY=`, optional commented `# KEY=`), each with its hint.
 *  Non-secret config is NOT here — it's in the manifest `vars` → wrangler `[vars]`. Safe to commit (no values). */
function buildEnvExample(env: EnvVar[]): string {
  const line = (e: EnvVar) => `${e.name}=${e.hint ? `        # ${e.hint}` : ""}`;
  // .env.example mirrors the COMMITTED .env AFTER provisioning: SULUK_PUBLIC_KEY (plaintext) + every secret EXCEPT the
  // EPHEMERAL master (deleted after minting). Keepers + minted scoped tokens + runtime secrets — all encrypted at rest.
  const localKeepers = secretsOf(env).filter((e) => !e.provisioning && (e.minted || e.surface === "local")); // account-id + minted tokens
  const runtime = runtimeSecretsOf(env);
  return [
    "# .env.example — the keys in the COMMITTED .env AFTER `bun run provision` (values ENCRYPTED with @suluk/env;",
    "# SULUK_PUBLIC_KEY plaintext). The EPHEMERAL CF master token (CLOUDFLARE_API_TOKEN) is supplied in .env.temp and DELETED",
    "# after minting — it is NOT here. Non-secret config lives in platform.config.ts `vars` (→ wrangler.toml [vars]).",
    "",
    "SULUK_PUBLIC_KEY=        # @suluk/env public key (plaintext; can only encrypt)",
    "",
    "# Provisioning keeper + minted scoped tokens (surface local — never shipped to the Worker; encrypted):",
    ...localKeepers.map(line),
    "",
    "# Runtime secrets (encrypted; reach the Worker via loadEnv / sync-secrets):",
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
 * `scripts/deploy.ts` — the API-driven Cloudflare deploy (NO wrangler, NO ambient auth). Bundles `src/index.ts`, then
 * `@suluk/deploy` (over `@suluk/cloudflare`) provisions D1/KV, deploys the Worker with its bindings/vars, and pushes secrets
 * — all over the Cloudflare REST API. Credentials come from the `@suluk/env`-DECRYPTED `.env`. Bindings + vars are embedded
 * from the manifest (they regenerate from platform.config.ts); D1 (by name) + KV (by title) provisioning is idempotent.
 */
function buildDeployScript(name: string, services: string[], env: EnvVar[], vars: Record<string, string>): string {
  const kvBindings = [
    ...(services.includes("rate-credit") ? ["RATE_CREDIT_KV"] : []),
    ...(services.includes("rate-limit") ? ["RATE_LIMIT_KV"] : []),
  ];
  const setVars: Record<string, string> = {};
  for (const e of env) if (!e.secret && vars[e.name] !== undefined) setVars[e.name] = vars[e.name];
  const secretNames = env.filter((e) => e.secret).map((e) => e.name);
  return `#!/usr/bin/env bun
/**
 * AUTO-GENERATED by @suluk/platform — API-driven Cloudflare deploy (NO wrangler, NO ambient auth). Bundles src/index.ts,
 * then @suluk/deploy (over @suluk/cloudflare) provisions D1/KV, deploys the Worker with its bindings/vars, and pushes
 * secrets — all over the Cloudflare REST API. Credentials come from the @suluk/env-DECRYPTED .env (CLOUDFLARE_API_TOKEN +
 * optional CLOUDFLARE_ACCOUNT_ID). Run: \`bun run deploy\` (after \`bun run provision\`).
 */
import { deployCloudflare, type CloudflareDeploySpec } from "@suluk/deploy";
import { loadEnvFile, readPrivateKey } from "@suluk/env/node";

const NAME = ${JSON.stringify(name)};
const VARS: Record<string, string> = ${JSON.stringify(setVars)};
const KV_BINDINGS = ${JSON.stringify(kvBindings)};
const SECRET_NAMES = ${JSON.stringify(secretNames)}; // pushed if set (encrypted) in .env — SULUK_PRIVATE_KEY is always pushed

// 1) decrypt the committed .env → the resolved secrets/config. CF credentials come from HERE — never wrangler / the ambient system.
const cfg = await loadEnvFile();
const apiToken = cfg.CLOUDFLARE_D1_TOKEN ?? cfg.CLOUDFLARE_API_TOKEN; // the minted scoped token if present, else the master
if (!apiToken) { console.error("✗ no CLOUDFLARE_API_TOKEN in the decrypted .env — run \`bun run provision\` (or set it) first."); process.exit(1); }

// 2) the runtime SECRETS the Worker needs: SULUK_PRIVATE_KEY (decrypts the committed .env at runtime) + each set app secret.
const priv = readPrivateKey();
if (!priv) { console.error("✗ no private key (~/.suluk/settings.json / SULUK_PRIVATE_KEY) — run \`bun run link-key\`."); process.exit(1); }
const secrets: Record<string, string> = { SULUK_PRIVATE_KEY: priv };
for (const k of SECRET_NAMES) if (cfg[k] !== undefined && cfg[k] !== "") secrets[k] = cfg[k];

// 3) bundle src/index.ts → the Worker ES module (the Worker runtime provides nodejs_compat).
const built = await Bun.build({ entrypoints: ["src/index.ts"], format: "esm", minify: true });
if (!built.success) { for (const l of built.logs) console.error(l); process.exit(1); }
const workerModule = await built.outputs[0].text();

// 4) provision + deploy over the API. D1 (by name) + KV (by title) are IDEMPOTENT — reused across deploys.
const kv = KV_BINDINGS.map((binding) => ({ binding, title: \`\${NAME}-\${binding.toLowerCase().replace(/_/g, "-")}\` }));
const spec: CloudflareDeploySpec = {
  scriptName: NAME,
  module: workerModule,
  d1: { binding: "DB", databaseName: NAME },
  ...(kv.length ? { kv } : {}),
  vars: VARS,
  secrets,
};

console.log(\`Deploying "\${NAME}" to Cloudflare over the API (no wrangler)…\`);
const res = await deployCloudflare({ apiToken, accountId: cfg.CLOUDFLARE_ACCOUNT_ID }, spec, (m) => console.log("  " + m));
console.log(\`✓ deployed \${res.scriptName}\${res.d1 ? \` · D1 \${res.d1.id}\` : ""}\${res.kv.length ? \` · KV \${res.kv.map((k) => k.binding).join(",")}\` : ""} · \${res.secretsSet.length} secret(s)\`);
`;
}

/**
 * `scripts/sync-secrets.ts` — re-push the DECRYPTION key + each cloudflare-surfaced secret to the DEPLOYED Worker over the
 * Cloudflare REST API (`@suluk/cloudflare` `putSecrets`). Credentials from the `@suluk/env`-decrypted `.env`, NO wrangler.
 * `deploy` already pushes secrets; this is the standalone re-push (e.g. after rotating a secret). Idempotent.
 */
function buildSyncSecrets(name: string): string {
  return `#!/usr/bin/env bun
// AUTO-GENERATED by @suluk/platform. Re-push SULUK_PRIVATE_KEY (so src/index.ts's loadEnv decrypts the committed .env at
// runtime) + each cloudflare-surfaced secret to the deployed Worker over the Cloudflare REST API — credentials from the
// @suluk/env-decrypted .env, NO wrangler. Run: \`bun run sync-secrets\` (the Worker must already be deployed).
import { CloudflareClient, putSecrets } from "@suluk/cloudflare";
import { loadEnvFile, readPrivateKey } from "@suluk/env/node";
import { env } from "../src/env";

const NAME = ${JSON.stringify(name)};
const cfg = await loadEnvFile(); // decrypt .env → { KEY: value } (+ inject into process.env)
const apiToken = cfg.CLOUDFLARE_D1_TOKEN ?? cfg.CLOUDFLARE_API_TOKEN;
if (!apiToken) { console.error("✗ no CLOUDFLARE_API_TOKEN in the decrypted .env — run \`bun run provision\` first."); process.exit(1); }
const priv = readPrivateKey();
if (!priv) { console.error("✗ no private key (~/.suluk/settings.json / SULUK_PRIVATE_KEY) — run \`bun run link-key\`."); process.exit(1); }

const secrets: Record<string, string> = { SULUK_PRIVATE_KEY: priv };
for (const k of env.forSurface("cloudflare")) if (cfg[k] !== undefined && cfg[k] !== "") secrets[k] = cfg[k];

const cf = new CloudflareClient({ apiToken, accountId: cfg.CLOUDFLARE_ACCOUNT_ID });
const set = await putSecrets(cf, NAME, secrets);
console.log(\`✓ synced \${set.length} secret(s) to the Worker "\${NAME}"\${set.length ? ": " + set.join(", ") : ""}.\`);
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
// repo path) — the central, out-of-git store @suluk/env reads by default. EXPORTS linkKey() (scripts/provision.ts imports it)
// and runs it as a CLI (\`bun run link-key\`). Idempotent.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { readPrivateKey } from "@suluk/env/node";

export function linkKey(): void {
  const repo = process.cwd();
  const name = repo.split("/").filter(Boolean).pop() ?? "project";
  const priv = readPrivateKey(); // SULUK_PRIVATE_KEY env > ~/.suluk/settings.json > .env.keys (legacy)
  if (!priv) { console.error("✗ no private key — run \`bun run env:keygen\` first"); process.exit(1); }

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
}

if (import.meta.main) linkKey();
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
    "# Runtime secrets (encrypted into .env + committed; shipped to the Worker). AUTO-GENERATED ones are NOT here — `provision`",
    "# creates them: " + (runtimeSecretsOf(env).filter((e) => e.generated).map((e) => e.name).join(", ") || "(none)") + ".",
    ...runtimeSecretsOf(env).filter((e) => !e.generated).map(line),
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
// stored ENCRYPTED in .env. Routine deploy/migrate then use these, not the master. EXPORTS mintTokens() (scripts/provision.ts
// imports it) + runs as a CLI (\`bun run mint-tokens\`). Idempotent (skips an already-set token). No wrangler, no ambient auth.
import { setVar, loadEnvFile, rawEnvRecord } from "@suluk/env/node";

export async function mintTokens(): Promise<void> {
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
}

if (import.meta.main) await mintTokens();
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
  const generated = env.filter((e) => e.generated).map((e) => e.name);
  return `#!/usr/bin/env bun
// AUTO-GENERATED by @suluk/platform — stand up the infra + SEAL the secrets (@suluk/env encrypted-commit model). Run once
// after filling .env.temp (or with an existing encrypted .env). Idempotent. IMPORTS the tools (no spawning Suluk CLIs); the
// only subprocess is \`git add\` (staging the encrypted .env). No wrangler, no ambient credentials.
import { existsSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { loadEnvFile, setVar, ensureKeypair, encryptEnvFile } from "@suluk/env/node";
import { runCli } from "@suluk/provision";
import { linkKey } from "./link-key";
import { mintTokens } from "./mint-tokens";

const EPHEMERAL = ${JSON.stringify(ephemeral)}; // the CF master token(s): used to provision + mint, then DELETED (never committed)
const GENERATED = ${JSON.stringify(generated)}; // secrets the app creates itself (e.g. BETTER_AUTH_SECRET) — never operator-supplied

// 1. keypair → the central ~/.suluk/settings.json (the private key never stays in the repo). ensureKeypair is idempotent.
const kp = ensureKeypair(); // creates the @suluk/env keypair (private → .env.keys) if absent, else returns the existing one
await setVar("SULUK_PUBLIC_KEY", kp.publicKey, { plain: true }); // the public key lives (plaintext) in .env, as \`suluk-env keygen\` does
linkKey(); // register the private key in ~/.suluk/settings.json (imported from ./link-key)
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

// 2b. auto-generate any app-created secret (e.g. BETTER_AUTH_SECRET ← 32 random bytes) not already set — the operator never
//     supplies these in .env.temp. Staged plaintext here, encrypted at step 5.
for (const name of GENERATED) {
  if (!process.env[name]) { await setVar(name, randomBytes(32).toString("base64"), { plain: true }); console.log(\`✓ generated \${name}\`); }
}

// 3. provision the infra (D1/KV — the C047 provision.config) via @suluk/provision (imported), 4. mint the scoped tokens.
// IMPORT THE CONFIG NOW (dynamic) — AFTER loadEnvFile — so provision.config's Cloudflare brokers pick up the decrypted creds.
const { default: provisionApp } = await import("../provision.config");
const { output, exitCode } = await runCli(provisionApp, ["apply"]);
if (output) console.log(output);
if (exitCode !== 0) process.exit(exitCode);
await mintTokens(); // imported from ./mint-tokens (fetch over the CF API — no wrangler)

// 5. ENCRYPT every keeper value in .env in place (runtime secrets + account id + minted tokens).
await encryptEnvFile();

// 6. DELETE the ephemeral master token from .env (never committed) — routine ops use the minted scoped tokens.
if (EPHEMERAL.length) {
  const kept = readFileSync(".env", "utf8").split("\\n").filter((l) => { const m = l.match(/^\\s*([A-Z0-9_]+)\\s*=/); return !(m && EPHEMERAL.includes(m[1])); });
  writeFileSync(".env", kept.join("\\n"));
}
// 7. consume the plaintext bootstrap + stage the encrypted .env (git is the one remaining subprocess — not a credential CLI).
rmSync(".env.temp", { force: true });
{ const p = Bun.spawn(["git", "add", "-f", ".env"], { stdout: "inherit", stderr: "inherit" }); if ((await p.exited) !== 0) { console.error("✗ git add -f .env"); process.exit(1); } }
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

function buildGitignore(local = false): string {
  // NOTE: `.env` is NOT ignored — it is COMMITTED with its secret values ENCRYPTED (@suluk/env). The PRIVATE key
  // (`.env.keys`) is what must never be committed; that + `.env.temp`/`.dev.vars` are ignored.
  // local mode also ignores `.suluk/` (the bun-dev sqlite DB + JSON KV — local dev data, never committed).
  // `.ci/` = the local CI logs + bundle-check output; `openapi.v4.json` = the emit-contract artifact the suluk gate reads.
  return ["node_modules/", ".env.keys", ".env.temp", ".dev.vars", ".wrangler/", "dist/", ".ci/", "openapi.v4.json", "asyncapi.json", ...(local ? [".suluk/"] : []), ""].join("\n");
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
 * AUTO-GENERATED by @suluk/platform — the DEPLOY/PROVISION readiness preflight (run it manually: \`bun run check\`). It is
 * DELIBERATELY NOT wired to \`bun dev\`: local dev is mock-until-keyed and must run with ZERO secrets, so gating it here would
 * defeat the purpose. SETUP for going live: fill \`.env.temp\` (plaintext) then \`bun run provision\`. This verifies the END
 * STATE: a keypair exists, the required secrets are set + ENCRYPTED in the committed .env, and none is sitting in plaintext.
 * Non-secret config is in platform.config.ts \`vars\`.
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
export function buildPackageJson(name: string, services: string[], catalog: Record<string, Service> = CORE_SERVICES, local = false): string {
  const deps = new Set<string>(BASE_DEPS);
  for (const s of services) for (const d of catalog[s]?.deps ?? []) deps.add(d);
  // `src/dev.ts` imports @suluk/cloudflare (/local + /live facades + CloudflareClient); `scripts/deploy.ts` imports
  // @suluk/deploy (the API deploy). Both are always present now (local dev is the default; deploy is API-driven). Dedup-safe.
  deps.add("@suluk/cloudflare");
  deps.add("@suluk/deploy");
  const dependencies: Record<string, string> = {};
  for (const d of [...deps].sort()) dependencies[d] = resolveVersion(d);
  // the LOCAL CI's lint/format toolchain (devDeps) + the @suluk/eslint shared rules.
  const devDependencies: Record<string, string> = { ...DEV_DEPS, "@suluk/eslint": "latest", eslint: "^9.0.0", "@eslint/js": "^9.0.0", "typescript-eslint": "^8.0.0", prettier: "^3.0.0", globals: "^16.0.0" };
  // the Suluk conformance gate runs only when the `audit` module is installed (+ `contract` to derive the doc from).
  const sulukGate = services.includes("audit") && services.includes("contract");
  const pkg = {
    name,
    private: true,
    type: "module",
    scripts: {
      generate: "suluk-platform", // re-pull modules + rewrite the scaffold config + src/index.ts + provision.config.ts
      prepare: "git config core.hooksPath .githooks || true", // install the async on-push CI hook (.githooks/pre-push)
      check: "bun run scripts/env-check.ts", // the encrypted-env preflight (keypair present? required secrets set + encrypted?)
      // `dev` is ALWAYS the local bun server — mock-or-live autodetect from the decrypted .env, never wrangler. `dev:cf` is
      // the opt-in real-Workers-runtime test (wrangler dev, gated on Workers env). `deploy` is the @suluk/deploy API deploy.
      dev: "bun run --hot src/dev.ts",
      "dev:cf": "wrangler dev",
      deploy: "bun run scripts/deploy.ts",
      purge: "bun run scripts/purge-state.ts",
      // LOCAL CI/CD — the pre-push hook runs `ci:worktree` async; `ci:local` runs the same stages in-place.
      "ci:local": "bun run scripts/ci-local.ts",
      "ci:worktree": "bun run scripts/ci-worktree.ts",
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      format: "prettier --write .",
      "format:check": "prettier --check .",
      "bundle:check": "bun build src/index.ts --outdir .ci/bundle --format esm", // the Worker bundles (dry — .ci/ is gitignored)
      // derive the v4 doc from the contract, then gate on it. conformance.ts is FETCHED by the `audit` module and (like every
      // registry file) lands UNDER src/ — so it's src/scripts/conformance.ts, reading the root openapi.v4.json emit-contract wrote.
      ...(sulukGate ? { "suluk:gate": "bun run scripts/emit-contract.ts && bun run src/scripts/conformance.ts" } : {}),
      "env:keygen": "suluk-env keygen", // create the @suluk/env keypair (SULUK_PUBLIC_KEY → .env; private → .env.keys)
      "link-key": "bun run scripts/link-key.ts", // register the private key in ~/.suluk/settings.json (the central store)
      "env:set": "suluk-env set", // encrypt + add a secret: `bun run env:set BETTER_AUTH_SECRET=...`
      provision: "bun run scripts/provision.ts", // stand up infra + mint scoped tokens + seal secrets (consumes .env.temp)
      "mint-tokens": "bun run scripts/mint-tokens.ts", // (re)mint the scoped least-privilege CF tokens from the master
      "sync-secrets": "bun run scripts/sync-secrets.ts", // push SULUK_PRIVATE_KEY + runtime secrets to the Worker (API)
      typecheck: "tsc --noEmit -p .",
      test: "bun test",
    },
    dependencies,
    devDependencies,
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}

/**
 * Merge the generated framework baseline package.json with the app's EXISTING one (if any). The baseline WINS for the
 * framework + module deps (so `@suluk/*` stay `"latest"` and the ecosystem stays on its pinned range — deps stay current
 * across a regenerate), while any deps / scripts / top-level fields the app added are PRESERVED. No existing ⇒ the baseline
 * verbatim. Keys are sorted for stable output. Pure + testable.
 */
/** Scripts the generator ONCE emitted but no longer does — removed from an existing package.json on regenerate so they can't
 *  linger as pseudo-"app-owned" entries. Keyed by script name → a matcher on its VALUE, so the prune is SURGICAL: only the
 *  known stale generator invocation is removed; a legitimately app-authored script of the same (reserved) name survives.
 *  `predev` is the reason this exists — the old env-check gate BLOCKS `bun dev` on a not-yet-provisioned app, which is exactly
 *  the mock-until-keyed flow we want to just work; we drop it only when its value is that env-check invocation. */
const DEPRECATED_SCRIPTS: Record<string, RegExp> = { predev: /env-check/ };
const pruneScripts = (scripts: Record<string, string>): Record<string, string> => {
  const out = { ...scripts };
  for (const [k, staleValue] of Object.entries(DEPRECATED_SCRIPTS)) if (out[k] && staleValue.test(out[k])) delete out[k];
  return out;
};

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
    // the GENERATOR-owned scripts (dev/dev:cf/deploy/provision/…) WIN so a regenerate updates them (e.g. dev→bun, deploy→API);
    // an app's OWN scripts (keys not in the baseline, e.g. a custom `lint`) survive. Consistent with deps (baseline wins overlaps).
    // PRUNE scripts the generator ONCE emitted but no longer does — else a stale one lingers as "app-owned" through a regen.
    // `predev` (the old env-check gate) is the load-bearing one: it BLOCKS `bun dev`, defeating mock-until-keyed local dev.
    scripts: pruneScripts(sortedMerge(obj(existing.scripts), obj(baseline.scripts))),
  };
  return JSON.stringify(merged, null, 2) + "\n";
}

function buildTsconfig(local = false): string {
  return (
    JSON.stringify(
      {
        compilerOptions: { module: "ESNext", target: "ESNext", moduleResolution: "bundler", types: ["node", "@cloudflare/workers-types"], skipLibCheck: true, strict: true, noEmit: true },
        include: ["src", "provision.config.ts", "platform.config.ts"],
        // src/dev.ts + scripts/purge-state.ts are bun-only (bun:sqlite + Bun globals + @suluk/cloudflare/local), NOT Worker
        // code — exclude them from the Worker typecheck (the workers-types config can't type them); they're boot-tested instead.
        exclude: ["src/**/*.test.ts", ...(local ? ["src/dev.ts", "scripts/purge-state.ts"] : [])], // the bun:test journeys harness runs under `bun test`, not the Worker build
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

function buildEntry(services: string[], opts?: Record<string, Record<string, unknown>>, wiring?: Wiring, catalog: Record<string, Service> = CORE_SERVICES, local = false): string {
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
  // local mode also EXPORTS the wired app so `src/dev.ts` can serve it under bun with mock bindings (the Worker `fetch`
  // export is unchanged). Off → `const app` (byte-identical to the golden). The mock modules are imported ONLY by dev.ts,
  // so `wrangler deploy` (bundling from `src/index.ts`) never pulls bun:sqlite into the Worker.
  const body = [`${local ? "export const app" : "const app"} = createApp();`, ...middleware, ...routes];
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

/**
 * `src/dev.ts` — the bun MOCK-PROVIDER dev server (emitted only when `local: true`). Runs the SAME wired app (imported from
 * `src/index.ts`) under bun with a bun:sqlite `DB` facade + a JSON-file KV, so `bun run dev` needs no Cloudflare account and
 * no wrangler. Mock-until-keyed: it decrypts the committed `.env` if the app has been provisioned (real HTTP providers), else
 * every provider falls to its module's mock. The deployed Worker (`src/index.ts`) imports NONE of this — bun:sqlite stays out.
 */
function buildDevEntry(services: string[], localVars?: Record<string, string>, localHost?: string): string {
  const usesKv = services.includes("rate-credit");
  const usesEmail = services.includes("email");
  // C058: the local-runtime URL vars (derived from LOCAL_BASE_URL) + the default PORT (from the local host, so BASE_URL's
  // port matches what we serve on). `rebase` re-points any localhost URL at the actual PORT if the operator overrides it.
  const localPort = (localHost ?? "").match(/:(\d+)$/)?.[1] ?? "8787";
  const localVarsSetup = localVars && Object.keys(localVars).length
    ? `\n// C058 — the LOCAL-runtime URL vars (BASE_URL/BETTER_AUTH_URL/TRUSTED_ORIGINS derived from LOCAL_BASE_URL), re-pointed at the actual PORT.\nconst LOCAL_VARS = ${JSON.stringify(localVars)};\nconst urls = Object.fromEntries(Object.entries(LOCAL_VARS).map(([k, v]) => [k, v.replace(/(localhost:)\\d+/g, \`$1\${PORT}\`)]));`
    : "";
  const localVarsBind = localVarsSetup ? "\n  ...urls," : "";
  const usesBilling = services.includes("billing");
  const localImports = ["d1FromSqlite", ...(usesKv ? ["jsonFileKvStore"] : []), ...(usesEmail ? ["jsonFileMailbox"] : []), "applyLocalSchema"];
  const liveImports = ["d1FromHttp", ...(usesKv ? ["httpKvStore"] : [])];
  const billingImport = usesBilling ? '\nimport { mockStripeFetch } from "@suluk/billing";' : "";
  const mailboxBind = usesEmail ? "\n  SULUK_MAILBOX_SINK: mailbox," : "";
  // mock-until-keyed: only inject the Stripe fake when there is no real key (a provisioned app hits real Stripe). ORTHOGONAL
  // to the state layer — a mock Stripe works against LIVE D1/KV too.
  const stripeInject = usesBilling
    ? '\nif (!env.STRIPE_SECRET_KEY) { env.STRIPE_SECRET_KEY = "sk_mock_local"; env.STRIPE_FETCH = mockStripeFetch(); }'
    : "";
  const mailboxRoute = usesEmail
    ? '\n// a dev-only inbox view of the emails the mock provider captured (never mounted on the deployed Worker).\napp.get("/api/email/dev/mailbox", async (c) => c.json(await mailbox.list()));\n'
    : "";
  const kvIdParse = usesKv ? '\nconst kvId = wrangler.match(/\\[\\[kv_namespaces\\]\\][\\s\\S]*?\\bid\\s*=\\s*"([^"]+)"/)?.[1];' : "";
  const liveAttachCond = usesKv ? "cfToken && cfAccount && d1Id && kvId" : "cfToken && cfAccount && d1Id";
  const kvDecl = usesKv ? "\nlet RATE_CREDIT_KV: unknown;" : "";
  const liveKvAssign = usesKv ? "\n  RATE_CREDIT_KV = httpKvStore(new CloudflareClient({ apiToken: (S.CLOUDFLARE_KV_TOKEN ?? cfToken) as string, accountId: cfAccount! }), kvId!);" : "";
  const mockKvAssign = usesKv ? "\n  RATE_CREDIT_KV = jsonFileKvStore(KV_PATH);" : "";
  const kvEnvBind = usesKv ? "\n  RATE_CREDIT_KV," : "";
  return `// AUTO-GENERATED by @suluk/platform — the bun dev server. Runs the wired app under bun so \`bun run dev\` works with
// ZERO Cloudflare account and no wrangler. SINGLE ENVIRONMENT, MOCK-UNTIL-KEYED, per-layer + per-provider:
//  • STATE (D1+KV): once PROVISIONED (CF token + account + binding ids) it attaches to the SAME LIVE services as the Worker
//    over the Cloudflare HTTP API; a fresh app uses a local bun:sqlite + JSON-file mock. Both-or-neither (never split state).
//  • PROVIDERS (Google/Stripe/Resend): each real when ITS key is present, else its module's mock — INDEPENDENT of the state
//    layer, so a mock login/payment/email works against LIVE D1/KV too. RECOMMEND \`bun run purge\` when you swap a mock for a
//    real key (or vice-versa) or migrate the provision — the old state's shape may not match.
// NOTE: src/index.ts (the deployed Worker) imports NONE of this — bun:sqlite/mocks never enter the Worker bundle.
import { app } from "./index";
import { Database } from "bun:sqlite";
import { ${localImports.join(", ")} } from "@suluk/cloudflare/local";
import { ${liveImports.join(", ")} } from "@suluk/cloudflare/live";
import { CloudflareClient } from "@suluk/cloudflare";${billingImport}
import { loadEnvFile } from "@suluk/env/node";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.SULUK_DB_PATH ?? ".suluk/dev.sqlite";${usesKv ? '\nconst KV_PATH = process.env.SULUK_KV_PATH ?? ".suluk/dev-kv.json";' : ""}${usesEmail ? '\nconst MAILBOX_PATH = process.env.SULUK_MAILBOX_PATH ?? ".suluk/dev-mailbox.json";' : ""}
mkdirSync(dirname(DB_PATH), { recursive: true }); // ensure the local-state dir exists BEFORE bun:sqlite opens the DB (a fresh app has no .suluk/)
const PORT = Number(process.env.PORT ?? ${localPort});${localVarsSetup}
${usesEmail ? "const mailbox = jsonFileMailbox(MAILBOX_PATH); // a local inbox the mock email provider saves to\n" : ""}
// Real secrets (if this app has been provisioned): decrypt the committed .env with the local private key. Fresh app / no
// key → {} → every provider mocks. Best-effort: a decryption failure never blocks the mock path.
let secrets: Record<string, string> = {};
try { secrets = await loadEnvFile(); } catch {}
const S = { ...process.env, ...secrets } as Record<string, string | undefined>; // resolved config (env + decrypted secrets)

// STATE layer: attach LIVE (same D1${usesKv ? "+KV" : ""} as the Worker, over the CF HTTP API) once the minted token + account + the
// provisioned binding id(s) are present; else the local mock. Both-or-neither.
const cfToken = S.CLOUDFLARE_D1_TOKEN ?? S.CLOUDFLARE_API_TOKEN;
const cfAccount = S.CLOUDFLARE_ACCOUNT_ID;
const wrangler = await Bun.file("wrangler.toml").text().catch(() => "");
const d1Id = wrangler.match(/database_id\\s*=\\s*"([^"]+)"/)?.[1];${kvIdParse}
const liveAttach = !!(${liveAttachCond});

let DB: unknown;${kvDecl}
if (liveAttach) {
  const cf = new CloudflareClient({ apiToken: cfToken!, accountId: cfAccount! });
  DB = d1FromHttp(cf, d1Id!);${liveKvAssign}
  console.log(\`[suluk dev] LIVE-ATTACHED — same D1${usesKv ? "+KV" : ""} as the Worker (\${d1Id}); local changes hit production state.\`);
} else {
  const sqlite = new Database(DB_PATH, { create: true });
  const tables = await applyLocalSchema(sqlite); // discover src/db/*.ts + create the tables from the drizzle schema
  DB = d1FromSqlite(sqlite);${mockKvAssign}
  console.log(\`[suluk dev] mock state — sqlite \${DB_PATH} (\${tables.length} tables)\`);
}

const env: Record<string, unknown> = {
  ...S,${localVarsBind}
  // \`bun dev\` IS the development server: force a non-production ENVIRONMENT so the mock-until-keyed providers ARM (dev-login,
  // console email, …) regardless of any deploy-time ENVIRONMENT=production that leaked in from .env/process.env. The deployed
  // Worker (src/index.ts) reads ENVIRONMENT from wrangler [vars]=production, untouched by this. Use \`dev:cf\`/\`deploy\` for prod.
  ENVIRONMENT: "development",
  DB,${kvEnvBind}${mailboxBind}
};

const mocked = ["GOOGLE_CLIENT_ID", "STRIPE_SECRET_KEY", "RESEND_API_KEY"].filter((k) => !env[k]);
if (mocked.length) console.log(\`[suluk dev] mocked providers (no key): \${mocked.join(", ")}\${liveAttach ? " — against LIVE state; run \\\`bun run purge\\\` after swapping a mock for real keys" : ""}\`);${stripeInject}
${mailboxRoute}
const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;
Bun.serve({ port: PORT, idleTimeout: 120, fetch: (req) => app.fetch(req, env as Parameters<typeof app.fetch>[1], ctx) });
console.log(\`[suluk dev] → http://localhost:\${PORT}  (mock-until-keyed; provision to go live)\`);
`;
}

/**
 * `scripts/purge-state.ts` (emitted only when `local: true`) — reset STATE. The single environment is mock-until-keyed, so
 * when you swap a mock provider for real keys (or vice-versa), or migrate the provision (a new service ⇒ new tables / KV /
 * R2), the OLD state's shape may not match — this clears it. Always purges the LOCAL mock state (`.suluk/*`, recreated on
 * next `bun run dev`); with `--yes` it ALSO drops the LIVE D1 tables + clears the live KV (then re-run `bun run provision`).
 */
function buildPurgeScript(services: string[]): string {
  const usesKv = services.includes("rate-credit");
  const kvIdParse = usesKv ? '\nconst kvId = wrangler.match(/\\[\\[kv_namespaces\\]\\][\\s\\S]*?\\bid\\s*=\\s*"([^"]+)"/)?.[1];' : "";
  const kvPurge = usesKv
    ? `\n    if (kvId) {
      const kvCf = new CloudflareClient({ apiToken: (S.CLOUDFLARE_KV_TOKEN ?? token) as string, accountId: account });
      const keys = await kvList(kvCf, kvId);
      for (const k of keys) await kvDelete(kvCf, kvId, k);
      console.log(\`  cleared \${keys.length} live KV keys\`);
    }`
    : "";
  const localFiles = ['.suluk/dev.sqlite', '.suluk/dev.sqlite-wal', '.suluk/dev.sqlite-shm', ...(usesKv ? ['.suluk/dev-kv.json'] : []), ...(services.includes("email") ? ['.suluk/dev-mailbox.json'] : [])];
  return `// AUTO-GENERATED by @suluk/platform — purge STATE. RECOMMENDED whenever you swap a mock provider for real keys (or
// vice-versa) or migrate the provision (a new service ⇒ new tables/KV/R2): the single environment is mock-until-keyed, so
// the old state's shape may not match the new one. Always clears LOCAL mock state; \`--yes\` also purges LIVE D1 + KV.
import { rmSync } from "node:fs";
import { discoverTableNames } from "@suluk/cloudflare/local";
import { loadEnvFile } from "@suluk/env/node";
import { CloudflareClient, queryD1${usesKv ? ", kvList, kvDelete" : ""} } from "@suluk/cloudflare";

const yes = process.argv.includes("--yes");

// 1) LOCAL mock state — dev-only files; recreated on the next \`bun run dev\`. Always safe.
for (const f of ${JSON.stringify(localFiles)}) { try { rmSync(f, { force: true }); } catch {} }
console.log("✓ purged local mock state (.suluk/*)");

// 2) LIVE state (if provisioned): DROP the app's D1 tables${usesKv ? " + clear the KV namespace" : ""}. DESTRUCTIVE — needs \`--yes\`.
let S: Record<string, string | undefined> = { ...process.env };
try { S = { ...process.env, ...(await loadEnvFile()) }; } catch {}
const token = S.CLOUDFLARE_D1_TOKEN ?? S.CLOUDFLARE_API_TOKEN;
const account = S.CLOUDFLARE_ACCOUNT_ID;
const wrangler = await Bun.file("wrangler.toml").text().catch(() => "");
const d1Id = wrangler.match(/database_id\\s*=\\s*"([^"]+)"/)?.[1];${kvIdParse}

if (token && account && d1Id) {
  if (!yes) {
    console.log(\`\\n⚠ LIVE state detected (D1 \${d1Id}${usesKv ? '\${kvId ? " + KV " + kvId : ""}' : ""}). Re-run \\\`bun run purge -- --yes\\\` to DROP all app tables${usesKv ? " + clear KV" : ""}, then \\\`bun run provision\\\` to recreate the schema.\`);
  } else {
    const cf = new CloudflareClient({ apiToken: token, accountId: account });
    for (const t of await discoverTableNames()) { await queryD1(cf, d1Id, \`DROP TABLE IF EXISTS "\${t}"\`); console.log(\`  dropped \${t}\`); }${kvPurge}
    console.log("✓ purged LIVE state — run \`bun run provision\` to recreate the schema. (R2 objects, if any, purge via the CF dashboard.)");
  }
}
`;
}

/**
 * `src/contract.ops.ts` — the COMPOSED contract surface: one `RouteContract[]` fragment per installed module (each module
 * OWNS its ops next to its routes), spread into `ALL_OPS`. Mirrors {@link buildProvisionConfig}. The base `src/contract.ts`
 * consumes `ALL_OPS` (adding the system op + the derivations), so adding/changing a module's routes only touches THAT
 * module's fragment — the central contract can never drift from the routes again.
 */
function buildContractOps(services: string[], catalog: Record<string, Service> = CORE_SERVICES): string {
  const frags = services.map((s) => catalog[s].contract).filter((c): c is NonNullable<typeof c> => !!c);
  const imports = frags.map((f) => `import { ${f.symbol} } from "${f.from}";`);
  return [
    "// AUTO-GENERATED by @suluk/platform — the composed contract surface (one fragment per installed module).",
    'import type { DocumentedRoute } from "@suluk/hono";',
    ...imports,
    "",
    `export const ALL_OPS: readonly DocumentedRoute[] = [${frags.map((f) => `...${f.symbol}`).join(", ")}];`,
    "",
  ].join("\n");
}

function buildProvisionConfig(services: string[], catalog: Record<string, Service> = CORE_SERVICES): string {
  const frags = services.map((s) => catalog[s].provision).filter((p): p is NonNullable<typeof p> => !!p);
  const imports = frags.map((f) => `import { ${f.symbol} } from "${f.from}";`);
  // C101: when the app has a contract (apiDocument()), ALSO derive InstanceSpec[] from its `x-suluk-provision` facet —
  // "author domain once, annotate broker intent, generate OSB artifacts" (mirrors buildEmitContract/buildEmitAsyncApi's
  // own apiDocument() import exactly). Additive + inert until some module actually populates the facet: deriveInstanceSpecs
  // returns [] on a document with no `x-suluk-provision`, so mergeProvision's merged result is UNCHANGED today.
  const hasContract = services.includes("contract");
  const instanceSources = [...frags.map((f) => f.symbol), ...(hasContract ? ["deriveInstanceSpecs(apiDocument())"] : [])];
  return [
    "// AUTO-GENERATED by @suluk/platform — the merged provision APP (a defineProvisionApp result, the shape `suluk-provision`",
    "// + `bun run provision` load). It binds the desired INSTANCES (each module's fragment, merged) to the runtime the CLI",
    "// needs: the Cloudflare BROKERS (built from the decrypted creds), the file STATE journal, the @suluk/env binding SINK,",
    "// and the migration history. The brokers read the creds from process.env — `scripts/provision.ts` decrypts the .env",
    "// (loadEnvFile) BEFORE importing this file, so they are populated by then.",
    // CloudflareClient is imported FROM @suluk/provision (which re-exports it) so `new CloudflareClient()` matches the brokers'
    // expected type even when the app resolves a newer @suluk/cloudflare for its dev server than the one nested under provision.
    `import { defineProvisionApp, defineProvision, fileStore, envSink, fileMigrationStore, cloudflareD1, cloudflareKv, cloudflareR2, cloudflareSecrets, cloudflareToken, CloudflareClient${hasContract ? ", deriveInstanceSpecs" : ""} } from "@suluk/provision";`,
    'import { mergeProvision } from "@suluk/platform";',
    ...imports,
    ...(hasContract ? ['import { apiDocument } from "./src/contract";'] : []),
    "",
    "// A non-empty fallback so CONSTRUCTION never throws when creds are absent — read-only commands (plan/status/check, which",
    "// never call a broker) then work, and only a real provision/apply fails, at the Cloudflare API with an auth error.",
    'const cf = new CloudflareClient({ apiToken: process.env.CLOUDFLARE_API_TOKEN || "MISSING_CLOUDFLARE_API_TOKEN", accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "MISSING_CLOUDFLARE_ACCOUNT_ID" });',
    "",
    "export default defineProvisionApp({",
    `  config: defineProvision({ instances: mergeProvision([${instanceSources.join(", ")}]) }),`,
    "  // service id → broker. The full Cloudflare set (only the ones an instance references are ever invoked); a missing one",
    "  // fails with a CLEAR `no broker registered for service \"…\"` at apply, never a crash.",
    '  brokers: { "cloudflare-d1": cloudflareD1(cf), "cloudflare-kv": cloudflareKv(cf), "cloudflare-r2": cloudflareR2(cf), "cloudflare-secrets": cloudflareSecrets(cf), "cloudflare-token": cloudflareToken(cf) },',
    "  store: fileStore(), // the state journal (.suluk/provision.json)",
    "  sink: envSink(), // bound credentials → the @suluk/env-encrypted .env",
    '  migrations: fileMigrationStore("provision"), // the committed migration history (enables generate/migrate)',
    "});",
    "",
  ].join("\n");
}
