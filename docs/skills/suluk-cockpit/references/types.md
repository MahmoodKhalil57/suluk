# Types & Enums

## logic

### `Diagnostic`
`@suluk/cockpit` — the PURE cockpit core: the cycle model, the builder model, codegen, deploy planning, and
the validate/audit/preview helpers. No host API. Two shells consume this exact core: the vscode extension
(suluk-vscode) and the web admin panel (@suluk/admin, served under /superadmin). One brain, two faces.
CANDIDATE tooling — NOT official OAS.
**Properties:**
- `severity: "error" | "warning" | "info"`
- `path: string`
- `message: string`

## cycle

### `CycleModel`
**Properties:**
- `valid: boolean`
- `coverage: number`
- `principal: Principal` (optional) — The principal this view was projected for (undefined ⇒ the full/public view).
- `layers: CycleLayer[]`

### `CycleLayer`
**Properties:**
- `id: "data" | "contract" | "auth" | "document" | "cost" | "docs" | "state" | "ui" | "providers" | "tests"`
- `title: string`
- `status: LayerStatus`
- `summary: string`
- `items: CycleItem[]`

### `CycleItem`
**Properties:**
- `label: string`
- `detail: string` (optional)
- `status: LayerStatus` (optional)
- `ref: string` (optional) — A stable handle (e.g. an entity or operation name) for command targeting.

### `LayerStatus`
```ts
"ok" | "warn" | "error" | "info"
```

### `Principal`
**Properties:**
- `scopes: string[]` (optional)

### `DocCheck`
**Properties:**
- `name: string`
- `pass: boolean`
- `message: string`

## builder

### `BuilderModel`
**Properties:**
- `app: BuiltApp`
- `tree: BuilderNode[]`
- `errors: { doc: string; path: string; message: string }[]` — DSL contract violations (empty ⇒ sound).
- `entityCount: number`

### `BuilderNode`
**Properties:**
- `tier: "page" | "section" | "block" | "component"`
- `label: string`
- `contract: string[]` — The param-contract keys this tier exposes upward (empty for a leaf component).
- `children: BuilderNode[]`

### `GeneratedFile`
**Properties:**
- `path: string`
- `content: string`

## types

### `DeployPlan`
**Properties:**
- `provider: string`
- `files: DeployFile[]`
- `steps: DeployStep[]`
- `notes: string[]` — Human-facing notes (auth, manual fill-ins, caveats).

### `DeployStep`
One ordered shell step the host (the vscode extension) runs in a terminal AFTER the user authenticates.
**Properties:**
- `cmd: string`
- `note: string`

