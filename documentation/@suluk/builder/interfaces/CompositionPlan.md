[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / CompositionPlan

# Interface: CompositionPlan

Defined in: [compose.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/compose.ts#L13)

## Properties

### collisions

> **collisions**: `string`[]

Defined in: [compose.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/compose.ts#L20)

clashes installModule would refuse even with names satisfied: duplicate module, two providers of one
 entity (incl. the base), or two entity names mapping to one lowercased path resource

***

### ok

> **ok**: `boolean`

Defined in: [compose.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/compose.ts#L24)

true ⇒ the whole set installs in `order` with every requirement met and no collision (matches composeModules)

***

### order

> **order**: [`SulukModule`](SulukModule.md)[]

Defined in: [compose.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/compose.ts#L15)

modules in install order — each one's requires are met by the base or an earlier entry

***

### unmet

> **unmet**: `object`[]

Defined in: [compose.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/compose.ts#L17)

requirements neither the base nor ANOTHER selected module provides (a self-provide cannot bootstrap)

#### module

> **module**: `string`

#### requires

> **requires**: `string`

***

### unresolved

> **unresolved**: `string`[]

Defined in: [compose.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/compose.ts#L22)

modules that could not be ordered — they require each other, or sit behind a cycle
