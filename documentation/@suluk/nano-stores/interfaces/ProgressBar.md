[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / ProgressBar

# Interface: ProgressBar

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L20)

## Properties

### $value

> **$value**: `ReadableAtom`\<`number`\>

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L22)

0 (idle) … 1 (complete). Subscribe to drive any renderer.

## Methods

### done()

> **done**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L28)

complete — snap to 100% (consumer then resets after a fade).

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L30)

back to idle (0%).

#### Returns

`void`

***

### set()

> **set**(`value`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L32)

set an explicit value (clamped 0..1).

#### Parameters

##### value

`number`

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L24)

begin — jump to a visible head (8%).

#### Returns

`void`

***

### tick()

> **tick**(): `void`

Defined in: [tooling/ts/packages/nano-stores/src/progress.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/nano-stores/src/progress.ts#L26)

advance one asymptotic step toward the 95% ceiling (call on an interval while loading).

#### Returns

`void`
