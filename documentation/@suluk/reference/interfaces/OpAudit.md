[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / OpAudit

# Interface: OpAudit

Defined in: [harden/src/audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L19)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)

## Extends

- [`Audit`](../../harden/interfaces/Audit.md)

## Properties

### clean

> **clean**: `number`

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`clean`](../../harden/interfaces/Audit.md#clean)

***

### findings

> **findings**: [`Finding`](../../harden/interfaces/Finding.md)[]

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`findings`](../../harden/interfaces/Audit.md#findings)

***

### grade

> **grade**: [`Grade`](../type-aliases/Grade.md)

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`grade`](../../harden/interfaces/Audit.md#grade)

***

### method

> **method**: `string`

Defined in: [harden/src/audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L19)

***

### nodes

> **nodes**: `number`

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`nodes`](../../harden/interfaces/Audit.md#nodes)

***

### operation

> **operation**: `string`

Defined in: [harden/src/audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L19)

***

### path

> **path**: `string`

Defined in: [harden/src/audit.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L19)

***

### score

> **score**: `number`

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`score`](../../harden/interfaces/Audit.md#score)
