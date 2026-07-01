[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / CostComponent

# Interface: CostComponent

Defined in: [types.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L19)

`@suluk/cost` — cost as a contract facet + runtime metering. You can't price a user without knowing what
they cost you. So: declare per-operation cost (incl. third-party usage) on the contract — it bubbles into
the v4 doc, Scalar, and the audit; meter the ACTUAL cost per request at runtime, traced from the frontend
action down to each third party; and read the raw per-user picture from the ledger. We display the data as
it is and let you build pricing on top (Stripe via @suluk/stripe). CANDIDATE tooling — NOT official OAS.

## Properties

### basis

> **basis**: [`CostBasis`](../type-aliases/CostBasis.md)

Defined in: [types.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L22)

***

### description?

> `optional` **description?**: `string`

Defined in: [types.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L25)

***

### microUsd

> **microUsd**: `number`

Defined in: [types.ts:24](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L24)

Cost per one unit of `basis`, in micro-USD.

***

### source

> **source**: `string`

Defined in: [types.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/types.ts#L21)

Where the money goes: "openai", "compute", "egress", "twilio", … (free-form, your taxonomy).
