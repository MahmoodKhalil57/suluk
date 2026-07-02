[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / DebitOutcome

# Type Alias: DebitOutcome

> **DebitOutcome** = `object`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/credits/src/credits.ts#L86)

The outcome of an idempotent debit attempt (see [debitOnceIfCovers](../functions/debitOnceIfCovers.md)).

## Properties

### nonce

> **nonce**: `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/credits/src/credits.ts#L86)

***

### outcome

> **outcome**: `"debited"` \| `"replayed"` \| `"insufficient"`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/credits/src/credits.ts#L86)
