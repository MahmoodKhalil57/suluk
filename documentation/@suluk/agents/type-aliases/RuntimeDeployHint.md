[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / RuntimeDeployHint

# Type Alias: RuntimeDeployHint

> **RuntimeDeployHint** = \{ `durableObjects`: `object`[]; `kind`: `"cloudflare"`; \} \| \{ `kind`: `"node"`; \}

Defined in: [agents/src/runtime.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/26d65d0a9feabcf5cb1260d6a7ca321d86f2e3a4/tooling/ts/packages/agents/src/runtime.ts#L24)

The provider-specific deploy hint — a discriminated union (tightened from `Record<string,unknown>` once a 2nd adapter
landed, per the C034 follow-up). Cloudflare ships the Durable Object descriptor for `@suluk/deploy`; the Node runtime
is a plain long-lived process with no provisioned infra. A future adapter adds a new `kind`.
