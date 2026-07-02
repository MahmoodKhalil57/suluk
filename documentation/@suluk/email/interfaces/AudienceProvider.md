[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / AudienceProvider

# Interface: AudienceProvider

Defined in: [audience.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/email/src/audience.ts#L25)

The swappable audience binding — mirror contacts to an email-provider audience/list.

## Properties

### id

> `readonly` **id**: `string`

Defined in: [audience.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/email/src/audience.ts#L27)

a stable id (e.g. "resend", "console").

## Methods

### remove()

> **remove**(`audienceId`, `email`): `Promise`\<[`AudienceResult`](AudienceResult.md)\>

Defined in: [audience.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/email/src/audience.ts#L31)

remove (or unsubscribe) a contact from the audience.

#### Parameters

##### audienceId

`string`

##### email

`string`

#### Returns

`Promise`\<[`AudienceResult`](AudienceResult.md)\>

***

### upsert()

> **upsert**(`audienceId`, `contact`): `Promise`\<[`AudienceResult`](AudienceResult.md)\>

Defined in: [audience.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/email/src/audience.ts#L29)

add or update a contact in the audience (idempotent upsert).

#### Parameters

##### audienceId

`string`

##### contact

[`AudienceContact`](AudienceContact.md)

#### Returns

`Promise`\<[`AudienceResult`](AudienceResult.md)\>
