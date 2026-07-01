[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / AnyTable

# Type Alias: AnyTable

> **AnyTable** = `Parameters`\<*typeof* `getTableColumns`\>\[`0`\]

Defined in: [meta.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/drizzle/src/meta.ts#L11)

Any drizzle table object accepted by getTableColumns/getTableName. We stay structural — the concrete
 dialect type (SQLite/Pg/MySQL) is irrelevant here; we only read the column descriptor surface.
