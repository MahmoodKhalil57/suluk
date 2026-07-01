[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / PanelEl

# Interface: PanelEl

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L8)

createDrawer — the reusable open/close controller behind any slide-in panel (cart, mobile nav, a Sheet): toggles
the panel + backdrop visibility and an `open` class (for the CSS transition), makes the page chrome `inert` while
open (a real focus-trap + AT hide — honoring aria-modal), closes on Escape + backdrop click, and restores focus on
close. Framework-agnostic; the look + the RTL-aware slide direction live in CSS. Timing is injectable so the
open/close state machine is unit-testable without a real DOM.

## Properties

### classList

> **classList**: `object`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L10)

#### add()

> **add**(`c`): `void`

##### Parameters

###### c

`string`

##### Returns

`void`

#### remove()

> **remove**(`c`): `void`

##### Parameters

###### c

`string`

##### Returns

`void`

***

### hidden

> **hidden**: `boolean`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L9)

## Methods

### setAttribute()

> **setAttribute**(`name`, `value`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/drawer.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/nano-stores/src/drawer.ts#L11)

#### Parameters

##### name

`string`

##### value

`string`

#### Returns

`void`
