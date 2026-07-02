[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/harden](../README.md) / OpAudit

# Interface: OpAudit

Defined in: [audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L19)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)

## Extends

- [`Audit`](Audit.md)

## Properties

### clean

> **clean**: `number`

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](Audit.md).[`clean`](Audit.md#clean)

***

### findings

> **findings**: [`Finding`](Finding.md)[]

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](Audit.md).[`findings`](Audit.md#findings)

***

### grade

> **grade**: [`Grade`](../type-aliases/Grade.md)

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](Audit.md).[`grade`](Audit.md#grade)

***

### method

> **method**: `string`

Defined in: [audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L19)

***

### nodes

> **nodes**: `number`

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](Audit.md).[`nodes`](Audit.md#nodes)

***

### operation

> **operation**: `string`

Defined in: [audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L19)

***

### path

> **path**: `string`

Defined in: [audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L19)

***

### score

> **score**: `number`

Defined in: [audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](Audit.md).[`score`](Audit.md#score)
