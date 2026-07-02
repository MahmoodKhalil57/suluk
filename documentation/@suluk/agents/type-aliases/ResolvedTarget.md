[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/agents](../README.md) / ResolvedTarget

# Type Alias: ResolvedTarget

> **ResolvedTarget** = \{ `kind`: `"pinned"`; `model`: `string`; \} \| \{ `allowedModels`: `string`[]; `costQualityTradeoff`: `number`; `kind`: `"router"`; `model`: `"openrouter/auto"`; `provider?`: \{ `zdr`: `true`; \}; \} \| \{ `kind`: `"latest"`; `model`: `string`; `note`: `string`; \}

Defined in: [agents/src/model-select.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/agents/src/model-select.ts#L19)

How a skill RESOLVES to a runtime model (C030, council wf_75f87ab6-b1b — unanimous hybrid). We keep the survivor
SET (governance + caps + min-context, the moat) and either PIN a concrete reproducible id, or DELEGATE the
per-request pick to OpenRouter's auto-router fenced by our ENUMERATED survivor allowlist (never a wildcard).
