# Functions

## audit

### `auditDocument`
Audit the document's input surface → per-op grades + a deduped rollup + a severity breakdown.
```ts
auditDocument(doc: OpenAPIv4Document, opts: AuditOptions): DocAudit
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: AuditOptions` — default: `{}`
**Returns:** `DocAudit`

### `auditOperation`
Audit one request's INPUT surface (request body + typed parameter slots).
```ts
auditOperation(doc: OpenAPIv4Document, uri: string, name: string, req: RawReq): OpAudit
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `uri: string`
- `name: string`
- `req: RawReq`
**Returns:** `OpAudit`

### `assertGrade`
CI gate (the hard incentive): throw if the document's hardening grade is below `min`.
```ts
assertGrade(doc: OpenAPIv4Document, min: Grade, opts: AuditOptions): DocAudit
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `min: Grade`
- `opts: AuditOptions` — default: `{}`
**Returns:** `DocAudit`

### `grade`
`@suluk/harden` — schema hardening as a derived, scored contract facet. Audit a v4 'Suluk' document's INPUT
schemas for the validations that keep malformed/oversized input from breaking the system, grade them A–F,
surface the grade to incentivise the author, and gate CI on a minimum.

  import { auditDocument, assertGrade } from "@suluk/harden";
  const report = auditDocument(doc);   // { grade, score, byOperation, findings, bySeverity }
  assertGrade(doc, "B");               // throws if the contract is too weak (the hard incentive)
```ts
grade(score: number): Grade
```
**Parameters:**
- `score: number`
**Returns:** `Grade`

### `combineGrades`
Combine per-dimension letters into one contract grade (worst + average). Empty ⇒ vacuously A — a caller MUST pass at
 least the doc grade, since gating an empty set passes vacuously (`worst:"A"`).
```ts
combineGrades(grades: Grade[]): CombinedGrade
```
**Parameters:**
- `grades: Grade[]`
**Returns:** `CombinedGrade`

### `assertCombinedGrade`
CI gate over a combined grade. Gates on the WORST dimension by default (safe); pass `mode: "average"` to soften.
```ts
assertCombinedGrade(grades: Grade[], min: Grade, mode: "worst" | "average"): CombinedGrade
```
**Parameters:**
- `grades: Grade[]`
- `min: Grade`
- `mode: "worst" | "average"` — default: `"worst"`
**Returns:** `CombinedGrade`

## harden

### `hardenSchema`
Recursively add baseline bounds to a JSON Schema. Idempotent — never overrides an author-set bound.
```ts
hardenSchema(schema: unknown, opts: HardenOptions): unknown
```
**Parameters:**
- `schema: unknown`
- `opts: HardenOptions` — default: `{}`
**Returns:** `unknown`

### `hardenDocument`
Harden EVERY input schema in a built v4 document IN PLACE — request bodies + all parameter slots (incl. the route
 generator's path params, otherwise unbounded strings). Idempotent. The transform that makes assertGrade pass.
```ts
hardenDocument<T>(doc: T, opts: HardenOptions): T
```
**Parameters:**
- `doc: T`
- `opts: HardenOptions` — default: `{}`
**Returns:** `T`

## readiness

### `auditReadiness`
Audit the document's request bodies for client-sendability + example presence → findings + a readiness grade.
```ts
auditReadiness(doc: OpenAPIv4Document, opts: ReadinessOptions): ReadinessAudit
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: ReadinessOptions` — default: `{}`
**Returns:** `ReadinessAudit`
