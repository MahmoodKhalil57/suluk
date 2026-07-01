[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / ChangePlanResult

# Interface: ChangePlanResult

Defined in: [packages/billing/src/subscriptions.ts:154](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/billing/src/subscriptions.ts#L154)

Change the subscriber's plan IN PLACE against the cycle's PAID CEILING (see [ceilingFor](../functions/ceilingFor.md)). ABOVE the ceiling = an
 upgrade: immediate + prorated for the difference ABOVE THE CEILING, charged off-session; the matching prorated credits
 land on that invoice.paid (3DS-safe). AT OR BELOW the ceiling = a deferred change: no charge + no new credits now — it
 re-prices for the NEXT renewal (so up→down→up within a cycle never re-charges). Returns the kind, the period end, and a
 clientSecret ONLY when the upgrade's prorated charge needs in-page 3DS. `plans` is the app catalog.

## Properties

### clientSecret

> **clientSecret**: `string` \| `null`

Defined in: [packages/billing/src/subscriptions.ts:156](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/billing/src/subscriptions.ts#L156)

***

### currentPeriodEnd

> **currentPeriodEnd**: `number`

Defined in: [packages/billing/src/subscriptions.ts:157](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/billing/src/subscriptions.ts#L157)

***

### kind

> **kind**: `"upgrade"` \| `"downgrade"`

Defined in: [packages/billing/src/subscriptions.ts:155](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/billing/src/subscriptions.ts#L155)
