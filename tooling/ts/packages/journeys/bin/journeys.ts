#!/usr/bin/env bun
/**
 * @suluk/journeys CLI. Today: `demos` — compile Gherkin `.feature` files into a Bruno/Postman demo collection.
 *
 *   journeys demos --doc <openapi.json> --features <dir-or-file>... --out <dir>
 *                  [--format bruno|postman|both] [--name <name>] [--base-url <prodURL>] [--local-base-url <localURL>]
 *
 * `--doc` is a v4 contract (JSON/YAML); generate it from your app (e.g. toolfactory serves `/api/openapi.json`).
 * `--features` may be repeated and may name a directory (all `*.feature` under it) or a single file.
 * The same collection runs against `--local-base-url` (dev rehearsal) or `--base-url` (the live prod demo).
 */
import { statSync } from "node:fs";
import { join } from "node:path";
import { buildDemoFiles, type DemoFormat } from "../src/cli";

const USAGE = `journeys demos --doc <openapi.json> --features <dir-or-file>... --out <dir>
               [--format bruno|postman|both] [--name <name>] [--base-url <prodURL>] [--local-base-url <localURL>]`;

function parseFlags(args: string[]): { cmd?: string; flags: Record<string, string[]> } {
  const flags: Record<string, string[]> = {};
  let cmd: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const key = eq >= 0 ? a.slice(2, eq) : a.slice(2);
      const val = eq >= 0 ? a.slice(eq + 1) : args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
      (flags[key] ??= []).push(val);
    } else if (!cmd) {
      cmd = a;
    }
  }
  return { cmd, flags };
}

const one = (flags: Record<string, string[]>, key: string): string | undefined => flags[key]?.[0];

async function loadFeatureTexts(paths: string[]): Promise<string[]> {
  const texts: string[] = [];
  for (const p of paths) {
    let st;
    try {
      st = statSync(p);
    } catch {
      throw new Error(`--features path not found: ${p}`);
    }
    if (st.isDirectory()) {
      const glob = new Bun.Glob("**/*.feature");
      let found = 0;
      for await (const f of glob.scan({ cwd: p, absolute: true })) {
        texts.push(await Bun.file(f).text());
        found++;
      }
      if (!found) throw new Error(`no *.feature files under ${p}`);
    } else {
      texts.push(await Bun.file(p).text());
    }
  }
  return texts;
}

async function demosCommand(flags: Record<string, string[]>): Promise<number> {
  const docPath = one(flags, "doc");
  const featurePaths = flags.features ?? [];
  const out = one(flags, "out");
  const format = (one(flags, "format") ?? "both") as DemoFormat;
  if (!docPath || !featurePaths.length || !out) {
    console.error("error: --doc, --features and --out are required.\n\n" + USAGE);
    return 1;
  }
  if (!["bruno", "postman", "both"].includes(format)) {
    console.error(`error: --format must be bruno|postman|both (got ${format}).`);
    return 1;
  }
  const docText = await Bun.file(docPath).text();
  const featureTexts = await loadFeatureTexts(featurePaths);
  const result = buildDemoFiles(docText, featureTexts, {
    format,
    name: one(flags, "name"),
    baseUrl: one(flags, "base-url"),
    localBaseUrl: one(flags, "local-base-url"),
  });
  if (!result.scenarios) {
    console.error("warning: no scenarios bound a When-operation — nothing to emit. Check the .feature steps against the contract's vocabulary.");
    return 1;
  }
  for (const [rel, content] of Object.entries(result.files)) await Bun.write(join(out, rel), content);
  console.log(`✓ ${result.scenarios} scenario(s), ${result.requests} request(s) → ${Object.keys(result.files).length} file(s) in ${out}/`);
  return 0;
}

const { cmd, flags } = parseFlags(process.argv.slice(2));
try {
  if (cmd === "demos") {
    process.exit(await demosCommand(flags));
  } else {
    console.log(`@suluk/journeys CLI\n\nUsage:\n  ${USAGE}`);
    process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  console.error(`error: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
