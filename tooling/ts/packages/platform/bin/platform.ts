#!/usr/bin/env bun
/**
 * The @suluk/platform CLI (C051) — load `platform.config.ts`, run `shadcn add` per service, write the wired entry +
 * provision.config. Then `bun install && suluk-provision apply`.
 *
 *   suluk-platform            generate from ./platform.config.ts (legacy manifest OR a { system, brand } platform)
 *   --config <path>           a different manifest
 *   suluk-platform migrate    print the C053 { system, brand } split of a legacy platform.config.ts (a starting point)
 */
import { resolve, dirname } from "node:path";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { generatePlatform } from "../src/generate";
import { isPlatform, type PlatformManifest, type Platform } from "../src/manifest";
import { liftLegacy } from "../src/resolve";

const argv = process.argv.slice(2);
const ci = argv.indexOf("--config");
const configPath = ci >= 0 ? argv[ci + 1] : "platform.config.ts";

const mod = (await import(resolve(process.cwd(), configPath))) as { default?: PlatformManifest | Platform };
if (!mod.default) {
  console.error(`✗ ${configPath} has no default export (a definePlatform(...) result)`);
  process.exit(2);
}

// `migrate` — show the { system, brand } split of a legacy manifest (does not rewrite the file; copy the output in).
if (argv[0] === "migrate") {
  const platform = isPlatform(mod.default) ? mod.default : liftLegacy(mod.default);
  console.log("// C053 { system, brand } split — a starting point; move brand-specific values into defineBrand:\n");
  console.log("export const system = defineSystem(" + JSON.stringify(platform.system, null, 2) + ");");
  console.log("export const brand = defineBrand(" + JSON.stringify(platform.brand, null, 2) + ");");
  console.log("export default definePlatform({ system, brand });");
  process.exit(0);
}

const run = (cmd: string, args: string[]): Promise<void> =>
  new Promise((res, rej) => {
    const p = Bun.spawn([cmd, ...args], { stdout: "inherit", stderr: "inherit", cwd: process.cwd() });
    p.exited.then((code) => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });

const write = async (path: string, content: string): Promise<void> => {
  const abs = resolve(process.cwd(), path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content);
};

// read a file for the merge (null when absent), so a regenerate keeps package.json deps current without dropping app extras.
const read = async (path: string): Promise<string | null> => {
  try {
    return await readFile(resolve(process.cwd(), path), "utf8");
  } catch {
    return null;
  }
};

await generatePlatform(mod.default, { run, write, read, log: (m) => console.log(m) });
