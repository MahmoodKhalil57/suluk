# Functions

## resources

### `resourceCatalog`
The agent's reachable loadable-resource catalog — its DIRECT `resources` refs resolved against the top-level map
(each sub-agent owns its own catalog, so this is not transitive), sorted by key. Dangling refs are skipped here
(`lintResources` owns that error). This is the listing a projection renders into the system prompt / `SKILL.md` set.
```ts
resourceCatalog(doc: OpenAPIv4Document, agentName: string): CatalogEntry[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `CatalogEntry[]`

### `lintResources`
Lint the resources catalog + every agent's refs into it: catalog entries must be well-formed (description, valid
kind, pinned provenance), agent refs must resolve, retrieved content is flagged (advisory), and `kind: "script"` is
flagged a warning (CF Agent-Skill script execution is EARLY/experimental — C036's honest caveat). Pure; no throw.
```ts
lintResources(doc: OpenAPIv4Document): ResourceFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `ResourceFinding[]`

### `resourcesOk`
True ⇒ no error-severity resource finding (the install-gate predicate for the resources facet).
```ts
resourcesOk(doc: OpenAPIv4Document): boolean
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `boolean`

### `resourceMap`
The top-level resources catalog (empty when absent).
```ts
resourceMap(doc: OpenAPIv4Document): Record<string, SulukResource>
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Record<string, SulukResource>`

### `resourceKey`
Decode a resource ref `#/x-suluk-resources/<key>` to its key (or null if malformed / not a resource ref).
```ts
resourceKey(ref: string): string | null
```
**Parameters:**
- `ref: string`
**Returns:** `string | null`
