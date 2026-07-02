[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SecurityScheme

# Interface: SecurityScheme

Defined in: [types.ts:489](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L489)

`@suluk/core` — the foundation library for the OpenAPI v4.0 "Suluk" candidate.

parse → validate (meta-schema) → resolve references (by-name) → compute signatures → build the ADA →
match requests. Implements the structural + behavioral contract in
specification/candidate-v4/conformance/CONFORMANCE.md and the buildable grammars in SPEC Appendix A (C019).
CANDIDATE tooling — provisional; the soft points (CONFIDENCE.md) are isolated here.

## Properties

### flows?

> `optional` **flows?**: `Record`\<`string`, `unknown`\>

Defined in: [types.ts:494](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L494)

***

### in?

> `optional` **in?**: `"query"` \| `"header"` \| `"cookie"`

Defined in: [types.ts:492](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L492)

***

### name?

> `optional` **name?**: `string`

Defined in: [types.ts:491](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L491)

***

### openIdConnectUrl?

> `optional` **openIdConnectUrl?**: `string`

Defined in: [types.ts:495](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L495)

***

### scheme?

> `optional` **scheme?**: `string`

Defined in: [types.ts:493](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L493)

***

### type

> **type**: `"apiKey"` \| `"http"` \| `"oauth2"` \| `"openIdConnect"` \| `"mutualTLS"`

Defined in: [types.ts:490](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/types.ts#L490)
