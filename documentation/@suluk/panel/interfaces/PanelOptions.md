[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/panel](../README.md) / PanelOptions

# Interface: PanelOptions

Defined in: [app.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L28)

## Properties

### authorize?

> `optional` **authorize?**: (`c`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [app.ts:35](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L35)

Gate — return true to allow. Default: deny everything.

#### Parameters

##### c

`Context`

#### Returns

`boolean` \| `Promise`\<`boolean`\>

***

### basePath?

> `optional` **basePath?**: `string`

Defined in: [app.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L31)

***

### document

> **document**: [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| ((`c`) => [`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md) \| `Promise`\<[`OpenAPIv4Document`](../../core/interfaces/OpenAPIv4Document.md)\>)

Defined in: [app.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L30)

The v4 document — a value, or a per-request function (e.g. return projectDocument(doc, roleOf(c))).

***

### groups?

> `optional` **groups?**: [`PanelGroup`](PanelGroup.md)[] \| ((`c`) => [`PanelGroup`](PanelGroup.md)[] \| `Promise`\<[`PanelGroup`](PanelGroup.md)[]\>)

Defined in: [app.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L48)

***

### headHtml?

> `optional` **headHtml?**: `string` \| ((`c`) => `string`)

Defined in: [app.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L37)

Injected into <head> after the default theme (link a color-scheme sheet + stamper to follow the host theme).

***

### hide?

> `optional` **hide?**: `string`[]

Defined in: [app.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L39)

Field names to omit from every entity.

***

### hideEntities?

> `optional` **hideEntities?**: `string`[]

Defined in: [app.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L41)

Entity names to omit from the panel entirely (e.g. ones you handle via a custom `section` instead).

***

### home?

> `optional` **home?**: (`c`) => `string` \| `Promise`\<`string`\>

Defined in: [app.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L52)

Replace the auto-generated home (stat cards + entity/section cards) with a BESPOKE overview — your product's
 landing page (welcome, recent activity, recommendations, quick actions). Stat cards, when set, render above it.

#### Parameters

##### c

`Context`

#### Returns

`string` \| `Promise`\<`string`\>

***

### homeHeading?

> `optional` **homeHeading?**: `string` \| ((`c`) => `string` \| `Promise`\<`string`\>)

Defined in: [app.ts:54](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L54)

Heading on the dashboard home (default "Dashboard").

***

### homeLabel?

> `optional` **homeLabel?**: `string`

Defined in: [app.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L56)

Label of the home nav link (default "Dashboard").

***

### sections?

> `optional` **sections?**: [`PanelSection`](PanelSection.md)[] \| ((`c`) => [`PanelSection`](PanelSection.md)[] \| `Promise`\<[`PanelSection`](PanelSection.md)[]\>)

Defined in: [app.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L49)

***

### stats?

> `optional` **stats?**: [`StatCard`](StatCard.md)[] \| ((`c`) => [`StatCard`](StatCard.md)[] \| `Promise`\<[`StatCard`](StatCard.md)[]\>)

Defined in: [app.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L47)

Dashboard-framework extras (all optional — omit for a plain CRUD admin). Each may be a per-request FUNCTION so
 the dashboard adapts to WHO is logged in — a bespoke, role-dependent product dashboard, not a generic CRUD index.

***

### title?

> `optional` **title?**: `string`

Defined in: [app.ts:33](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L33)

Brand shown in the sidebar + titles.

***

### uploadPath?

> `optional` **uploadPath?**: `string`

Defined in: [app.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/panel/src/app.ts#L44)

Endpoint that accepts a `multipart/form-data` `file` and returns `{ url }` — enables the media field's upload
 button (e.g. an R2-backed worker route). Omit and media fields are paste-a-URL only.
