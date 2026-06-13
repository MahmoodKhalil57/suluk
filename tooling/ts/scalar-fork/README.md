# scalar-fork — our forked Scalar, built from latest + suluk v4 patches

We don't vendor a frozen Scalar. We **build from latest upstream** and re-apply a small patch-set, so we stay current
(pull upstream improvements) while carrying our OpenAPI-v4 / suluk features. This is the proper "fork + keep updated."

## Layout

- `patches/*.patch` — our changes against Scalar's source, as `git apply`-able diffs. Keep them **small + boundary-level**
  (e.g. Scalar's public `createApiReference` + its component **slots**) so they survive upstream churn.
- `build.sh` — clone latest Scalar → apply patches → `pnpm install` → `turbo build @scalar/api-reference` → emit
  `dist/standalone-suluk.js`.
- `dist/standalone-suluk.js` — the built, patched standalone bundle (self-hosted by the consuming app).

## Build / update from upstream

```bash
bash tooling/ts/scalar-fork/build.sh        # clones LATEST upstream + applies patches + builds
# then copy the bundle where the app self-hosts it:
cp tooling/ts/scalar-fork/dist/standalone-suluk.js \
   ~/apps/saasuluk/public/vendor/scalar/standalone-suluk.js
```

`build.sh` clones latest each run = **the upstream pull**. If a patch no longer applies, the script fails loudly →
refresh that patch against the new source (re-make the edit, `git diff > patches/000N-*.patch`). Heavy (~2.3 GB
install, ~2 min) → run on a dev box / CI, not in an app deploy.

## Patches

### 0001-suluk-v4-content-panel
Injects the v4 superpowers into Scalar's own `content-start` **slot** (the public component slot API — stable) at the
`createApiReference` boundary, as a **fragment** (array of vnodes):
1. a native **"⛬ Suluk OpenAPI v4 contract"** facet-summary panel (cost-metered + access-scoped; N of M operations
   priced; an access/cost legend), and
2. a collapsed **"⚡ v4 Insights"** bar — an iframe to the host's role-projected `x-suluk-insights` URL carrying the
   cost-explorer / reachability / ADA / hardening panels.

Both are styled with Scalar's `--scalar-*` design tokens so they read as part of Scalar. Self-contained (no extra
deps). Everything goes through `content-start` because it's empirically the only slot that mounts reliably in this
build's modern layout — manually-passed object slots for `footer` / `content-end` do **not** surface through
`v-if="$slots.footer"` / `<Content #end>` in the production Vue bundle.

> **Patch hygiene (important):** regenerate this patch only from a **pristine** upstream checkout —
> `git diff -- packages/api-reference/src/standalone/lib/html-api.ts > patches/0001-….patch` on a tree with no other
> patch applied. A diff taken from an already-patched tree fails `git apply` against fresh upstream (it expects the
> prior patch's lines as context — exactly what bit us once). `build.sh` checks the patch re-applies; refresh from
> pristine if it fails.

Deeper patches (request-name identity, multi-request-per-method) extend the same slot/boundary approach.
