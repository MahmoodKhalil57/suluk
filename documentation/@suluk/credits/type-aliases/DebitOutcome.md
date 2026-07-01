[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / DebitOutcome

# Type Alias: DebitOutcome

> **DebitOutcome** = `object`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L86)

The outcome of an idempotent debit attempt (see [debitOnceIfCovers](../functions/debitOnceIfCovers.md)).

## Properties

### nonce

> **nonce**: `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L86)

***

### outcome

> **outcome**: `"debited"` \| `"replayed"` \| `"insufficient"`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/credits/src/credits.ts#L86)
