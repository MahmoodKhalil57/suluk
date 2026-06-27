/**
 * @suluk/eslint — ESLint rules for Suluk apps. CANDIDATE tooling.
 *
 * `composition-only`: the tier-composition rule (pages & sections stay composition-only; markup → blocks, logic →
 * controllers). The detection core ({@link analyzeComposition}) is a pure, dependency-free function you can also call
 * directly. Use as a flat-config plugin:
 *
 *   import suluk from "@suluk/eslint";
 *   export default [{ files: ["src/pages/**", "src/sections/**"], plugins: { "@suluk": suluk },
 *                     rules: { "@suluk/composition-only": "error" } }];
 */
import { compositionOnly } from "./composition-only";

export { analyzeComposition, type CompositionOptions, type Violation, type Metric } from "./analyze";
export { compositionOnly } from "./composition-only";

const plugin = { rules: { "composition-only": compositionOnly } };
export default plugin;
