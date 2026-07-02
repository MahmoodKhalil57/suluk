[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / RuntimeDeployHint

# Type Alias: RuntimeDeployHint

> **RuntimeDeployHint** = \{ `durableObjects`: `object`[]; `kind`: `"cloudflare"`; \} \| \{ `kind`: `"node"`; \}

Defined in: [agents/src/runtime.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/agents/src/runtime.ts#L24)

The provider-specific deploy hint — a discriminated union (tightened from `Record<string,unknown>` once a 2nd adapter
landed, per the C034 follow-up). Cloudflare ships the Durable Object descriptor for `@suluk/deploy`; the Node runtime
is a plain long-lived process with no provisioned infra. A future adapter adds a new `kind`.
