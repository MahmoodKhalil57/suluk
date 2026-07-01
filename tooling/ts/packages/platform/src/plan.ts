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
  /** the generated `.gitignore` (ignores `.env`, `.env.temp`, `.dev.vars`, …). */
  gitignore: string;
  /** the generated `scripts/env-check.ts` — the `.env.temp` lifecycle preflight (create when secrets missing, delete when ready). */
  envCheck: string;
}

export function planPlatform(input: PlatformManifest | Platform): PlatformPlan {
  // C053: a `{ system, brand }` platform lowers to the legacy manifest first, then the UNCHANGED lowering runs — so the
  // legacy path is byte-for-byte identical and the new surface is sugar over it.
  const manifest = isPlatform(input) ? liftSystemBrand(input) : input;
  const services = orderServices(manifest.services);
  const unknown = services.filter((s) => !CATALOG[s]);
  if (unknown.length) throw new Error(`platform: unknown service(s) [${unknown.join(", ")}] — not in the catalog`);
  const env = collectEnv(services);
  // C053 composition: resolve the wires (a `{system, brand}` platform may carry `wire`; a legacy manifest never does → no
  // wiring → byte-identical). The catalog folds in any inline (community) service objects (Phase 4).
  const catalog: Record<string, Service> = { ...CORE_SERVICES };
  if (isPlatform(input)) for (const ref of input.system.services) if (typeof ref !== "string") catalog[ref.id] = ref;
  const wiring = resolveWiring(services, isPlatform(input) ? input.system.wire ?? [] : [], catalog);
  return {
    services,
    adds: services.map((s) => `${manifest.registry}/${s}`),
    entry: buildEntry(services, manifest.opts, wiring),
    provisionConfig: buildProvisionConfig(services),
    packageJson: buildPackageJson(manifest.name, services),
    tsconfig: buildTsconfig(),
    componentsJson: buildComponentsJson(),
    envExample: buildEnvExample(env),
    wranglerToml: buildWranglerToml(manifest.name, services, env, manifest.vars ?? {}),
    gitignore: buildGitignore(),
    envCheck: buildEnvCheckScript(env),
  };
}

/** The SECRET env keys → `.env.example` (required uncommented `KEY=`, optional commented `# KEY=`), each with its hint.
 *  Non-secret config is NOT here — it's in the manifest `vars` → wrangler `[vars]`. Safe to commit (no values). */
function buildEnvExample(env: EnvVar[]): string {
  const secrets = env.filter((e) => e.secret);
  const line = (e: EnvVar, commented: boolean) => `${commented ? "# " : ""}${e.name}=${e.hint ? `        # ${e.hint}` : ""}`;
  const required = secrets.filter((e) => e.required);
  const optional = secrets.filter((e) => !e.required);
  return [
    "# .env — SECRET keys (generated from platform.config.ts). Copy the values in; never commit this file.",
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
  return ["node_modules/", ".env", ".env.temp", ".dev.vars", ".wrangler/", "dist/", ""].join("\n");
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

/** The `.env.temp` lifecycle preflight (run via `predev` / `bun run check`): if every REQUIRED secret is present (in `.env`
 *  or the process env), delete `.env.temp`; else write `.env.temp` from `.env.example` + report the missing keys + fail. */
function buildEnvCheckScript(env: EnvVar[]): string {
  const required = env.filter((e) => e.secret && e.required).map((e) => e.name);
  return `#!/usr/bin/env bun
/**
 * AUTO-GENERATED by @suluk/platform — the .env lifecycle. Wired as \`predev\` (runs before \`dev\`) + \`bun run check\`.
 * The MINIMUM secret keys this app needs come from platform.config.ts (the selected modules). Non-secret config is in
 * the manifest \`vars\` → wrangler.toml [vars], not here.
 */
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";

const REQUIRED = ${JSON.stringify(required)};
const ENV = ".env", TEMP = ".env.temp", EXAMPLE = ".env.example";

const parse = (p: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const line of readFileSync(p, "utf8").split("\\n")) {
    const m = line.match(/^\\s*([A-Z0-9_]+)\\s*=\\s*(.*)$/);
    if (m && m[2].trim()) out[m[1]] = m[2].trim();
  }
  return out;
};

const have = existsSync(ENV) ? parse(ENV) : {};
const missing = REQUIRED.filter((k) => !have[k] && !process.env[k]);

if (missing.length === 0) {
  if (existsSync(TEMP)) { rmSync(TEMP); console.log("✓ .env ready — removed .env.temp"); }
  else console.log("✓ .env ready (all required secrets present).");
  process.exit(0);
}

// not ready → drop a fill-me-in template so you can see exactly what's needed.
if (existsSync(EXAMPLE)) writeFileSync(TEMP, readFileSync(EXAMPLE, "utf8"));
console.error("✗ missing required secret(s): " + missing.join(", "));
console.error("  → wrote .env.temp — fill the values in and save it as .env (or inject the secrets another way).");
console.error("    .env.temp auto-deletes once .env has every required secret.");
process.exit(1);
`;
}

/** The framework baseline package.json — name from the manifest, the union of BASE + each service's deps (versions
 *  resolved: @suluk/* → "latest", ecosystem → pinned), + the toolchain devDeps + the regenerate/typecheck scripts. */
export function buildPackageJson(name: string, services: string[]): string {
  const deps = new Set<string>(BASE_DEPS);
  for (const s of services) for (const d of CATALOG[s]?.deps ?? []) deps.add(d);
  const dependencies: Record<string, string> = {};
  for (const d of [...deps].sort()) dependencies[d] = resolveVersion(d);
  const pkg = {
    name,
    private: true,
    type: "module",
    scripts: {
      generate: "suluk-platform", // re-pull modules + rewrite the scaffold config + src/index.ts + provision.config.ts
      check: "bun run scripts/env-check.ts", // the .env.temp lifecycle (fails if a required secret is missing)
      predev: "bun run scripts/env-check.ts", // runs automatically before `dev`
      dev: "wrangler dev",
      deploy: "wrangler deploy",
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

function buildEntry(services: string[], opts?: Record<string, Record<string, unknown>>, wiring?: Wiring): string {
  const imports = ['import { createApp } from "./app";'];
  const middleware: string[] = [];
  const routes: string[] = [];
  const hooksByService = wiring?.hooksByService ?? {};
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
    const m = CATALOG[s].mount;
    if (m.kind === "middleware") {
      imports.push(`import { ${m.symbol} } from "${m.from}";`);
      middleware.push(`${m.symbol}(app${optOf(s)});`);
    } else if (m.kind === "route") {
      imports.push(`import { ${m.symbol} } from "${m.from}";`);
      routes.push(`app.route("${m.path}", ${m.symbol}(${optOf(s).replace(/^, /, "")}));`);
    }
  }
  // the wires' consumed capabilities need imports (e.g. Effect / Credits / CreditsLive / DbLive) — appended after the mounts.
  for (const line of groupImports(wiring?.imports ?? [])) imports.push(line);
  const body = ["const app = createApp();", ...middleware, ...routes];
  return `// AUTO-GENERATED by @suluk/platform from platform.config.ts — the wired Hono entry. Edit freely.\n${imports.join("\n")}\n\n${body.join("\n")}\n\nexport default app;\n`;
}

function buildProvisionConfig(services: string[]): string {
  const frags = services.map((s) => CATALOG[s].provision).filter((p): p is NonNullable<typeof p> => !!p);
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
