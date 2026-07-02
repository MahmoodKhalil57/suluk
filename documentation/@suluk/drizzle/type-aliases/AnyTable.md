[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / AnyTable

# Type Alias: AnyTable

> **AnyTable** = `Parameters`\<*typeof* `getTableColumns`\>\[`0`\]

Defined in: [meta.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/drizzle/src/meta.ts#L11)

Any drizzle table object accepted by getTableColumns/getTableName. We stay structural — the concrete
 dialect type (SQLite/Pg/MySQL) is irrelevant here; we only read the column descriptor surface.
