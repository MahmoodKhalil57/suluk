#!/usr/bin/env bun
// Build the multi-root Suluk documentation site LOCALLY and push it to GitHub Pages (main:/docs). No Actions.
//
//   bun run tooling/ts/scripts/deploy-docs.ts            # build + commit + push  (publish)
//   bun run tooling/ts/scripts/deploy-docs.ts --no-push  # build + commit only
//   bun run tooling/ts/scripts/deploy-docs.ts --dry-run  # build only, no git
//
// The site is a general "umbrella" (narrative + a Packages index) at docs/ plus one complete TypeDoc ROOT site
// per @suluk/* package at docs/packages/<name>/ — see build-docs.ts and C054.
import { $ } from "bun";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildDocs, buildMarkdown } from "./build-docs";

const tsRoot = new URL("..", import.meta.url).pathname; // tooling/ts (captured before buildDocs chdirs)
const repoRoot = join(tsRoot, "..", "..");
const docsDir = join(repoRoot, "docs");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const noPush = args.has("--no-push") || dryRun;

// 1. BUILD — the HTML umbrella (its cleanOutputDir wipes docs/) + every package root into docs/packages/<name>/.
//    buildDocs() regenerates the derived narrative (architecture D2 + the Packages index) first.
const pkgs = await buildDocs();

// 2. .nojekyll at the HTML site root (TypeDoc writes one per render via githubPages, but never assume).
await writeFile(join(docsDir, ".nojekyll"), "");

// 3. MARKDOWN MIRROR — the same content as docs/, in one navigable markdown tree with relative .md links, into
//    documentation/ (GitHub-browsable + downloadable). Not served by Pages; linked from the repo README.
await buildMarkdown();

if (dryRun) {
  console.log(`✓ dry-run: built the umbrella + ${pkgs.length} package roots into docs/ + the markdown mirror into documentation/ (no git).`);
  process.exit(0);
}

// 4. COMMIT the whole docs/ + documentation/ trees (adds, mods, AND deletes from the clean rebuilds).
$.cwd(repoRoot);
await $`git add --all docs documentation`;
const status = (await $`git status --porcelain docs documentation`.text()).trim();
if (!status) {
  console.log("✓ docs already up to date — nothing to commit.");
  process.exit(0);
}
const stamp = new Date().toISOString();
await $`git commit -m ${`docs: rebuild Pages site + markdown mirror — TypeDoc (${stamp})`}`;

// 4. PUSH — main:/docs is the live Pages source; pushing publishes it.
if (noPush) {
  console.log("✓ committed (push skipped). Run `git push` to publish.");
  process.exit(0);
}
console.log("• git push …");
await $`git push`;
console.log("✓ deployed → https://mahmoodkhalil57.github.io/suluk/");
