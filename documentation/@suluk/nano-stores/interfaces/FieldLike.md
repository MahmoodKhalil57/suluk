[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / FieldLike

# Interface: FieldLike

Defined in: [tooling/ts/packages/nano-stores/src/validation.ts:7](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/validation.ts#L7)

Form-error feedback primitives (saastarter parity: "invalid fields ring red + shake", "errors clear as you type").
Framework-agnostic — they toggle the SEMANTIC contract (aria-invalid + the .shake class); the LOOK is `@suluk/theme`
base CSS ([aria-invalid] destructive ring + `@keyframes` shake). So a hand-written form gets accessible, animated
validation feedback without a component framework.

## Properties

### classList?

> `optional` **classList?**: `object`

Defined in: [tooling/ts/packages/nano-stores/src/validation.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/validation.ts#L10)

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

## Methods

### removeAttribute()

> **removeAttribute**(`name`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/validation.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/validation.ts#L9)

#### Parameters

##### name

`string`

#### Returns

`void`

***

### setAttribute()

> **setAttribute**(`name`, `value`): `void`

Defined in: [tooling/ts/packages/nano-stores/src/validation.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/fe6f559442a0c0faed05a49bbb88d075a56ea812/tooling/ts/packages/nano-stores/src/validation.ts#L8)

#### Parameters

##### name

`string`

##### value

`string`

#### Returns

`void`
