[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / DrawerOptions

# Interface: DrawerOptions

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L14)

## Properties

### backdrop?

> `optional` **backdrop?**: [`PanelEl`](PanelEl.md) \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L18)

the dimming backdrop (clicking it closes).

***

### drawer

> **drawer**: [`PanelEl`](PanelEl.md)

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L16)

the sliding panel.

***

### hideDelayMs?

> `optional` **hideDelayMs?**: `number`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L22)

ms to wait before hard-hiding on close (matches the CSS transition; default 220).

***

### inertTargets?

> `optional` **inertTargets?**: () => `object`[]

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L24)

page-chrome elements to make `inert` while open (focus-trap + AT hide).

#### Returns

`object`[]

***

### initialFocus?

> `optional` **initialFocus?**: () => \{ `focus`: `void`; \} \| `null` \| `undefined`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L26)

element to focus on open (e.g. the close button).

#### Returns

\{ `focus`: `void`; \} \| `null` \| `undefined`

***

### onClose?

> `optional` **onClose?**: () => `void`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L29)

#### Returns

`void`

***

### onOpen?

> `optional` **onOpen?**: () => `void`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L28)

called on open / close (e.g. cart.reload() before showing).

#### Returns

`void`

***

### openClass?

> `optional` **openClass?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L20)

class toggled for the open transition (default "open").

***

### raf?

> `optional` **raf?**: (`fn`) => `void`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L31)

injectables (default the globals) — tests pass sync stand-ins.

#### Parameters

##### fn

() => `void`

#### Returns

`void`

***

### setHideTimer?

> `optional` **setHideTimer?**: (`fn`, `ms`) => `void`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L32)

#### Parameters

##### fn

() => `void`

##### ms

`number`

#### Returns

`void`
