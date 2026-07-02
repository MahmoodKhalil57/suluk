[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/hono](../README.md) / enforceAccess

# Function: enforceAccess()

> **enforceAccess**(`cfg`): `MiddlewareHandler`

Defined in: [tooling/ts/packages/hono/src/enforce.ts:76](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/hono/src/enforce.ts#L76)

The facet-driven gate. Apply once (after identity is resolved, before the handlers): every operation is then
enforced at the level its `x-suluk-access` declares. FAIL-CLOSED throughout — a missing facet denies (deny-by-
default), an unknown/mis-cased `requires` denies, and a non-owner `scope` is enforced even when `requires` is
"anyone" (a named scope implies authentication). Non-contract paths (operationOf → undefined) pass untouched;
a consumer's operationOf MUST be at least as strict as the router and MUST fail closed if it can't resolve.

## Parameters

### cfg

[`EnforceAccessConfig`](../interfaces/EnforceAccessConfig.md)

## Returns

`MiddlewareHandler`
