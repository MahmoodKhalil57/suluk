[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / deriveRequirements

# Function: deriveRequirements()

> **deriveRequirements**(`input`): [`HardFilters`](../interfaces/HardFilters.md)

Defined in: [models/src/select.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/models/src/select.ts#L128)

Derive HardFilters from an agent/skill's declared needs + the analyzer's load (the C027 seam).

## Parameters

### input

#### hasRoutes?

`boolean`

#### inputModalities?

`string`[]

#### minWindowRequired?

`number`

#### needsStructured?

`boolean`

#### policy?

\{ `allowedLicenses?`: `string`[]; `allowedRegions?`: `string`[]; `allowedRetention?`: [`DataRetention`](../../models/type-aliases/DataRetention.md)[]; `modelAllowlist?`: `string`[]; \}

#### policy.allowedLicenses?

`string`[]

#### policy.allowedRegions?

`string`[]

#### policy.allowedRetention?

[`DataRetention`](../../models/type-aliases/DataRetention.md)[]

#### policy.modelAllowlist?

`string`[]

## Returns

[`HardFilters`](../interfaces/HardFilters.md)
