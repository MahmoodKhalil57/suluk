/**
 * The generator (C051) — the impure shell over {@link planPlatform}: run the `shadcn add`s (which fetch each module's
 * owned code + install its npm deps + resolve registryDependencies), then write the generated entry + provision.config.
 * `run` + `write` are INJECTED (the CLI provides a real spawn + fs; a test provides recorders), so the orchestration is
 * testable. Stops short of `provision apply` — that's a live infra op the operator triggers.
 */
import type { PlatformManifest } from "./manifest";
import { planPlatform, mergePackageJson, type PlatformPlan } from "./plan";

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

export async function generatePlatform(manifest: PlatformManifest, opts: GenerateOptions): Promise<GenerateResult> {
  const log = opts.log ?? (() => {});
  const read = opts.read ?? (async () => null);
  const plan = planPlatform(manifest);
  const written: string[] = [];

  // 1) the scaffold CONFIG first — so `shadcn add` has a package.json to install into + a components.json to resolve
  //    targets against. package.json MERGES with any existing (app deps/scripts survive; @suluk/* stay "latest"). An
  //    existing tsconfig/components.json is left as-is (an app may have customized them).
  const existingPkg = await read("package.json");
  log("▸ writing package.json");
  await opts.write("package.json", mergePackageJson(plan.packageJson, existingPkg));
  written.push("package.json");
  for (const [file, content] of [["tsconfig.json", plan.tsconfig], ["components.json", plan.componentsJson]] as const) {
    if ((await read(file)) == null) {
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

  log(`✓ generated ${manifest.name}: ${plan.services.length} services. Next: bun install && suluk-provision apply`);
  return { plan, added, written };
}
