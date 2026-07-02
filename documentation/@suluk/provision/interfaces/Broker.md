[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/provision](../README.md) / Broker

# Interface: Broker

Defined in: [provision/src/types.ts:116](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L116)

The OSB-shaped broker every service implements. Provision MUST be idempotent (re-running reconciles, never duplicates —
OSB's "200 vs 201" rule). `lastOperation`/`bind`/`deprovision` are optional: a synchronous, non-bindable, or
never-torn-down service simply omits them.

## Methods

### bind()?

> `optional` **bind**(`req`): `Promise`\<[`BindResult`](BindResult.md)\>

Defined in: [provision/src/types.ts:124](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L124)

Bind (OSB): generate the credentials / config the platform + downstream instances consume. Optional (non-bindable).

#### Parameters

##### req

[`BindRequest`](BindRequest.md)

#### Returns

`Promise`\<[`BindResult`](BindResult.md)\>

***

### catalog()

> **catalog**(): [`Catalog`](Catalog.md) \| `Promise`\<[`Catalog`](Catalog.md)\>

Defined in: [provision/src/types.ts:118](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L118)

OSB Catalog — what this broker can provision.

#### Returns

[`Catalog`](Catalog.md) \| `Promise`\<[`Catalog`](Catalog.md)\>

***

### deprovision()?

> `optional` **deprovision**(`req`): `Promise`\<\{ `operation?`: `string`; `state`: [`OperationState`](../type-aliases/OperationState.md); \}\>

Defined in: [provision/src/types.ts:126](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L126)

Deprovision (OSB): tear down the Service Instance. Optional — orphan mitigation, `apply --prune`, + `teardown` call it.

#### Parameters

##### req

[`OperationRequest`](OperationRequest.md)

#### Returns

`Promise`\<\{ `operation?`: `string`; `state`: [`OperationState`](../type-aliases/OperationState.md); \}\>

***

### fetch()?

> `optional` **fetch**(`req`): `Promise`\<\{ `exists`: `boolean`; `outputs?`: `Record`\<`string`, `string`\>; \}\>

Defined in: [provision/src/types.ts:129](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L129)

Fetch a Service Instance (OSB): the live state of a KNOWN instance — used by `pull` to detect EXTERNAL drift (a
 resource deleted/changed in the provider's dashboard, behind the config's back). Optional; absent → "unknown".

#### Parameters

##### req

[`OperationRequest`](OperationRequest.md)

#### Returns

`Promise`\<\{ `exists`: `boolean`; `outputs?`: `Record`\<`string`, `string`\>; \}\>

***

### lastOperation()?

> `optional` **lastOperation**(`req`): `Promise`\<\{ `description?`: `string`; `state`: [`OperationState`](../type-aliases/OperationState.md); \}\>

Defined in: [provision/src/types.ts:122](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L122)

Poll an async provision (OSB last-operation). Required only for brokers that return `state: "in progress"`.

#### Parameters

##### req

[`OperationRequest`](OperationRequest.md)

#### Returns

`Promise`\<\{ `description?`: `string`; `state`: [`OperationState`](../type-aliases/OperationState.md); \}\>

***

### list()?

> `optional` **list**(): `Promise`\<`object`[]\>

Defined in: [provision/src/types.ts:132](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L132)

Discover existing instances of this service — used by `pull --discover` to ADOPT untracked resources into the
 journal. Optional; absent → discovery skipped for this service.

#### Returns

`Promise`\<`object`[]\>

***

### provision()

> **provision**(`req`): `Promise`\<[`ProvisionResult`](../type-aliases/ProvisionResult.md)\>

Defined in: [provision/src/types.ts:120](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/provision/src/types.ts#L120)

Provision (idempotent): create the Service Instance, or reconcile an existing one. Sync or async.

#### Parameters

##### req

[`ProvisionRequest`](ProvisionRequest.md)

#### Returns

`Promise`\<[`ProvisionResult`](../type-aliases/ProvisionResult.md)\>
