[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / ApplyResult

# Interface: ApplyResult

Defined in: [provision/src/apply.ts:37](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/apply.ts#L37)

## Properties

### outputsByRef

> **outputsByRef**: `Record`\<`string`, `Record`\<`string`, `string`\>\>

Defined in: [provision/src/apply.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/apply.ts#L41)

every instance's resolved outputs after the run (for assertions + downstream tooling).

***

### state

> **state**: [`InstanceState`](InstanceState.md)[]

Defined in: [provision/src/apply.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/apply.ts#L39)

***

### steps

> **steps**: [`AppliedStep`](AppliedStep.md)[]

Defined in: [provision/src/apply.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/provision/src/apply.ts#L38)
