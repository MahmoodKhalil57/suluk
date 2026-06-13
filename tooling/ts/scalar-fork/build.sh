#!/usr/bin/env bash
#
# Build OUR forked Scalar = LATEST upstream + the suluk v4 patch-set → a self-hosted standalone bundle.
#
# This is how we "fork Scalar and update it properly": we never vendor a frozen copy. Each run clones the LATEST
# upstream (so we pull their improvements for free) and re-applies our small, reapplicable patches on top. If upstream
# moved the code our patch anchors, `git apply` fails loudly here — that's the signal to refresh the patch, not a
# silent divergence. Run this when bumping Scalar or editing a patch; commit the emitted bundle (or copy it where the
# consuming app self-hosts it). Heavy (~2.3 GB install, ~2 min build) — meant for a dev box / CI, not an app deploy.
#
# Requirements: git, node 20+, corepack (ships with node) → pnpm. ~3 GB free disk.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${SCALAR_WORK:-/tmp/scalar-fork-build}"
REPO="${SCALAR_REPO:-https://github.com/scalar/scalar.git}"
OUT="$HERE/dist/standalone-suluk.js"

echo "▸ pnpm via corepack"; corepack enable >/dev/null 2>&1 || npm i -g pnpm >/dev/null 2>&1

echo "▸ clone LATEST upstream → $WORK"
rm -rf "$WORK"; git clone --depth 1 "$REPO" "$WORK"

echo "▸ apply suluk patch-set"
cd "$WORK"
for p in "$HERE"/patches/*.patch; do
  echo "  • $(basename "$p")"
  git apply --3way "$p" 2>/dev/null || git apply "$p" || { echo "  ✗ patch failed — upstream likely moved; refresh $(basename "$p")"; exit 1; }
done

echo "▸ pnpm install (the long pole)"; pnpm install
echo "▸ turbo build @scalar/api-reference (+ its workspace deps, in order)"
node_modules/.bin/turbo run build --filter=@scalar/api-reference

mkdir -p "$(dirname "$OUT")"
cp "$WORK/packages/api-reference/dist/browser/standalone.js" "$OUT"
grep -q 'Suluk OpenAPI v4 contract' "$OUT" || { echo "✗ patch not present in the built bundle"; exit 1; }
echo "✓ built our patched Scalar → $OUT ($(du -h "$OUT" | cut -f1))  [latest upstream + $(ls "$HERE"/patches/*.patch | wc -l | tr -d ' ') patch(es)]"
echo "  → copy it to the consuming app's self-host slot, e.g. saasuluk/public/vendor/scalar/standalone-suluk.js"
