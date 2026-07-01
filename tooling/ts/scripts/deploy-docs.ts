#!/usr/bin/env bun
// Build the docs site LOCALLY and push it to the GitHub Pages source (main:/docs).
// No GitHub Actions — this is the whole deploy. Pages serves main:/docs as-is.
//
//   bun run tooling/ts/scripts/deploy-docs.ts            # build + commit + push
//   bun run tooling/ts/scripts/deploy-docs.ts --no-push  # build + commit only
//   bun run tooling/ts/scripts/deploy-docs.ts --dry-run  # build only, no git
//
import { $ } from "bun";
import { rm, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const repoRoot = join(new URL("..", import.meta.url).pathname, "..", "..");
const outDir = join(repoRoot, "docs");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const noPush = args.has("--no-push") || dryRun;

$.cwd(repoRoot);

// 1. CLEAN — wipe docs/ so stale files from the old bespoke generator can't linger.
//    Keep .git out of harm's way (docs/ is a normal tracked dir, not a submodule).
console.log("• cleaning docs/ …");
await rm(outDir, { recursive: true, force: true });

// 2. BUILD — TypeDoc renders API reference into docs/. TypeDoc wipes its own
//    output dir on start, which is exactly why .nojekyll must be written AFTER this.
console.log("• typedoc → docs/ …");
await $`bunx typedoc`; // config lives in typedoc.json (out: "docs")

// 3. .nojekyll — MANDATORY. Without it, Pages runs the file tree through Jekyll,
//    which silently drops any file/dir whose name starts with "_" (TypeDoc emits
//    _client/ assets and similar). Empty file is the whole contract.
console.log("• writing docs/.nojekyll …");
await writeFile(join(outDir, ".nojekyll"), "");

if (dryRun) {
  const entries = await readdir(outDir);
  console.log(`✓ dry-run: built ${entries.length} top-level entries in docs/`);
  process.exit(0);
}

// 4. COMMIT — stage the whole docs/ tree (adds, mods, AND deletes from the clean).
console.log("• git add docs …");
await $`git add --all docs`;

// Nothing changed? Don't create an empty commit.
const status = (await $`git status --porcelain docs`.text()).trim();
if (!status) {
  console.log("✓ docs already up to date — nothing to commit.");
  process.exit(0);
}

const stamp = new Date().toISOString();
await $`git commit -m ${`docs: rebuild Pages site (${stamp})`}`;

// 5. PUSH — main:/docs is the live Pages source; push publishes it.
if (noPush) {
  console.log("✓ committed (push skipped). Run `git push` to publish.");
  process.exit(0);
}
console.log("• git push …");
await $`git push`;
console.log("✓ deployed → https://mahmoodkhalil57.github.io/suluk/");
