[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / previewLaunchUrl

# Function: previewLaunchUrl()

> **previewLaunchUrl**(`env`, `role`): \{ `reason`: `string`; `refused`: `true`; \} \| \{ `refused`: `false`; `url`: `string`; \}

Defined in: [cockpit/src/crosscut.ts:149](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/cockpit/src/crosscut.ts#L149)

Resolve the browser deep-link for previewing AS a role — the security-critical guard, made PURE so it is
unit-testable (the extension package has no test harness). Hard-REFUSES any non-preview env BEFORE producing
a URL (INV-08: role-preview can never target prod/local). anonymous ⇒ just the app; a role ⇒ the preview
deploy's own gated /preview/login. The extension calls this, then openExternal — it never builds the URL itself.

## Parameters

### env

#### baseUrl

`string`

#### isPreview

`boolean`

### role

`string`

## Returns

\{ `reason`: `string`; `refused`: `true`; \} \| \{ `refused`: `false`; `url`: `string`; \}
