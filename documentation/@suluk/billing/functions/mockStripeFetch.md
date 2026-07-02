[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / mockStripeFetch

# Function: mockStripeFetch()

> **mockStripeFetch**(): *typeof* `fetch`

Defined in: [packages/billing/src/mock.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/billing/src/mock.ts#L21)

Build a mock Stripe `fetch`. Returns generic objects for the endpoints @suluk/billing drives; a permissive fallback
 for anything else. Ignores the auth header (any/no key works).

## Returns

*typeof* `fetch`
