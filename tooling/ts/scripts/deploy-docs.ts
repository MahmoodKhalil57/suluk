#!/usr/bin/env bun
// Build the unified Suluk documentation site LOCALLY and push it to the GitHub Pages source (main:/docs).
// No GitHub Actions — this script IS the whole deploy. Pages serves main:/docs as-is.
//
//   bun run tooling/ts/scripts/deploy-docs.ts            # build + commit + push  (publish)
//   bun run tooling/ts/scripts/deploy-docs.ts --no-push  # build + commit only
//   bun run tooling/ts/scripts/deploy-docs.ts --dry-run  # build only, no git
//
// The site is one TypeDoc render (typedoc.json, entryPointStrategy "packages"): a narrative home + guide
// pages (readme + projectDocuments) followed by the full @suluk/* API reference, themed with
// typedoc-github-theme + the vscode-icons icon plugin. See C054.
import { $ } from "bun";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const tsRoot = new URL("..", import.meta.url).pathname; // tooling/ts
const repoRoot = join(tsRoot, "..", "..");
const docsDir = join(repoRoot, "docs");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const noPush = args.has("--no-push") || dryRun;

// 1. NARRATIVE — regenerate the one derived guide page (architecture.md + its fresh D2 dependency graph),
//    so the diagram can never drift from the actual @suluk/* graph. The other guides are static.
console.log("• narrative pages (architecture + D2 graph) …");
await $`bun scripts/gen-doc-pages.ts`.cwd(tsRoot);

// 2. BUILD — TypeDoc renders the whole site into docs/. `cleanOutputDir` wipes docs/ first (so stale files
//    from any prior generator can't linger), and `githubPages` writes docs/.nojekyll. Run from tsRoot so the
//    config + the local ./scripts/*.mjs plugins resolve and out:"../../docs" lands at the repo docs/.
console.log("• typedoc → docs/ …");
await $`bunx typedoc`.cwd(tsRoot);

// 3. .nojekyll — TypeDoc writes it via githubPages, but never assume: Pages silently drops `_`-prefixed
//    paths without it, and TypeDoc emits asset dirs. An empty file is the whole contract.
await writeFile(join(docsDir, ".nojekyll"), "");

if (dryRun) {
  console.log("✓ dry-run: built docs/ (no git).");
  process.exit(0);
}

// 4. COMMIT — stage the whole docs/ tree (adds, mods, AND deletes from the clean rebuild).
$.cwd(repoRoot);
await $`git add --all docs`;
const status = (await $`git status --porcelain docs`.text()).trim();
if (!status) {
  console.log("✓ docs already up to date — nothing to commit.");
  process.exit(0);
}
const stamp = new Date().toISOString();
await $`git commit -m ${`docs: rebuild Pages site — TypeDoc unified (${stamp})`}`;

// 5. PUSH — main:/docs is the live Pages source; pushing publishes it.
if (noPush) {
  console.log("✓ committed (push skipped). Run `git push` to publish.");
  process.exit(0);
}
console.log("• git push …");
await $`git push`;
console.log("✓ deployed → https://mahmoodkhalil57.github.io/suluk/");
