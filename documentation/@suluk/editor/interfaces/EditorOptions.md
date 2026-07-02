[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/editor](../README.md) / EditorOptions

# Interface: EditorOptions

Defined in: [index.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L15)

## Properties

### brand?

> `optional` **brand?**: `string`

Defined in: [index.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L19)

Brand shown in the toolbar (default "Suluk").

***

### clientSrc?

> `optional` **clientSrc?**: `string`

Defined in: [index.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L23)

URL of the built editor client bundle (this package's dist/editor.client.js). Default "/editor.client.js".

***

### customCss?

> `optional` **customCss?**: `string`

Defined in: [index.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L31)

Extra CSS appended to the page.

***

### examples?

> `optional` **examples?**: [`EditorExample`](EditorExample.md)[]

Defined in: [index.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L27)

Seed documents for the Examples dropdown (default: this package's examples).

***

### faviconHref?

> `optional` **faviconHref?**: `string`

Defined in: [index.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L25)

Favicon href.

***

### forkSrc?

> `optional` **forkSrc?**: `string`

Defined in: [index.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L21)

URL of the suluk Scalar fork standalone bundle (defines window.Scalar). Default "/vendor/scalar/standalone-suluk.js".

***

### initialDoc?

> `optional` **initialDoc?**: `unknown`

Defined in: [index.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L29)

Document the editor opens with when there is no ?url=, #share, or saved draft. Default: the Suluk Galaxy example.

***

### pageTitle?

> `optional` **pageTitle?**: `string`

Defined in: [index.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/editor/src/index.ts#L17)

Browser <title> + toolbar heading suffix.
