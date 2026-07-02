[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/admin](../README.md) / AdminOptions

# Interface: AdminOptions

Defined in: [app.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/app.ts#L16)

`@suluk/admin` — the /superadmin web admin panel. The SAME cockpit as the vscode extension (@suluk/cockpit
core), rendered as Hono-served web pages and gated to superadmins. One brain, two faces. Mount it on your
app: `app.route("/", adminApp({ document, authorize }))`. CANDIDATE tooling — NOT official OAS.

## Properties

### authorize?

> `optional` **authorize?**: (`c`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [app.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/app.ts#L22)

Gate: return true to allow. Wire to your auth (superadmin only). DEFAULT: deny everything.

#### Parameters

##### c

`Context`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### basePath?

> `optional` **basePath?**: `string`

Defined in: [app.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/app.ts#L20)

Mount path (default "/superadmin").

***

### document

> **document**: [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| ((`c`) => [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| `Promise`\<[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)\>)

Defined in: [app.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/app.ts#L18)

The hub v4 document — a value, or a function (so the panel reflects live state per request).

***

### headHtml?

> `optional` **headHtml?**: `string` \| ((`c`) => `string`)

Defined in: [app.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/app.ts#L27)

Extra HTML injected into <head> AFTER the default theme — link a stylesheet (e.g. a color-scheme sheet) and a
 no-flash theme stamper so the panel obeys the host app's light/dark + color scheme instead of the built-in.

***

### title?

> `optional` **title?**: `string`

Defined in: [app.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/admin/src/app.ts#L24)

Page title.
