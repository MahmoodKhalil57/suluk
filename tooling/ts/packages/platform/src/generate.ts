/**
 * The generator (C051) — the impure shell over {@link planPlatform}: run the `shadcn add`s (which fetch each module's
 * owned code + install its npm deps + resolve registryDependencies), then write the generated entry + provision.config.
 * `run` + `write` are INJECTED (the CLI provides a real spawn + fs; a test provides recorders), so the orchestration is
 * testable. Stops short of `provision apply` — that's a live infra op the operator triggers.
 */
import type { PlatformManifest } from "./manifest";
import { planPlatform, type PlatformPlan } from "./plan";

export interface GenerateOptions {
  /** run a command — the CLI spawns `bunx shadcn add <ref>`; a test records. */
  run: (cmd: string, args: string[]) => Promise<void>;
  /** write a file (path relative to the target cwd). */
  write: (path: string, content: string) => Promise<void>;
  log?: (msg: string) => void;
}

export interface GenerateResult {
  plan: PlatformPlan;
  added: string[];
  written: string[];
}

export async function generatePlatform(manifest: PlatformManifest, opts: GenerateOptions): Promise<GenerateResult> {
  const log = opts.log ?? (() => {});
  const plan = planPlatform(manifest);
  const added: string[] = [];
  for (const add of plan.adds) {
    log(`▸ shadcn add ${add}`);
    await opts.run("bunx", ["shadcn@latest", "add", add, "--yes"]);
    added.push(add);
  }
  log("▸ writing src/index.ts");
  await opts.write("src/index.ts", plan.entry);
  log("▸ writing provision.config.ts");
  await opts.write("provision.config.ts", plan.provisionConfig);
  log(`✓ generated ${manifest.name}: ${plan.services.length} services. Next: bun install && suluk-provision apply`);
  return { plan, added, written: ["src/index.ts", "provision.config.ts"] };
}
