[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostAttribution

# Interface: CostAttribution

Defined in: [types.ts:47](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L47)

WHO is charged when a third party fires the event with no live session (C024) — a declared STRATEGY the runtime
resolves a concrete principal from, modeled on `SulukRateLimit.key`. The `expression` is RUNTIME-ONLY: a C018
runtime-expression that NEVER enters the static matcher (D1-consistent, exactly as C018 walls its callback keys).

## Properties

### expression?

> `optional` **expression?**: `string`

Defined in: [types.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L52)

for event-expression: a C018 runtime-expression (e.g. "{$event.body#/customer}"). Runtime-resolved only.

***

### strategy

> **strategy**: `"session"` \| `"event-expression"` \| `"job-stamped"`

Defined in: [types.ts:50](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L50)

session = the live caller (the existing path); event-expression = read the principal from the event payload at
 runtime; job-stamped = the job carries its own principal.

***

### trust?

> `optional` **trust?**: `"verified"` \| `"unverified-payload"`

Defined in: [types.ts:55](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L55)

is the attribution input authentic? An event-expression off an UNVERIFIED webhook payload is attacker-controlled
 — honor it as authoritative only when "verified" (a signature/secret check the runtime performs).
