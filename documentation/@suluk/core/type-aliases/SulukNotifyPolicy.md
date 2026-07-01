[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / SulukNotifyPolicy

# Type Alias: SulukNotifyPolicy

> **SulukNotifyPolicy** = `Record`\<`string`, [`SulukNotifySeverity`](SulukNotifySeverity.md)\>

Defined in: [types.ts:135](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/core/src/types.ts#L135)

The document-level `x-suluk-notify` policy (C037) — a status→severity map driving the `@suluk/sdk` callback layer.
Keys are an HTTP status (`"402"`), a status CLASS (`"2xx"` | `"4xx"` | `"5xx"`), or `"network"` (no response). The
value is the severity the generated client raises through an INJECTED `notify(severity, problem)` adapter (the
consumer wires it to their toaster — policy DECLARED, rendering INJECTED). A specific status beats its class.
CLIENT-CODEGEN ONLY; never read by the matcher/runtime.
