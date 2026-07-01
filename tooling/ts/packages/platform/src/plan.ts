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
    envScaffold: buildEnvScaffold(env),
  };
}

/** the app's SECRET env vars (the ones committed ENCRYPTED in `.env` + decrypted at runtime). */
const secretsOf = (env: EnvVar[]): EnvVar[] => env.filter((e) => e.secret);

/** The SECRET env keys → `.env.example` (required uncommented `KEY=`, optional commented `# KEY=`), each with its hint.
 *  Non-secret config is NOT here — it's in the manifest `vars` → wrangler `[vars]`. Safe to commit (no values). */
function buildEnvExample(env: EnvVar[]): string {
  const secrets = env.filter((e) => e.secret);
  const line = (e: EnvVar, commented: boolean) => `${commented ? "# " : ""}${e.name}=${e.hint ? `        # ${e.hint}` : ""}`;
  const required = secrets.filter((e) => e.required);
  const optional = secrets.filter((e) => !e.required);
  return [
    "# .env keys checklist (generated). The `.env` is COMMITTED with these values ENCRYPTED (@suluk/env, ML-KEM-768):",
    "#   bunx suluk-env keygen                 # once — keypair (SULUK_PUBLIC_KEY → .env; private → .env.keys, gitignored)",
    "#   bunx suluk-env set KEY=value          # per secret — encrypts it into .env",
    "# Non-secret config lives in platform.config.ts `vars` (→ wrangler.toml [vars]), NOT here.",
    "",
    "# Required — the app won't start without these:",
    ...required.map((e) => line(e, false)),
    "",
    "# Optional:",
    ...optional.map((e) => line(e, true)),
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
  const spec = secrets
    .map((e) => `  ${e.name}: { secret: true, ${e.required ? "required: true, " : ""}surfaces: ["cloudflare"]${e.hint ? `, description: ${JSON.stringify(e.hint)}` : ""} },`)
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
// AUTO-GENERATED by @suluk/platform. Push the committed, @suluk/env-encrypted secrets to the Worker as \`wrangler secret\`s.
// Run at deploy: \`bun run sync-secrets\`. Needs the private key (.env.keys / ~/.suluk / SULUK_PRIVATE_KEY) + a CF-authed wrangler.
import { loadEnvFile } from "@suluk/env/node";
import { env } from "../src/env";

const values = await loadEnvFile(); // decrypt every value in .env into a { KEY: value } record
const names = env.forSurface("cloudflare").filter((k) => values[k] !== undefined && values[k] !== "");
if (!names.length) {
  console.log("no cloudflare-surfaced secrets are set in .env yet — run \`bunx suluk-env set KEY=value\` first.");
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
 * The `.env` SCAFFOLD — a header + setup steps, NO values (safe to commit). `generate` writes it ONLY IF ABSENT so it never
 * clobbers the operator's encrypted secrets. Its presence also lets `src/index.ts`'s `import "../.env"` resolve on a fresh app.
 */
function buildEnvScaffold(env: EnvVar[]): string {
  const required = secretsOf(env).filter((e) => e.required);
  return [
    "# This file is COMMITTED. Secret VALUES are stored ENCRYPTED (@suluk/env, post-quantum ML-KEM-768) — safe to push to git.",
    "# Setup:",
    "#   bunx suluk-env keygen              # keypair: SULUK_PUBLIC_KEY here (commit); private key → .env.keys (gitignored)",
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
 *  minimal .gitignore can't leave `.env`/`.env.temp` UNIGNORED and risk committing secrets). Dedup, preserve app entries. */
export function mergeGitignore(generated: string, existing: string | null): string {
  if (!existing) return generated;
  const norm = (s: string) => s.trim().replace(/\/$/, "");
  const have = new Set(existing.split("\n").map(norm).filter(Boolean));
  const add = generated.split("\n").filter((l) => l.trim() && !have.has(norm(l)));
  if (!add.length) return existing.endsWith("\n") ? existing : existing + "\n";
  const base = existing.replace(/\n*$/, "");
  return `${base}\n${add.join("\n")}\n`;
}

/** The encrypted-env preflight (run via `predev` / `bun run check`): is there a keypair, and is every REQUIRED secret set
 *  (encrypted) in the committed `.env`? A plaintext secret sitting in `.env` is flagged (encrypt it before you commit). */
function buildEnvCheckScript(env: EnvVar[]): string {
  const required = env.filter((e) => e.secret && e.required).map((e) => e.name);
  return `#!/usr/bin/env bun
/**
 * AUTO-GENERATED by @suluk/platform — the ENCRYPTED-env preflight (wired as \`predev\` + \`bun run check\`). Secrets live in the
 * committed .env, ENCRYPTED with @suluk/env. This checks: a keypair exists, the REQUIRED secrets are set, and none is sitting
 * in plaintext (which must never be committed). Non-secret config is in platform.config.ts \`vars\` → wrangler.toml [vars].
 */
import { existsSync, readFileSync } from "node:fs";

const REQUIRED = ${JSON.stringify(required)};
const ENV = ".env";

const parse = (p: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const line of readFileSync(p, "utf8").split("\\n")) {
    const m = line.match(/^\\s*([A-Z0-9_]+)\\s*=\\s*(.*)$/);
    if (m && m[2].trim()) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
};

const have = existsSync(ENV) ? parse(ENV) : {};
const isEncrypted = (v: string) => v.startsWith("encrypted:");
const fail = (msg: string) => { console.error("✗ " + msg); process.exit(1); };

if (!have.SULUK_PUBLIC_KEY) fail("no @suluk/env keypair — run \`bunx suluk-env keygen\` (creates SULUK_PUBLIC_KEY in .env + .env.keys).");

const missing = REQUIRED.filter((k) => !have[k] && !process.env[k]);
if (missing.length) fail("missing required secret(s): " + missing.join(", ") + "\\n  → set each: bunx suluk-env set KEY=value");

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
      "env:set": "suluk-env set", // encrypt + add a secret: `bun run env:set BETTER_AUTH_SECRET=...`
      "sync-secrets": "bun run scripts/sync-secrets.ts", // decrypt cloudflare-surfaced secrets → `wrangler secret put` each
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
