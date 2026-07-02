[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / mergePackageJson

# Function: mergePackageJson()

> **mergePackageJson**(`baselineJson`, `existingJson`): `string`

Defined in: [plan.ts:575](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/plan.ts#L575)

Merge the generated framework baseline package.json with the app's EXISTING one (if any). The baseline WINS for the
framework + module deps (so `@suluk/*` stay `"latest"` and the ecosystem stays on its pinned range — deps stay current
across a regenerate), while any deps / scripts / top-level fields the app added are PRESERVED. No existing ⇒ the baseline
verbatim. Keys are sorted for stable output. Pure + testable.

## Parameters

### baselineJson

`string`

### existingJson

`string` \| `null`

## Returns

`string`
