# Functions

## model-select

### `resolveSkillModels`
Run the catalog selector for a skill from its declared NEEDS + the analyzer load.
```ts
resolveSkillModels(doc: OpenAPIv4Document, agentName: string, skillName: string, catalog: ModelCatalog, minWindowRequired?: number): SelectResult
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `skillName: string`
- `catalog: ModelCatalog`
- `minWindowRequired: number` (optional)
**Returns:** `SelectResult`

### `skillModels`
The public seam: the models for a skill — its DECLARED list (opt-out) or the catalog-SELECTED ranked ids, resolved
to a runtime TARGET (pin / router / latest) under the C030 governance gate.
```ts
skillModels(doc: OpenAPIv4Document, agentName: string, skillName: string, catalog: ModelCatalog, minWindowRequired?: number): SkillModelResolution
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `skillName: string`
- `catalog: ModelCatalog`
- `minWindowRequired: number` (optional)
**Returns:** `SkillModelResolution`

### `deriveCQT`
cost_quality_tradeoff 0..10 (0=quality, 10=cost) — mechanical from the profile's cost-vs-intelligence weights
(set explicitly; do NOT inherit OpenRouter's cost-leaning default of 7).
```ts
deriveCQT(skill: SulukSkillRef | undefined): number
```
**Parameters:**
- `skill: SulukSkillRef | undefined`
**Returns:** `number`
