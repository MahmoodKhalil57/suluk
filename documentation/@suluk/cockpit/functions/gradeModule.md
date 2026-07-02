[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cockpit](../README.md) / gradeModule

# Function: gradeModule()

> **gradeModule**(`mod`): [`ModuleGrade`](../interfaces/ModuleGrade.md)

Defined in: [builder/src/module.ts:313](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/builder/src/module.ts#L313)

A conformance grade. The real, author-attributable signal is COST coverage (auto-CRUD ops carry a
framework-injected summary, so @suluk/hono `coverage` is structurally ~1.0 and tells us nothing); we use it
only as a documentation-WARNING penalty on authored ops. A module that contributes nothing grades C.

## Parameters

### mod

[`SulukModule`](../interfaces/SulukModule.md)

## Returns

[`ModuleGrade`](../interfaces/ModuleGrade.md)
