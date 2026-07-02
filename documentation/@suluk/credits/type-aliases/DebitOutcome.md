[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/credits](../README.md) / DebitOutcome

# Type Alias: DebitOutcome

> **DebitOutcome** = `object`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/credits/src/credits.ts#L86)

The outcome of an idempotent debit attempt (see [debitOnceIfCovers](../functions/debitOnceIfCovers.md)).

## Properties

### nonce

> **nonce**: `string`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/credits/src/credits.ts#L86)

***

### outcome

> **outcome**: `"debited"` \| `"replayed"` \| `"insufficient"`

Defined in: [tooling/ts/packages/credits/src/credits.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/credits/src/credits.ts#L86)
