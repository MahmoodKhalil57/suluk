[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / DebitOutcome

# Type Alias: DebitOutcome

> **DebitOutcome** = `object`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L86)

The outcome of an idempotent debit attempt (see [debitOnceIfCovers](../functions/debitOnceIfCovers.md)).

## Properties

### nonce

> **nonce**: `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L86)

***

### outcome

> **outcome**: `"debited"` \| `"replayed"` \| `"insufficient"`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/credits/src/credits.ts#L86)
