[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / mockStripeFetch

# Function: mockStripeFetch()

> **mockStripeFetch**(): *typeof* `fetch`

Defined in: [packages/billing/src/mock.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/billing/src/mock.ts#L21)

Build a mock Stripe `fetch`. Returns generic objects for the endpoints @suluk/billing drives; a permissive fallback
 for anything else. Ignores the auth header (any/no key works).

## Returns

*typeof* `fetch`
