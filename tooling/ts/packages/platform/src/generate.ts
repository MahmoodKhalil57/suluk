/**
 * The generator (C051) — the impure shell over {@link planPlatform}: run the `shadcn add`s (which fetch each module's
 * owned code + install its npm deps + resolve registryDependencies), then write the generated entry + provision.config.
 * `run` + `write` are INJECTED (the CLI provides a real spawn + fs; a test provides recorders), so the orchestration is
 * testable. Stops short of `provision apply` — that's a live infra op the operator triggers.
 */
import { type PlatformManifest, type Platform, isPlatform } from "./manifest";
import { planPlatform, mergePackageJson, mergeWranglerToml, mergeGitignore, type PlatformPlan } from "./plan";

export interface GenerateOptions {
  /** run a command — the CLI spawns `bunx shadcn add <ref>`; a test records. */
  run: (cmd: string, args: string[]) => Promise<void>;
  /** write a file (path relative to the target cwd). */
  write: (path: string, content: string) => Promise<void>;
  /** read a file (null when absent) — used to MERGE the generated package.json with the app's existing one (so app-added
   *  deps/scripts survive a regenerate) and to leave an existing tsconfig/components.json untouched. Optional: without it,
   *  the config files are written as the fresh baseline. */
  read?: (path: string) => Promise<string | null>;
  log?: (msg: string) => void;
}

export interface GenerateResult {
  plan: PlatformPlan;
  added: string[];
  written: string[];
}

export async function generatePlatform(input: PlatformManifest | Platform, opts: GenerateOptions): Promise<GenerateResult> {
  const log = opts.log ?? (() => {});
  const read = opts.read ?? (async () => null);
  // pass the ORIGINAL input to planPlatform — it normalizes AND extracts `system.wire`. (Lowering to a legacy manifest here
  // would DROP the composition wires, since a lowered manifest carries no `wire`.)
  const name = isPlatform(input) ? input.brand.name : input.name;
  const plan = planPlatform(input);
  const written: string[] = [];

  // 1) the scaffold CONFIG first — so `shadcn add` has a package.json to install into + a components.json to resolve
  //    targets against. package.json MERGES with any existing (app deps/scripts survive; @suluk/* stay "latest"). An
  //    existing tsconfig/components.json is left as-is (an app may have customized them).
  const existingPkg = await read("package.json");
  log("▸ writing package.json");
  await opts.write("package.json", mergePackageJson(plan.packageJson, existingPkg));
  written.push("package.json");
  // wrangler.toml MERGES (preserve the operator's provisioned binding ids across a regen); .env.example + the env-check
  // preflight always (re)written (a template + a script, no secrets); tsconfig/components.json/.gitignore left if present.
  log("▸ writing wrangler.toml");
  await opts.write("wrangler.toml", mergeWranglerToml(plan.wranglerToml, await read("wrangler.toml")));
  written.push("wrangler.toml");
  // .gitignore MERGES (append missing entries) — ensures `.env.keys` (the PRIVATE key) + `.env.temp` are ignored. `.env`
  // itself is COMMITTED (its secret values encrypted by @suluk/env). .env.example + env.ts + env-check are always (re)written.
  log("▸ writing .gitignore");
  await opts.write(".gitignore", mergeGitignore(plan.gitignore, await read(".gitignore")));
  written.push(".gitignore");
  for (const [file, content, always] of [
    ["tsconfig.json", plan.tsconfig, false],
    ["components.json", plan.componentsJson, false],
    [".env.example", plan.envExample, true], // a checked-in keys checklist (no values)
    ["scripts/env-check.ts", plan.envCheck, true], // the encrypted-env preflight
    ["src/env.ts", plan.envTs, true], // the @suluk/env declare-once (derived from the manifest's secrets)
    ["scripts/sync-secrets.ts", plan.syncSecrets, true], // the deploy-time secret push (derived)
    ["scripts/link-key.ts", plan.linkKey, true], // register the private key into ~/.suluk/settings.json (the central store)
    ["scripts/provision.ts", plan.provisionScript, true], // the credential lifecycle (source .env.temp/.env → provision → seal)
    ["scripts/mint-tokens.ts", plan.mintTokens, true], // mint scoped least-privilege CF tokens from the master
    [".env.temp", plan.envTemp, false], // the PLAINTEXT provisioning bootstrap — SCAFFOLD IF ABSENT (gitignored; consumed by provision)
    [".env", plan.envScaffold, false], // the COMMITTED encrypted-secrets file — SCAFFOLD IF ABSENT (never clobber secrets)
  ] as const) {
    if (always || (await read(file)) == null) {
      log(`▸ writing ${file}`);
      await opts.write(file, content);
      written.push(file);
    }
  }

  // 2) the module code — shadcn add pulls each module's files + resolves registryDependencies (deps already in package.json).
  const added: string[] = [];
  for (const add of plan.adds) {
    log(`▸ shadcn add ${add}`);
    await opts.run("bunx", ["shadcn@latest", "add", add, "--yes"]);
    added.push(add);
  }

  // 3) the generated glue.
  log("▸ writing src/index.ts");
  await opts.write("src/index.ts", plan.entry);
  log("▸ writing provision.config.ts");
  await opts.write("provision.config.ts", plan.provisionConfig);
  written.push("src/index.ts", "provision.config.ts");
  // the bun MOCK-PROVIDER dev server + the state-purge helper — only when the manifest sets `local: true`.
  if (plan.devEntry) {
    log("▸ writing src/dev.ts");
    await opts.write("src/dev.ts", plan.devEntry);
    written.push("src/dev.ts");
  }
  if (plan.purgeScript) {
    log("▸ writing scripts/purge-state.ts");
    await opts.write("scripts/purge-state.ts", plan.purgeScript);
    written.push("scripts/purge-state.ts");
  }

  log(`✓ generated ${name}: ${plan.services.length} services. Next: bun install && suluk-provision apply`);
  return { plan, added, written };
}
