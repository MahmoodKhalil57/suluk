[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/billing](../README.md) / mockStripeFetch

# Function: mockStripeFetch()

> **mockStripeFetch**(): *typeof* `fetch`

Defined in: [packages/billing/src/mock.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/billing/src/mock.ts#L21)

Build a mock Stripe `fetch`. Returns generic objects for the endpoints @suluk/billing drives; a permissive fallback
 for anything else. Ignores the auth header (any/no key works).

## Returns

*typeof* `fetch`
