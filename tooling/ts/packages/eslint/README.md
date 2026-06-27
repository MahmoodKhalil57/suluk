# @suluk/eslint

ESLint rules for Suluk apps. **CANDIDATE tooling.**

## `composition-only`

Enforces the Suluk UI **tier discipline**: the upper tiers (pages, sections) are pure *composition* — they stack
components — while native markup and logic live **down** in blocks and extracted controllers. The rule flags, in any
file it's scoped to, anything that exceeds its per-metric budget:

| Metric        | What it catches                                              | Belongs in        |
| ------------- | ------------------------------------------------------------ | ----------------- |
| `native`      | native HTML elements (`<div>`, `<h1>`, …)                    | a block           |
| `script`      | `<script>` blocks                                            | a block + controller |
| `style`       | `<style>` blocks                                             | components/blocks |
| `handler`     | inline `on*=` handlers                                       | a block           |
| `frontmatter` | logic in the `---` frontmatter (`.map`, `=>`, `if`, `await`…)| a controller      |

Astro's page-bound `getStaticPaths` is exempt by default — it *must* live in the page module, so its logic is
legitimately page-level (toggle with `allowGetStaticPaths: false`).

### Usage (flat config)

The rule reads `.astro` **source text**, so ESLint must first be able to *parse* those files — it needs an Astro
parser for them. The simplest setup is to layer this rule on top of [`eslint-plugin-astro`](https://github.com/ota-meshi/eslint-plugin-astro)'s
`recommended` config (which wires the parser for `.astro`); then scope `composition-only` to the pages & sections tiers:

```js
import astro from "eslint-plugin-astro";
import suluk from "@suluk/eslint";

export default [
  ...astro.configs.recommended, // provides the .astro parser
  {
    files: ["src/pages/**/*.astro", "src/sections/**/*.astro"],
    plugins: { "@suluk": suluk },
    rules: { "@suluk/composition-only": "error" },
  },
];
```

(Already using `eslint-plugin-astro`? Just add the `plugins` + `rules` block above — the parser is already configured.)

### Options

```js
"@suluk/composition-only": ["error", {
  budgets: { native: 0, script: 0, style: 0, handler: 0, frontmatter: 0 }, // max allowed per metric (default 0)
  ignoreTags: ["slot", "script", "style", "template", "fragment"],          // tags not counted as native
  allowGetStaticPaths: true,                                                // exempt Astro's page-bound data contract
}]
```

The detection core is also exported as a pure, dependency-free function:

```ts
import { analyzeComposition } from "@suluk/eslint";
const violations = analyzeComposition(astroSource, { budgets: { native: 3 } });
```
