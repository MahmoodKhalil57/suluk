---
description: "ESLint rules for Suluk apps. `composition-only`: enforce the tier discipline (pages & sections stay composition-only; native markup → blocks, logic → controllers) with configurable per-metric budgets. Pure, dependency-free detection core. CANDIDATE tooling."
name: suluk-eslint
---

# @suluk/eslint

ESLint rules for Suluk apps. `composition-only`: enforce the tier discipline (pages & sections stay composition-only; native markup → blocks, logic → controllers) with configurable per-metric budgets. Pure, dependency-free detection core. CANDIDATE tooling.

## Configuration

**CompositionOptions** (3 options — see references/config.md)

## Quick Reference

**analyze:** `analyzeComposition` (Collect every violation, then apply each metric's budget (report only the occurrences BEYOND the budget)), `Violation`, `Metric` (Pure detection core for the tier-composition rule — separated from the ESLint wrapper so it is unit-testable WITHOUT
an ESLint / astro-parser harness (Workers-safe, zero deps))
**composition-only:** `compositionOnly`
`default`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)