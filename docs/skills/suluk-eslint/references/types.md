# Types & Enums

## analyze

### `Violation`
**Properties:**
- `metric: Metric`
- `index: number` — Char offset into the original source (for the ESLint wrapper's getLocFromIndex).
- `length: number`
- `data: { tag?: string; attr?: string; token?: string }` — Message interpolation data: tag (native), attr (handler), or token (frontmatter).

### `Metric`
Pure detection core for the tier-composition rule — separated from the ESLint wrapper so it is unit-testable WITHOUT
an ESLint / astro-parser harness (Workers-safe, zero deps). Given an `.astro` source + per-metric budgets, it returns
the violations: native HTML elements, `<script>` / `<style>` blocks, inline `on*=` handlers, and logic in the `---`
frontmatter that EXCEED their budget. The tier discipline: pages & sections compose; markup belongs DOWN in a block,
logic in an extracted controller. Astro's page-bound `getStaticPaths` is exempt by default (it can't live elsewhere).

Detection mirrors the original toolfactory `check-ui-complexity` regexes; the generalization is the per-metric budget
(default 0 = composition-only) + a configurable ignore-tag set + the getStaticPaths toggle. Length-preserving masking
keeps match indices aligned to the original source so the ESLint wrapper can report at the exact location.
```ts
"native" | "script" | "style" | "handler" | "frontmatter"
```
