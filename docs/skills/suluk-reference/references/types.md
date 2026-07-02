# Types & Enums

## `ReferencePlugin`
**Properties:**
- `name: string`
- `onNormalize: (ir: RefDoc) => void | RefDoc` (optional)
- `slots: { heroAfter?: (ir: RefDoc) => string; opCardAfter?: (op: NormalizedOperation) => string }` (optional)

## ir

### `RefDoc`
**Properties:**
- `spec: { dialect: string; version: string }`
- `info: { title: string; version?: string; description?: string }`
- `servers: ServerEntry[]`
- `tags: TagEntry[]`
- `operations: NormalizedOperation[]`
- `models: ModelEntry[]`
- `security: SecuritySchemeEntry[]`
- `webhooks: NormalizedOperation[]`
- `diagnostics: Diagnostic[]`

### `NormalizedOperation`
**Properties:**
- `id: string`
- `name: string`
- `method: string`
- `path: string`
- `tag: string` (optional)
- `summary: string` (optional)
- `description: string` (optional)
- `deprecated: boolean` (optional)
- `request: NormalizedRequest`
- `responses: NormalizedResponse[]`
- `security: string[]`
- `servers: ServerEntry[]`
- `cost: CostModel` (optional)
- `access: AccessFacet` (optional)
- `source: SulukSource` (optional)
- `collisions: CollisionNote[]`
- `shareCount: number`
- `signature: OpSignature`

## facets

### `Viewer`
A viewer the reference can project the surface for.
**Properties:**
- `id: string`
- `label: string`
- `authenticated: boolean`
- `admin: boolean`

### `AccessFacet`
Access as a contract facet: who can REACH an operation. Annotated on each request as x-suluk-access.
**Properties:**
- `requires: "anyone" | "authenticated" | "admin"` (optional)
- `scope: "owner"` (optional)

### `CostModel`
C024 — the cost facet may declare a non-synchronous trigger (the cost accrues on a background event).
**Properties:**
- `estimateMicroUsd: number` (optional)
- `components: CostComponent[]` (optional)
- `trigger: string` (optional)
- `triggerRef: string` (optional)
- `attribution: { strategy?: string; expression?: string }` (optional)

### `CrossCutRow`
**Properties:**
- `path: string`
- `name: string`
- `method: string`
- `requires: string`
- `scope: string` (optional)
- `reach: Record<string, ReachState>`

## portal

### `PortalEntry`
**Properties:**
- `name: string`
- `title: string`
- `description: string` (optional)
- `href: string`
- `version: string` (optional)
- `badge: string` (optional)

## audit

### `DocAudit`
**Properties:**
- `byOperation: OpAudit[]`
- `bySeverity: Record<Severity, number>`
- `findings: Finding[]`
- `nodes: number`
- `clean: number`
- `score: number`
- `grade: Grade`

### `OpAudit`
**Properties:**
- `operation: string`
- `method: string`
- `path: string`
- `findings: Finding[]`
- `nodes: number`
- `clean: number`
- `score: number`
- `grade: Grade`

### `Grade`
```ts
"A" | "B" | "C" | "D" | "F"
```
