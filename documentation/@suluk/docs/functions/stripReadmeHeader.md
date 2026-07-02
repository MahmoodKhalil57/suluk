[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/docs](../README.md) / stripReadmeHeader

# Function: stripReadmeHeader()

> **stripReadmeHeader**(`md`): `string`

Defined in: [harvest.ts:74](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/docs/src/harvest.ts#L74)

Strip a README's leading branding/header chrome so it integrates under the site's own page title without a
duplicate logo + H1. Handles both house styles: the centered-logo HTML header (`<p align="center">…</p>` +
`<h1 align="center">` + taglines + `---`) and the plain `# @pkg` H1 followed by a bold one-line value-prop.
Everything from the first real content line (the CANDIDATE note / intro prose / first `##`) is kept.

## Parameters

### md

`string`

## Returns

`string`
