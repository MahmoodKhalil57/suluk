# Variables & Constants

## path

### `MAX_KEY_DEPTH`
A delegation chain can be at most this deep (root..leaf) — bounds the path length + the per-request walk.
```ts
const MAX_KEY_DEPTH: 8
```

## lineage

### `keyLineage`
The delegation tree: each node's parent + a materialized `path` of keyIds (root→…→self). `userId`/`keyId` are plain
 columns (the app owns the user + apikey tables); `keyId` is the SAME string as `credit_key.keyId`.
```ts
const keyLineage: SQLiteTableWithColumns<{ name: "key_lineage"; schema: undefined; columns: { keyId: SQLiteColumn<{ name: "keyId"; tableName: "key_lineage"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: true; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined }, {}, { length: number | undefined }>; parentKeyId: SQLiteColumn<{ name: "parentKeyId"; tableName: "key_lineage"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: false; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined }, {}, { length: number | undefined }>; userId: SQLiteColumn<{ name: "userId"; tableName: "key_lineage"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined }, {}, { length: number | undefined }>; path: SQLiteColumn<{ name: "path"; tableName: "key_lineage"; dataType: "string"; columnType: "SQLiteText"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: [string, ...string[]]; baseColumn: never; identity: undefined; generated: undefined }, {}, { length: number | undefined }>; depth: SQLiteColumn<{ name: "depth"; tableName: "key_lineage"; dataType: "number"; columnType: "SQLiteInteger"; data: number; driverParam: number; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; baseColumn: never; identity: undefined; generated: undefined }, {}, {}> }; dialect: "sqlite" }>
```
