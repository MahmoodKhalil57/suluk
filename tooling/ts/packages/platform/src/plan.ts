/**
 * The plan (C051) — PURE: a manifest → the shadcn-add list + the generated `src/index.ts` (the wired Hono entry) + the
 * generated `provision.config.ts` (importing + merging the fragments). No I/O; `generate` executes this. Testable to the
 * character.
 */
import type { PlatformManifest } from "./manifest";
import { CATALOG, orderServices, BASE_DEPS, DEV_DEPS, resolveVersion } from "./catalog";

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
}

export function planPlatform(manifest: PlatformManifest): PlatformPlan {
  const services = orderServices(manifest.services);
  const unknown = services.filter((s) => !CATALOG[s]);
  if (unknown.length) throw new Error(`platform: unknown service(s) [${unknown.join(", ")}] — not in the catalog`);
  return {
    services,
    adds: services.map((s) => `${manifest.registry}/${s}`),
    entry: buildEntry(services, manifest.opts),
    provisionConfig: buildProvisionConfig(services),
    packageJson: buildPackageJson(manifest.name, services),
    tsconfig: buildTsconfig(),
    componentsJson: buildComponentsJson(),
  };
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
      generate: "suluk-platform", // re-pull modules + rewrite src/index.ts + provision.config.ts + this config
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

function buildEntry(services: string[], opts?: Record<string, Record<string, unknown>>): string {
  const imports = ['import { createApp } from "./app";'];
  const middleware: string[] = [];
  const routes: string[] = [];
  // per-service static options → a JSON literal passed to the mount (e.g. auth's mcp OAuth config). Empty ⇒ no 2nd arg.
  const optOf = (s: string): string => {
    const o = opts?.[s];
    return o && Object.keys(o).length ? `, ${JSON.stringify(o)}` : "";
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
