[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / MatchResult

# Interface: MatchResult

Defined in: [ada.ts:56](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/ada.ts#L56)

## Properties

### operation

> **operation**: [`Operation`](Operation.md)

Defined in: [ada.ts:57](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/ada.ts#L57)

***

### pathParams

> **pathParams**: `Record`\<`string`, `string`\>

Defined in: [ada.ts:59](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/ada.ts#L59)

Captured path variables (the per-location PATH slot instance).

***

### query

> **query**: `Record`\<`string`, `string`[]\>

Defined in: [ada.ts:61](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/ada.ts#L61)

Raw query string key→values (the per-location QUERY slot instance, before schema coercion).
