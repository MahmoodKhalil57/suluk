[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/eslint](../README.md) / Metric

# Type Alias: Metric

> **Metric** = `"native"` \| `"script"` \| `"style"` \| `"handler"` \| `"frontmatter"`

Defined in: [analyze.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/eslint/src/analyze.ts#L13)

Pure detection core for the tier-composition rule — separated from the ESLint wrapper so it is unit-testable WITHOUT
an ESLint / astro-parser harness (Workers-safe, zero deps). Given an `.astro` source + per-metric budgets, it returns
the violations: native HTML elements, `<script>` / `<style>` blocks, inline `on*=` handlers, and logic in the `---`
frontmatter that EXCEED their budget. The tier discipline: pages & sections compose; markup belongs DOWN in a block,
logic in an extracted controller. Astro's page-bound `getStaticPaths` is exempt by default (it can't live elsewhere).

Detection mirrors the original toolfactory `check-ui-complexity` regexes; the generalization is the per-metric budget
(default 0 = composition-only) + a configurable ignore-tag set + the getStaticPaths toggle. Length-preserving masking
keeps match indices aligned to the original source so the ESLint wrapper can report at the exact location.
