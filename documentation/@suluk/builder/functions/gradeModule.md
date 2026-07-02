[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / gradeModule

# Function: gradeModule()

> **gradeModule**(`mod`): [`ModuleGrade`](../interfaces/ModuleGrade.md)

Defined in: [module.ts:313](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/builder/src/module.ts#L313)

A conformance grade. The real, author-attributable signal is COST coverage (auto-CRUD ops carry a
framework-injected summary, so @suluk/hono `coverage` is structurally ~1.0 and tells us nothing); we use it
only as a documentation-WARNING penalty on authored ops. A module that contributes nothing grades C.

## Parameters

### mod

[`SulukModule`](../interfaces/SulukModule.md)

## Returns

[`ModuleGrade`](../interfaces/ModuleGrade.md)