### `DeployProvider`
A deployment target. Pure: it produces the plan; the host executes the steps (with the user's credentials).
**Properties:**
- `name: string`

## drift

### `ContractDiff`
**Properties:**
- `operations: { added: OpRef[]; removed: OpRef[]; changed: ChangedOp[] }`
- `schemas: { added: string[]; removed: string[]; changed: string[] }`
- `providers: { added: ProviderDelta[]; removed: ProviderDelta[]; changed: ProviderChange[] }` — provider-slot drift (x-suluk-providers) — e.g. local binds payments→paddle, deployed still →stripe
- `identical: boolean` — true ⇒ local matches deployed exactly (no drift)
- `summary: string` — one-line digest, e.g. "1+ 0- 2~ ops · 1+ 0- 0~ schemas" or "in sync"

### `ChangedOp`
**Properties:**
- `changes: string[]` — human-readable field-level changes, deployed→local
- `name: string` — human display handle (the C009 name); disambiguated by `detail` when names repeat across paths
- `detail: string` — e.g. "GET project"

### `OpRef`
**Properties:**
- `name: string` — human display handle (the C009 name); disambiguated by `detail` when names repeat across paths
- `detail: string` — e.g. "GET project"

### `ProviderDelta`
**Properties:**
- `facet: string`
- `impl: string`

### `ProviderChange`
**Properties:**
- `facet: string`
- `from: string`
- `to: string`

## crosscut

### `Viewer`
A viewer to project for. `scopes: undefined` ⇒ the full/operator view; `[]` ⇒ no scopes.
 `authenticated` distinguishes a logged-in viewer from a truly anonymous one — an auth-only operation
 (`security: [{ bearer: [] }]`, a requirement with zero scopes) is reachable by any AUTHENTICATED viewer but
 NOT by anonymous. (This is more precise than the cockpit's single-principal "View as", which keys on scopes
 alone; the cross-cut is the purpose-built security view.)
**Properties:**
- `label: string`
- `scopes: string[] | undefined`
- `authenticated: boolean` (optional) — does this viewer hold a credential? defaults to "holds at least one scope".

### `ViewerView`
**Properties:**
- `label: string`
- `scopes: string[] | null`
- `visible: string[]`
- `hidden: string[]`

### `GatedOp`
**Properties:**
- `operation: string`
- `detail: string`
- `requiredScopes: string[][]` — the scope requirements (OR of AND-groups); empty ⇒ public
- `visibleTo: string[]` — the labels of the viewers who CAN see it

### `CrossCut`
**Properties:**
- `operations: { name: string; detail: string }[]`
- `viewers: ViewerView[]`
- `gated: GatedOp[]` — operations not visible to every viewer — the scope-gated surface

### `PreviewRole`
A principal you can preview the running app AS — derived from the contract, never hardcoded.
**Properties:**
- `label: string`
- `role: string` — the role token passed to the preview deploy's /preview/login?role=… (or "anonymous").
- `scopes: string[]` — the scopes this role implies in the cross-cut (here, just the role itself; the runtime maps role→scopes).
- `authenticated: boolean`

## converge

### `ConvergeReport`
**Properties:**
- `findings: ConvergeFinding[]`
- `clean: boolean` — true ⇒ no error-severity findings — the contract is self-consistent

### `ConvergeFinding`
**Properties:**
- `code: ConvergeCode`
- `severity: "error" | "info" | "warn"`
- `message: string`
- `where: string` (optional)

### `ConvergeCode`
```ts
"dangling-ref" | "undeclared-scheme" | "orphan-scope" | "empty-path" | "unreferenced-entity" | "preview-op-exposed"
```

## diagram

### `DiagramView`
```ts
"erd" | "cycle" | "operations"
```

## visual

### `ComponentReport`
**Properties:**
- `used: UsedPrimitive[]` — the distinct primitives every generated form/table is composed of (deduped across entities)
- `confidence: ConfidenceReport`
- `coverage: number` — 0..1 — fraction of used primitives that are approved + unchanged
- `preview: Record<string, string>` — primitive key → inline control HTML (widget primitives only — for the preview)
- `entities: { name: string; form: string[]; table: string[] }[]` — which primitives each entity's form/table is built from

## baseline

### `Baseline`
The approved baseline — primitive key → its verified entry. Persist as JSON; commit it.
```ts
Record<string, BaselineEntry>
```

## lifecycle

### `Gate`
**Properties:**
- `id: string`
- `title: string`
- `status: GateStatus`
- `detail: string`
- `action: string` (optional) — the command to run to advance this gate (undefined ⇒ nothing to do)

### `GateStatus`
```ts
"ok" | "warn" | "error" | "todo" | "info"
```

## agents

### `AgentsView`
**Properties:**
- `present: boolean`
- `agents: AgentNodeView[]`
- `roots: string[]` — entry-point agents — not referenced as a sub-agent by any other agent.
- `findings: LintFinding[]`
- `installable: boolean` — true ⇒ no error-severity findings across the whole map (the gate).
- `contextFindings: LintFinding[]` — context-budget findings (model-fit / over-budget / overloaded / empty-layer / passthrough / flattenable) — the right-sizing check.
- `unflatten: UnflattenSuggestion[]` — for every over-target agent: what to move to cold-tail or extract into a sub-agent (split DOWN).
- `flatten: FlattenSuggestion[]` — for every thin/redundant layer: what to collapse up (the dual — merge UP).

### `AgentNodeView`
**Properties:**
- `name: string`
- `description: string`
- `kind: "orchestrator" | "leaf"` — an orchestrator has sub-agents; a leaf does not (the recursion base case).
- `maxDepth: number` (optional)
- `effectiveScope: Scope` — scope after INTERSECTION along the reaching path (null = unconstrained).
- `skills: AgentSkillView[]`
- `routes: AgentRouteView[]`
- `subAgents: string[]`
- `reachable: { tools: string[]; agents: string[] }` — worst-case statically-enumerable reach (tools + transitively-reachable sub-agents).
- `projection: { pluginFiles: string[]; openRouterTools: string[]; residentTools: string[]; discoverableTools: string[] }` — OBSERVE-only preview of what projection WOULD emit — names, never executed, never credentialed.
- `governed: AgentGovernedView` (optional) — operator governance diff (C028) — present only when an x-suluk-policy governs this agent.
- `context: AgentContextLoad` — estimated default context load (resident instructions+tools+overhead) vs budget/window — the unflatten check (C027).
- `modelSelection: { skill: string; from?: "declared" | "selected"; ids?: string[]; resolve?: "pinned" | "router" | "latest"; pickPinned?: boolean; decidingPreference?: string; coverageGaps?: string[]; error?: string }[]` (optional) — per-skill model pick (C027 × @suluk/models) — present only when agentsView is given a catalog. OBSERVE-only:
"why this model" (declared vs selected, top ids, deciding preference, UNKNOWN-coverage gaps). Never executes.

### `AgentSkillView`
**Properties:**
- `name: string`
- `model: string[]`
- `tier: "resident" | "cold-tail"` (optional)
- `pinned: boolean` — has a provenance.contentHash ⇒ drift is detectable (the staleness binding).
- `source: string` (optional)

### `AgentRouteView`
**Properties:**
- `name: string`
- `operationRef: string`
- `guarantee: string` (optional)
- `tier: "resident" | "cold-tail"` (optional) — serving partition: resident (default tool list) vs cold-tail (behind discover_tools). Absent ⇒ resident.
- `resolves: boolean` — does the operationRef resolve to a real operation? (false ⇒ a dangling ref, like Conin's MCP-only primitive).

### `AgentGovernedView`
The agent-declared vs operator-effective diff + the cost three-number (cap / estimate / actual). Read-only.
**Properties:**
- `effectiveScope: Scope`
- `effectiveMaxDepth: number` (optional)
- `nestingForbidden: boolean`
- `deniedTools: string[]`
- `deniedSubAgents: string[]`
- `narrowings: { axis: string; detail: string }[]`
- `cost: { cap: string | null; estimate: string | null; actual: string }` — the three distinct owners: cap (operator x-suluk-policy, enforced-by-adapter) / estimate (author) / actual (C026 runtime).

## ledger

### `CostSummary`
**Properties:**
- `total: number`
- `count: number`
- `byPrincipal: Record<string, number>`
- `byOperation: Record<string, number>`
- `byAction: Record<string, number>`
- `bySource: Record<string, number>`

## module

### `SulukModule`
**Properties:**
- `name: string`
- `version: string`
- `provides: string[]` — Entity names this module OWNS (each must have a schema in `schemas`).
- `requires: string[]` (optional) — Entity names this module REFERENCES but does not own — must already be present at install time.
- `schemas: Record<string, SchemaOrRef>` — components.schemas fragment (the provided entities; may $ref a required entity like User).
- `paths: Record<string, PathItem>` (optional) — Explicit operations beyond the auto-CRUD (e.g. checkout); keyed by v4 path.
- `crud: boolean` (optional) — Auto-generate CRUD operations for each provided entity (default true).
- `cost: Record<string, ModuleCost>` (optional) — x-suluk-cost per operation name (e.g. createOrder).
- `securitySchemes: Record<string, unknown>` (optional) — securitySchemes to merge.
- `providerSlots: Record<string, string>` (optional) — Declared provider slots a developer can swap (e.g. { payments: "stripe" }).

### `InstallResult`
**Properties:**
- `doc: OpenAPIv4Document` — The merged document (UNCHANGED from `base` when installed === false).
- `conflicts: string[]` — Collision / requirement errors; non-empty ⇒ the install was REFUSED.
- `added: { schemas: string[]; operations: string[] }`
- `installed: boolean`

### `ModuleEntry`
**Properties:**
- `title: string`
- `description: string`
- `module: SulukModule`

### `ModuleRegistry`
**Properties:**
- `name: string`
- `homepage: string` (optional)
- `modules: ModuleEntry[]`

### `ModuleGrade`
**Properties:**
- `grade: "A" | "B" | "C"`
- `score: number` — 0..1 — cost-declaration coverage minus a documentation-warning penalty.
- `costCoverage: number` — fraction of the module's operations that declare a cost (the real, author-attributable signal).
- `warnings: number` — real documentation problems (audit `warn`s) on the module's authored ops.
- `notes: string[]`

### `InstallPreview`
**Properties:**
- `willInstall: boolean`
- `conflicts: string[]`
- `requires: string[]`
- `missingRequires: string[]`
- `addsSchemas: string[]`
- `addsOperations: string[]`
- `cost: { operation: string; estimateMicroUsd: number }[]`
- `grade: ModuleGrade`

## providers

### `ProviderImpl`
Provider SLOTS (M3) — "swap out a provider you chose." A module declares `providerSlots` (e.g.
`{ payments: "stripe" }`); installModule records them into the document as `x-suluk-providers`. Each facet
(payments / auth / email / storage) is a SLOT bound to one implementation of a duck-typed interface — exactly
the pattern @suluk/stripe's `PaymentProvider` and @suluk/deploy's `DeployProvider` already prove. Swapping
rebinds the slot to another implementation of the SAME interface; the contract (the operations, their cost)
is unchanged — only the runtime binding differs. Pure (no host) → unit-tested.
**Properties:**
- `id: string`
- `facet: string`
- `title: string`
- `pkg: string` (optional) — the `@suluk` package (or ecosystem source) that implements this binding, if any
- `description: string`

### `ProviderBinding`
**Properties:**
- `facet: string`
- `impl: string` — the currently-bound implementation id
- `title: string`
- `known: boolean` — is `impl` a known implementation for this facet? (false ⇒ a custom binding)
- `alternatives: ProviderImpl[]` — the other implementations this slot could swap to

## registry-remote

### `RegistrySource`
A configured remote registry (persisted by the host).
**Properties:**
- `name: string`
- `url: string`
- `publicKey: JsonWebKey` (optional) — optional pinned publisher public key (JWK) — when set, the registry's signature is verified on every fetch

### `ParsedRegistry`
**Properties:**
- `name: string`
- `modules: ModuleEntry[]` — only the well-formed module entries
- `rejected: { title: string; reason: string }[]` — malformed entries, surfaced (title + why) rather than hidden

## signing

### `SignedEnvelope`
A signed registry payload: the registry value + a detached base64 signature over its canonical bytes.
**Properties:**
- `registry: unknown`
- `signature: string` — base64 ECDSA-P256/SHA-256 signature over canonicalBytes(registry)
- `publisher: string` (optional)

## compose

### `ComposeResult`
**Properties:**
- `doc: OpenAPIv4Document`
- `steps: ComposeStep[]`
- `plan: CompositionPlan`
- `ok: boolean` — true ⇒ the plan was complete AND every step installed cleanly

### `CompositionPlan`
**Properties:**
- `order: SulukModule[]` — modules in install order — each one's requires are met by the base or an earlier entry
- `unmet: { module: string; requires: string }[]` — requirements neither the base nor ANOTHER selected module provides (a self-provide cannot bootstrap)
- `collisions: string[]` — clashes installModule would refuse even with names satisfied: duplicate module, two providers of one
 entity (incl. the base), or two entity names mapping to one lowercased path resource
- `unresolved: string[]` — modules that could not be ordered — they require each other, or sit behind a cycle
- `ok: boolean` — true ⇒ the whole set installs in `order` with every requirement met and no collision (matches composeModules)

## modules

### `StackTemplate`
A named set of modules that compose into a working platform (L2 — the non-developer flow).
**Properties:**
- `name: string`
- `description: string`
- `modules: string[]` — module names, resolved against a registry
