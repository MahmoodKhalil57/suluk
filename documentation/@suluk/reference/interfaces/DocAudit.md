[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/reference](../README.md) / DocAudit

# Interface: DocAudit

Defined in: [harden/src/audit.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L20)

`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)

## Extends

- [`Audit`](../../harden/interfaces/Audit.md)

## Properties

### byOperation

> **byOperation**: [`OpAudit`](OpAudit.md)[]

Defined in: [harden/src/audit.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L20)

***

### bySeverity

> **bySeverity**: `Record`\<[`Severity`](../../harden/type-aliases/Severity.md), `number`\>

Defined in: [harden/src/audit.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L20)

***

### clean

> **clean**: `number`

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`clean`](../../harden/interfaces/Audit.md#clean)

***

### findings

> **findings**: [`Finding`](../../harden/interfaces/Finding.md)[]

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`findings`](../../harden/interfaces/Audit.md#findings)

***

### grade

> **grade**: [`Grade`](../type-aliases/Grade.md)

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`grade`](../../harden/interfaces/Audit.md#grade)

***

### nodes

> **nodes**: `number`

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`nodes`](../../harden/interfaces/Audit.md#nodes)

***

### score

> **score**: `number`

Defined in: [harden/src/audit.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/harden/src/audit.ts#L18)

#### Inherited from

[`Audit`](../../harden/interfaces/Audit.md).[`score`](../../harden/interfaces/Audit.md#score)
