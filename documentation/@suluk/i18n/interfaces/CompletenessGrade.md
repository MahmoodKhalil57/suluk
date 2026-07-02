[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / CompletenessGrade

# Interface: CompletenessGrade

Defined in: [messages.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L48)

## Properties

### extra

> **extra**: `string`[]

Defined in: [messages.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L57)

keys present here but not in the default (stale / typo'd).

***

### grade

> **grade**: `number`

Defined in: [messages.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L59)

translated / total, in [0, 1] (1 when the default is empty).

***

### locale

> **locale**: `string`

Defined in: [messages.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L49)

***

### missing

> **missing**: `string`[]

Defined in: [messages.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L55)

keys in the default catalog absent or empty here.

***

### total

> **total**: `number`

Defined in: [messages.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L51)

keys in the default catalog (the target).

***

### translated

> **translated**: `number`

Defined in: [messages.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/i18n/src/messages.ts#L53)

keys present AND non-empty in this locale.
