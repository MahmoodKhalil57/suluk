[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/models](../README.md) / deriveRequirements

# Function: deriveRequirements()

> **deriveRequirements**(`input`): [`HardFilters`](../interfaces/HardFilters.md)

Defined in: [select.ts:128](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/models/src/select.ts#L128)

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

\{ `allowedLicenses?`: `string`[]; `allowedRegions?`: `string`[]; `allowedRetention?`: [`DataRetention`](../type-aliases/DataRetention.md)[]; `modelAllowlist?`: `string`[]; \}

#### policy.allowedLicenses?

`string`[]

#### policy.allowedRegions?

`string`[]

#### policy.allowedRetention?

[`DataRetention`](../type-aliases/DataRetention.md)[]

#### policy.modelAllowlist?

`string`[]

## Returns

[`HardFilters`](../interfaces/HardFilters.md)
