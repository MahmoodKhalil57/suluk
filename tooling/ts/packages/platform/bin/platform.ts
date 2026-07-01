#!/usr/bin/env bun
/**
 * The @suluk/platform CLI (C051) — load `platform.config.ts`, run `shadcn add` per service, write the wired entry +
 * provision.config. Then `bun install && suluk-provision apply`.
 *
 *   suluk-platform            generate from ./platform.config.ts
 *   --config <path>           a different manifest
 */
import { resolve, dirname } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { generatePlatform } from "../src/generate";
import type { PlatformManifest } from "../src/manifest";

const argv = process.argv.slice(2);
const ci = argv.indexOf("--config");
const configPath = ci >= 0 ? argv[ci + 1] : "platform.config.ts";

const mod = (await import(resolve(process.cwd(), configPath))) as { default?: PlatformManifest };
if (!mod.default) {
  console.error(`✗ ${configPath} has no default export (a definePlatform(...) result)`);
  process.exit(2);
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

await generatePlatform(mod.default, { run, write, log: (m) => console.log(m) });
