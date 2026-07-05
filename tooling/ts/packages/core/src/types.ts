/**
 * OpenAPI v4.0 "Suluk" Candidate — TypeScript type definitions for the document model.
 *
 * Mirrors specification/candidate-v4/v4-meta-schema.json and the pinned canonical model (SPEC §1),
 * per ADRs C003/C004/C005/C009/C013/C019. CANDIDATE, not official OAS. Provisional (~0.55–0.65);
 * revisable with the ADRs.
 *
 * Inner Schema Objects are JSON Schema 2020-12. Through C013–C098 they were an OPAQUE type
 * (`Record<string, unknown> | boolean`) — validation is delegated to the 2020-12 dialect, so the meta-schema
 * treats them as a black box. **C099** renders that same dialect as a PRECISE in-language model
 * ({@link SchemaObject} + {@link Static}) — the descriptive source-of-truth for what an input or output can be —
 * WITHOUT changing what validates (the dialect stays the runtime authority) and WITHOUT a runtime dependency.
 * The shape is TypeBox/JSON-Schema-aligned (a `@sinclair/typebox` `TSchema` is assignable to {@link SchemaObject});
 * Zod stays the AUTHORING source of truth (`@suluk/zod`'s `zodToV4` emits into this type — C099 only names the target).
 * The {@link OpaqueSchema} member keeps {@link Schema} a strict SUPERSET of the old opaque type (backward-compatible).
 *
 * For a TS library / vscode extension: import these as the parsed-document model; use {@link isReference}
 * to discriminate an OpenAPI Reference Object from an inline Schema (the C019 slot+token rule).
 *
 * This file is the WHOLE typed source-of-truth for `@suluk/core` — including the non-normative event-architecture
 * model (CloudEvents 1.0.2 + AsyncAPI 3.x, C100) in its own clearly-marked section below. One file, one place to
 * look: `@suluk/core`'s public API is flat regardless of internal layout, so splitting by concern into a second
 * file bought nothing and only made it look like two documents to maintain.
 */

/** Top-level OpenAPI v4 document. */
export interface OpenAPIv4Document {
  /** e.g. "4.0.0-candidate". */
  openapi: string;
  info: Info;
  servers?: Server[];
  /** Map keyed by tag name (C009). */
  tags?: Record<string, Tag>;
  /** Map keyed by RFC6570 parseable-profile uriTemplate (C005). */
  paths: Record<string, PathItem>;
  /** Document-level responses reusable across all operations (§5). */
  apiResponses?: Record<string, Response>;
  /** Incoming operations not hosted at the API's own paths (§14, C018). */
  webhooks?: Record<string, Request>;
  /**
   * JOBS vendor map (C025) — non-HTTP background work (cron / queue consumers) that has NO inbound Request, so it
   * can't live in `paths` or `webhooks`. The first-class home C024 pre-blessed for its `scheduled`/`queue-consumed`
   * cost triggers. A VENDOR EXTENSION (the `x-suluk-*` namespace) — NOT a normative async construct (C018 scope held).
   */
  ["x-suluk-jobs"]?: Record<string, SulukJob>;
  /**
   * AGENTS vendor map (C027) — `x-suluk-agents`. A composition manifest layered ON TOP of the API: each SulukAgent
   * is an LLM-orchestrated unit of SKILLS (model-bearing instruction bundles) + deterministic ROUTES (by-name
   * $refs into EXISTING operations, no `model`) + optional sub-AGENTS (by-name refs; recursion bounded by a
   * REQUIRED `maxDepth` + a cycle-linter, never the schema). A VENDOR EXTENSION riding the C025 `x-suluk-jobs`
   * precedent EXACTLY — NOT a normative kind, NEVER read by the DOM→ADA matcher (D1 held; see
   * plan/facts/0agents-d1.bn + test/agents-d1-invariance.test.ts). Selection/tiering is RUNTIME-ADVISORY;
   * determinism is DECLARED, never enforced. Severable: a 3.1 downgrade DROPS this map whole and the routes
   * survive as the ordinary operations they always referenced. Originated, low ceiling (~0.52); pairs with ADR C027.
   */
  ["x-suluk-agents"]?: Record<string, SulukAgent>;
  /**
   * POLICY vendor map (C028) — `x-suluk-policy`, keyed by OPERATOR/fleet name (not agent name: the operator owns
   * it, one policy spans many third-party agents). An operator-owned governance overlay that NARROWS what an agent
   * self-declares (effective = INTERSECT(operatorPolicy, agentSelfDeclaration); monotone — never grants). Rides the
   * x-suluk-jobs/x-suluk-agents move EXACTLY: optional, additive, NO new normative kind, NEVER read by the matcher
   * (D1; see plan/facts/0policy-d1.bn + test/policy-d1-invariance.test.ts). Only the STATIC subset is decidable here;
   * the `costCeiling` is DECLARED, enforced by a runtime adapter (`enforcedBy`), never by the schema. Originated, low
   * ceiling (~0.52); pairs with ADR C028.
   */
  ["x-suluk-policy"]?: Record<string, SulukPolicy>;
  /**
   * RESOURCES vendor map (C036) — `x-suluk-resources`. The loadable, on-demand CATALOG of instructions / references /
   * scripts an agent can ACTIVATE when a task matches (Cloudflare "Agent Skills" / loadable context-memory alignment;
   * this is the `x-suluk-resources` name C035 RESERVED, now defined by operator direction). Distinct from a `skill`
   * (model-bearing, always-on system text): a resource is content-only, lazy, and carries no model. Rides the
   * x-suluk-jobs/agents/policy move EXACTLY — optional, additive, NO new normative kind, NEVER read by the matcher
   * (D1; a new x-* sibling is invisible to buildAda — see test/resources-d1-invariance.test.ts). Content is a
   * PROVENANCE POINTER (the catalog/SKILL.md is GENERATED, hashed for drift), never inlined. Experimental-anchored
   * (CF Agent Skills + script execution are experimental) ⇒ honestly LOW ceiling (~0.5); pairs with ADR C036.
   */
  ["x-suluk-resources"]?: Record<string, SulukResource>;
  /**
   * REACTIVE notify policy (C037) — `x-suluk-notify`. A document-level status→severity map that drives the CALLBACK
   * layer of the `@suluk/sdk` reactive client: which responses surface to the user, and how. CLIENT-CODEGEN ONLY —
   * read by NO server path, NO runtime, NO matcher; strictly weaker than every other x-suluk-* facet (those at least
   * feed runtime-advisory selection). Optional, additive, NO new normative kind, NO meta-schema change. Pairs with the
   * per-op `x-suluk-store` facet + ADR C037. Originated, low ceiling (~0.5).
   */
  ["x-suluk-notify"]?: SulukNotifyPolicy;
  /**
   * PROVISION vendor map (C101) — `x-suluk-provision`. A document-level declaration of the backing infrastructure
   * (a Cloudflare D1 database, a KV namespace, a Stripe account, a scoped token, …) the app needs, keyed by REF
   * (C009 by-name identity — the same `ref` a provisioning consumer resolves `@<ref>.<key>` binding-references
   * against, e.g. `@db.database_id`). ANNOTATES broker intent only — no OSB wire ceremony (`dashboard_client` /
   * `maintenance_info` / `schemas` / …) belongs here, by design: `@suluk/provision`'s `deriveInstanceSpecs`
   * PROJECTS this into its own `InstanceSpec[]` (the shape its mature plan/apply/bind engine already consumes,
   * unchanged), and a real {@link Broker} expands an instance further into the full OSB wire contract below.
   * Rides the x-suluk-jobs/agents/policy/resources move EXACTLY: optional, additive, NO new normative kind, NEVER
   * read by the DOM→ADA matcher (D1 held — provisioning is a build/deploy-time concern, never a request-routing
   * one; see plan/facts/0osb-provision-facet.bn + test/provision-d1-invariance.test.ts). Originated, low ceiling
   * (~0.55) — a genuinely new facet, not yet consumed by a live registry app; pairs with ADR C101.
   */
  ["x-suluk-provision"]?: Record<string, SulukProvisionInstance>;
  components?: Components;
  [ext: `x-${string}`]: unknown;
}

/**
 * A loadable RESOURCE (C036) — a member of the top-level `x-suluk-resources` catalog. Cloudflare's "Agent Skills"
 * model, in Suluk's contract-first form: an on-demand bundle of content the agent loads only when a task matches, so
 * a large library does not bloat every prompt. NOT a {@link SulukSkillRef} (which is model-bearing, always-on system
 * text) — a resource carries NO model and is content-only. Structural; never read by the matcher.
 */
export interface SulukResource {
  /** required, routing-oriented — the catalog-listing text the model sees and selects on (mirrors a CF skill description). */
  description: string;
  /** the kind of loadable content: `instructions` (a SKILL.md the agent activates), `reference` (a bundled doc it reads), `script` (a bundled script it can run — CF script execution is EARLY/experimental). */
  kind: "instructions" | "reference" | "script";
  /** single source of truth + staleness binding — the catalog/SKILL.md is GENERATED from `source`, hashed to detect drift (the same pointer-not-prose discipline as a skill, C027). */
  provenance: { source: string; contentHash: string; version?: string };
  /** author-declared (trusted) vs retrieved (untrusted) — a retrieved resource may NOT escalate scope/provenance (mirrors SulukSkillRef.trust). */
  trust?: "author-declared" | "retrieved";
  [ext: `x-${string}`]: unknown;
}

/** A by-name reference to a loadable resource within the same `x-suluk-resources` catalog (C036; resolved at projection, never by the matcher; mirrors SulukAgentRef). */
export interface SulukResourceRef {
  /** a by-name `$ref` like `#/x-suluk-resources/<key>` (never an inline resource). */
  ref: string;
}

/**
 * A REACTIVE-STORE declaration (C037) — the per-operation `x-suluk-store` facet. The contract's statement of how the
 * frontend should turn this operation into reactive state, so the `@suluk/sdk` generator can emit a ready-to-use
 * reactive client (states + events + callbacks) instead of every consumer hand-wiring stores + invalidation. A QUERY
 * (read) BACKS a store; a MUTATION (write) INVALIDATES stores on success. `key` (query) and `invalidates` (mutation)
 * are DISJOINT roles — presence-of-`key` discriminates query-vs-mutation, mirroring C027's presence-of-`model`
 * skill-vs-route discriminator. CLIENT-CODEGEN ONLY: the reactive layer reads it; the matcher/runtime NEVER do. Every
 * field names author-chosen STORE names or param NAMES — NEVER a request/header/body/query VALUE — so nothing here can
 * leak into a request selector (D1 safe; see plan/facts/0reactive.bn + test/store-d1-invariance.test.ts). Structural.
 */
export interface SulukStore {
  /** QUERY role: the stable store name the generator projects to a `$<key>` reactive store (C009 by-name identity). */
  key?: string;
  /** QUERY role: cache lifetime in SECONDS before the store revalidates (the generator's cacheLifetime hint). */
  ttl?: number;
  /** QUERY role: revalidate the store when the window/tab regains focus (default false). */
  revalidateOnFocus?: boolean;
  /** QUERY role: the path/query PARAM NAMES (never values) that key a parameterized store family — one store per distinct arg tuple. */
  params?: string[];
  /** MUTATION role: the store `key`s this operation invalidates on a successful (2xx) response → the generated client refetches them. */
  invalidates?: string[];
  /** the success message the callback layer surfaces on a 2xx (advisory; the renderer is INJECTED, the text is DECLARED). */
  onSuccess?: string;
  [ext: `x-${string}`]: unknown;
}

/** What KIND of thing a {@link SulukRunNode} represents — whether it's fully authored in this codebase, calls out to
 *  another service, wraps a generic/library primitive, or reaches an imported package function. */
export type SulukRunNodeKind = "internal" | "external" | "generic" | "package";

/**
 * One node in an operation's `x-suluk-run` PIPELINE (C104) — a named, addressable step. `label` is this node's stable
 * identity (referenced by {@link SulukRunEdge.after}); `kind` says what KIND of thing runs here; `from` is an advisory
 * provenance pointer (a module path / package name / external service name). `stub: true` marks a node with NO real
 * implementation yet — a placeholder a generator can turn into a real file (see `@suluk/effect`'s `ref()`).
 *
 * Every field below is either DECLARED-AND-ENFORCED (the runtime actually does it) or DECLARED-ONLY (advisory — a
 * reader/generator can act on it, but `@suluk/effect` does not, yet); each doc comment says which, honestly, the
 * same way {@link SulukApproval}/{@link SulukPolicy} distinguish declaration from enforcement elsewhere in this file.
 */
export interface SulukRunNode {
  label: string;
  kind: SulukRunNodeKind;
  /** advisory: a module path, npm package name, or external service name this node runs against. */
  from?: string;
  /** true when this node has no real implementation yet (a `ref()` placeholder with no `run` supplied). */
  stub?: boolean;
  /** this node's own declared error tags (mirrors an httpError's `errorTag`). The STATUS each tag maps to is not
   *  repeated here — cross-reference the operation's own `responses` (each error class already carries its status);
   *  duplicating it here would be a second, driftable copy of the same fact. */
  errors?: string[];
  /** this node's request shape, as JSON Schema 2020-12 (`@suluk/zod`'s `zodToV4`) — present when the node declared
   *  one (a `sulukFn`'s `body`, or `ref()`'s `input`). Readable statically; feeds stub codegen + per-node docs/audit. */
  input?: SchemaOrRef;
  /** this node's response shape, as JSON Schema 2020-12 — present when the node declared one (`ok.schema` / `ref()`'s
   *  `output`). For a NON-terminal node this is an intermediate value, not the operation's own response. */
  output?: SchemaOrRef;
  /** DECLARED-AND-ENFORCED: `@suluk/effect` wraps this node's run in a real `Effect.retry` at construction time —
   *  `times` more attempts after the first, `delayMs` (if given) spaced between them. `whenErrorTags` (C108) is ALSO
   *  DECLARED-AND-ENFORCED: when given, a real `Schedule.recurWhile` filter is intersected in, so retries fire ONLY
   *  for a failure whose tag is in the list — any other tag propagates immediately on first failure. Absent ⇒
   *  retries on ANY tagged failure (unchanged pre-C108 behavior) — this closes the "blind retry of a possibly-non-
   *  idempotent failure" gap by letting an author name exactly which failures are safe to retry blindly. */
  retry?: { times: number; delayMs?: number; whenErrorTags?: string[] };
  /** DECLARED-AND-ENFORCED: wrapped in a real `Effect.timeout` — a run that exceeds this many ms fails with a typed
   *  504 (`@suluk/effect`'s `TimeoutError`), never left to hang. */
  timeoutMs?: number;
  /** DECLARED-ONLY (advisory): true when calling this node twice with the same input is safe. NOT enforced — there
   *  is no dedup/idempotency-key machinery yet; a caller/auditor reads this to judge whether `retry` is actually safe. */
  idempotent?: boolean;
  /** DECLARED-ONLY (advisory, C108): what KIND of side effect this node has — `"read"` (no observable side effect),
   *  `"write"` (mutates state), or `"emit"` (fires an external signal — an email, a webhook, a queued job). NOT
   *  enforced or inferred; a reader/auditor uses it alongside `idempotent`/`retry` to judge whether blind retry is
   *  actually safe (e.g. flag a `retry`-bearing node whose `effect` is `"write"`/`"emit"` and `idempotent` isn't
   *  `true` — `@suluk/harden`'s audit is the natural home for that check, not this facet). */
  effect?: "read" | "write" | "emit";
  /** DECLARED-ONLY (advisory, C108): true when this node's own correctness DEPENDS on the caller supplying a real
   *  idempotency key (e.g. a payment charge). NOT enforced here — there is no dedup-store/result-cache machinery in
   *  `@suluk/effect` (a real one needs a storage backend — a KV/D1-backed store, the same shape as `@suluk/hono`'s
   *  existing `RateLimitStore` — and belongs there or in a dedicated package, not bolted onto this pure-Effect
   *  graph facet); this field only lets a reader/auditor see WHICH nodes need that guarantee from elsewhere. */
  requiresIdempotencyKey?: boolean;
  /** DECLARED-ONLY (advisory, C108): WHERE `requiresIdempotencyKey`'s key comes from on the wire — a header NAME
   *  or a request-body FIELD NAME. Documentation only: nothing here reads the request or extracts the value; there
   *  is no dedup-store to hand it to yet (see `requiresIdempotencyKey`'s own doc comment). Deliberately NOT a
   *  `{fromNode, fromPath}`-style graph binding — this always names a REQUEST-level source (something the caller
   *  sent), never another node's output, so no value-resolution/interpreter is implied by declaring it. */
  idempotencyKeySource?: { header: string } | { bodyField: string };
  /** DECLARED-ONLY (advisory, C110): the dedupe/result-cache BUDGET this node's operation declares — mirrors
   *  {@link SulukDedupe} (the same shape `@suluk/hono`'s `enforceDedupe` middleware reads off the operation's
   *  `x-suluk-dedupe` facet and REALLY enforces via a swappable `DedupeStore`). This field is a REFLECTION for a
   *  graph-only reader (e.g. `@suluk/journeys`'s audit) to see the concrete budget without re-reading the raw
   *  document facet — `@suluk/effect` itself still enforces nothing here; the store lives at the HTTP boundary,
   *  closing the gap `requiresIdempotencyKey`'s doc comment named (C108: "belongs there... not bolted onto this
   *  pure-Effect graph facet" — it's bolted onto `@suluk/hono` instead, this is just the mirror). */
  dedupe?: { ttlMs: number; scope?: string };
  /** DECLARED-AND-ENFORCED (C105): the LABEL of the node (declared in the SAME `sulukFn`'s `node.compensate`, as a
   *  real function reference at authoring time — resolved to this label for the wire-safe graph facet) that
   *  `@suluk/effect` invokes automatically if a LATER step in this node's own pipeline fails after this node itself
   *  already succeeded. Scoped narrowly: it fires on ANY downstream failure (not a specific tag), runs against the
   *  ORIGINAL input this node received, and its own failure is swallowed (best-effort, never masks the real error).
   *  A `sulukFmt` pipeline compensates already-succeeded steps in REVERSE order; `sulukFmt.all` compensates every
   *  branch that itself completed, if the fan-out as a whole failed. NOT invoked for a `race`/`quorum` LOSER that
   *  gets interrupted mid-flight (C106) — interruption bypasses the tap-based ledger the same way it bypasses a
   *  plain `Effect.catchAll`; compensating an interrupted branch is a deliberately out-of-scope boundary, the same
   *  honest limitation C105 already drew around distributed-saga semantics. */
  compensate?: string;
  /** COMPUTED (C107), never authored — this node's OWN `recover` map, SERIALIZED directly as a first-class list
   *  (not only inferable by scanning the graph's `edges` for ones this node happens to source) — a convenience
   *  projection of the exact same `"error"`/`errorTag` edges already present, never a second source of truth (it is
   *  derived from, and can never disagree with, those edges). Absent when this node declares no `recover`. */
  recover?: { errorTag: string; to: string }[];
  /** COMPUTED (C106), never authored — what STRUCTURAL role this node plays in its own graph, derived purely from
   *  its own fields + the edges touching it (recomputed at every merge, exactly like `terminals`/`resultNode`, so
   *  it can never drift or be hand-set inconsistently): `"join"` when `join` is set, else `"aggregate"` when
   *  `aggregate` is set, else `"branch"` when this node is the SOURCE of at least one `"branch"` edge (a decision
   *  point), else `"task"` (the default — an ordinary step). Purely descriptive for a reader/generator/audit tool;
   *  never read by `@suluk/effect` itself to decide anything. */
  shape?: "task" | "branch" | "join" | "aggregate";
  /** DECLARED-AND-ENFORCED (C106): present on a synthetic convergence node `sulukFmt.all`/`sulukFmt.race`/
   *  `sulukFmt.quorum` add when given a `label` — names the REAL awaiting strategy `@suluk/effect` used: `"all"`
   *  (the default — every branch must settle, `Effect.all`), `"any"` (first SUCCESS wins, the rest are interrupted,
   *  `sulukFmt.race`), or `"quorum"` (first `quorum` successes win, the rest interrupted, `sulukFmt.quorum`). */
  join?: { policy: "all" | "any" | "quorum"; quorum?: number };
  /** DECLARED-AND-ENFORCED (C106/C107): present alongside `join` on that SAME synthetic convergence node — names
   *  the REAL merge that actually produced this node's `output`: `"object"` (a keyed `{a,b,...}`, `sulukFmt.all`'s
   *  default merge), `"array"` (an ordered list, `sulukFmt.quorum`'s default merge), `"first"` (the single winning
   *  branch's own output, unwrapped, `sulukFmt.race`'s default merge), or `"custom"` (C107 — a real, author-supplied
   *  `project` FUNCTION reshaped the branches' outputs into something else entirely; the function itself is never
   *  serialized, only this strategy tag — the same "live function at authoring time, descriptive tag on the wire"
   *  boundary `recover`/`compensate`/`branch` already draw). */
  aggregate?: { strategy: "object" | "array" | "first" | "custom" };
  /** for `"object"` — COMPUTED, never authored: maps each OUTPUT key to the source branch's own node LABEL (only
   *  entries whose branch actually has one), a first-class SERIALIZATION of the same fact `okShape`'s keys already
   *  imply structurally. For `"custom"` — AUTHOR-SUPPLIED, optional free text (a `describe` string passed to
   *  `opts.project`): there is no derivable field↔source mapping for an arbitrary function, so this is PROSE, not a
   *  reference the graph could resolve — never claims more precision than a function allows. Absent for `"array"`/
   *  `"first"` (an ordered/singular result has no per-key mapping to serialize) unless `"custom"` also applies. */
  aggregateProjection?: Record<string, string> | string;
}

/**
 * One dependency edge in a `x-suluk-run` graph: `to` runs only after every node named in `after` has settled.
 * A node that never appears as `to` in any edge is a graph ROOT (no upstream dependency).
 */
export interface SulukRunEdge {
  to: string;
  after: string[];
  /** which outcome of `after` this edge represents. `"success"` (the default, absent ⇒ `"success"`) is what
   *  `sulukFmt`/`sulukFmt.all`'s ordinary sequential/fan-out wiring produces — it, and `"branch"` (C106, below),
   *  are both FORWARD-PROGRESS edges (they shape `terminals`/`resultNode`/`roots` the same way). `"error"` is
   *  DECLARED-AND-ENFORCED for three narrow, TYPE-SCOPED cases, each deliberately EXCLUDED from `terminals`/`roots`
   *  (a fallback/compensator is a conditional REPLACEMENT, not a second exit point): (C105) a node's OWN `recover`
   *  map (an edge per declared error tag it catches, routing to that tag's fallback node) and a node's OWN
   *  `compensate` pointer (an edge to the compensating node, walked automatically on pipeline failure); (C107)
   *  `sulukFmt.recover`'s PIPELINE-WIDE recovery — an edge per declared tag, from the whole pipeline's own `roots`
   *  (the recovery can fire for a failure from ANY step inside it, not just one node's own) to that tag's fallback.
   *  `"branch"` is DECLARED-AND-ENFORCED (C106) for `sulukFmt.branch`: an edge per CASE, from the branch's own
   *  decision point (if labeled) to that case's entry node(s) — scoped to a node's OWN declared cases, chosen by a
   *  real, type-checked discriminator FUNCTION supplied at authoring time; the graph DATA never encodes or
   *  re-interprets the decision logic itself (see `when`) — it only records which case each edge represents. */
  on?: "success" | "error" | "branch";
  /** present only when `on === "error"` — the error tag (an httpError's `errorTag`) this edge fires for, so a graph
   *  reader can see WHICH failure routes where. Absent for `"success"`/`"branch"` edges and for a `compensate` edge
   *  (compensation runs on ANY failure of the guarded node's pipeline position, not one specific tag). */
  errorTag?: string;
  /** present only when `on === "branch"` — the CASE KEY this edge represents, sourced structurally from
   *  `Object.keys(cases)` (mirroring how `errorTag` is sourced from `Object.keys(recover)`) — NEVER free-form
   *  author-typed prose, so it can never independently drift from the real discriminator function's actual
   *  case set. */
  when?: string;
  /** OPTIONAL (C107), author-supplied, human-readable prose describing this `"branch"` edge's real-world condition
   *  (e.g. `"payment method is card"`) — purely SUPPLEMENTARY to `when` (the authoritative case key), never a
   *  substitute for it and never itself evaluated by anything; there is no executable predicate representation in
   *  this facet (a `SulukRunEdge` cannot decide which case fires — the real discriminator function already did). */
  guardDescription?: string;
}

/**
 * The `x-suluk-run` facet (C104) — an operation's run PIPELINE, as DATA: every node it composes (internal ops,
 * external calls, generic/package-imported ops, or not-yet-written stubs) plus the dependency edges between them.
 * NON-NORMATIVE — a companion projection, the same treatment as C037's `x-suluk-store`/C094's `x-suluk-scenario`:
 * `@suluk/effect`'s `sulukFmt`/`sulukFmt.all`/`sulukFmt.branch`/`sulukFmt.race`/`sulukFmt.quorum` (C106) PRODUCE it
 * as a byproduct of composing (never a hand-authored parallel spec — it cannot drift from the real pipeline because
 * it's derived from the exact calls that build it), and it drives `@suluk/journeys`'s graph-shaped BDD scenario
 * generation plus stub codegen for `stub: true` nodes. NEVER read by the DOM→ADA matcher (D1) — this is a
 * design-time/audit concern, not a request-routing one. Absent when a pipeline declares no node labels at all (the
 * default — zero impact on every existing route). VALIDATED (C105): `@suluk/effect` rejects a cyclic graph, or one
 * whose edges/`compensate` name a node that doesn't exist, at construction time — a malformed graph can never be
 * stamped onto a real document. C106 revises the C093/C104/C105 "exactly two combinators" framing: `sulukFmt`
 * (linear) and `sulukFmt.all` (unconditional fan-out) remain the base pair, but `sulukFmt.branch` (conditional,
 * type-checked routing over a node's own declared cases) and `sulukFmt.race`/`sulukFmt.quorum` (first-success /
 * first-N-of-M convergence) are now real, additional combinators — each still scoped narrowly (a real TS
 * discriminator/merge FUNCTION at authoring time, resolved to descriptive-only data on the wire; never a data-
 * interpreted expression language, never a second execution engine reading the graph back).
 */
export interface SulukRunGraph {
  nodes: SulukRunNode[];
  edges: SulukRunEdge[];
  /** the node(s) NOTHING (along the FORWARD-PROGRESS success/branch path) depends on yet — a graph's own ENTRY
   *  points. COMPUTED (C106, the dual of `terminals`), recomputed at every merge alongside it. */
  roots: string[];
  /** the node(s) whose output becomes THIS graph's result (nothing yet depends on them) — COMPUTED, never authored.
   *  At the operation's outermost (route-level) graph, a terminal node's `output` is the operation's own response. */
  terminals: string[];
  /** the SINGLE node whose output IS the graph's result — COMPUTED (C105), present iff `terminals.length === 1`.
   *  Absent when `terminals` holds more than one label (e.g. a route built directly over an un-followed fan-out):
   *  the response is then a DERIVED composite of several nodes (`sulukFmt.all`'s keyed merge), not one node's raw
   *  output, and this field says so honestly by staying absent rather than picking an arbitrary "winner". */
  resultNode?: string;
  /** the WHOLE graph's own request shape — COMPUTED (C106), present iff `roots.length === 1`, taken from that
   *  single root's own `input`. Absent (honestly) when the graph has multiple independent entry points. */
  input?: SchemaOrRef;
  /** the WHOLE graph's own response shape — COMPUTED (C106), present iff `resultNode` is defined, taken from that
   *  node's own `output`. This is the PRE-`view`-wrap domain shape (same caveat as {@link SulukRunNode.output}),
   *  not necessarily the literal wire response body a client receives — a route's `view` still wraps it. */
  output?: SchemaOrRef;
  /** COMPUTED (C107) — `sulukFmt.recover`'s PIPELINE-WIDE recovery, SERIALIZED as a first-class list at the GRAPH
   *  level (not a single node's own): unlike {@link SulukRunNode.recover} (one node's OWN declared errors), this
   *  policy can catch a tag raised by ANY step in the graph, so it belongs to the graph as a whole, not one node.
   *  Derived from, and can never disagree with, the `"error"`/`errorTag` edges wired from the graph's own `roots`. */
  recoverPolicy?: { errorTag: string; to: string }[];
}

/** A status→severity entry value for {@link SulukNotifyPolicy} (C037) — how loudly the generated client surfaces a response. */
export type SulukNotifySeverity = "silent" | "info" | "success" | "warn" | "error";
/**
 * The document-level `x-suluk-notify` policy (C037) — a status→severity map driving the `@suluk/sdk` callback layer.
 * Keys are an HTTP status (`"402"`), a status CLASS (`"2xx"` | `"4xx"` | `"5xx"`), or `"network"` (no response). The
 * value is the severity the generated client raises through an INJECTED `notify(severity, problem)` adapter (the
 * consumer wires it to their toaster — policy DECLARED, rendering INJECTED). A specific status beats its class.
 * CLIENT-CODEGEN ONLY; never read by the matcher/runtime.
 */
export type SulukNotifyPolicy = Record<string, SulukNotifySeverity>;

/**
 * A background job (C025) — non-HTTP work fired by a `scheduled` (cron) or `queue-consumed` trigger. It carries no
 * Request/Response (there is no HTTP exchange); its STATIC fields (trigger + schedule/queue) are locally decidable,
 * and it carries the same advisory `x-suluk-*` facets an operation does (notably `x-suluk-cost` with a matching
 * `trigger`, so a job's cost is declared + audited like any other). Provenance via `x-suluk-source`.
 */
export interface SulukJob {
  /** the non-HTTP trigger that fires this job. */
  trigger: "scheduled" | "queue-consumed";
  /** for "scheduled": a cron expression (statically declared — e.g. "0 0 * * *"). */
  schedule?: string;
  /** for "queue-consumed": the queue name the consumer drains. */
  queue?: string;
  summary?: string;
  description?: string;
  /** where in the authored source this job was projected from (advisory provenance; mirrors Request). */
  ["x-suluk-source"]?: SulukSource;
  /** any other vendor facet — notably `x-suluk-cost` (the job's declared cost, read by @suluk/cost). */
  [ext: `x-${string}`]: unknown;
}

/**
 * A declared PROVISION need (C101) — a member of the top-level `x-suluk-provision` map. The map KEY is its `ref`
 * (C009 by-name identity — the SAME name a `params` binding-reference like `@db.database_id` resolves against), so
 * unlike the seam's `InstanceSpec[]` (an array carrying its own `ref` field) this entry omits `ref`: it's implied by
 * the map key, mirroring how `x-suluk-jobs`/`x-suluk-agents` key their maps by name rather than repeating an `id`
 * field inside each value. Mirrors `@suluk/provision`'s `InstanceSpec` fields exactly minus `ref`; `@suluk/provision`'s
 * `deriveInstanceSpecs` is the one place that reintroduces `ref` (from `Object.entries`) to produce its own type.
 */
export interface SulukProvisionInstance {
  /** the broker id that provisions it (must match a catalog offering's id), e.g. "cloudflare-d1". */
  service: string;
  /** the plan id; defaults to the offering's first plan. */
  plan?: string;
  /** the provider-facing name, e.g. "toolfactory-db". */
  name: string;
  /** provision params (broker-specific). A string value of the form `@<ref>.<key>` is a BINDING REFERENCE, resolved
   *  at apply time from that producer instance's outputs — this is what wires the provisioning DAG. */
  params?: Record<string, unknown>;
  /** binding outputs → env var names: where this instance's credentials/ids LAND. e.g. `{ database_id: "CLOUDFLARE_D1_ID" }`. */
  bind?: Record<string, string>;
  /** guard a stateful resource (a database, a bucket) from destruction: `prune`/`teardown` SKIP it unless forced. */
  protected?: boolean;
  /** where in the authored source this need was declared (advisory provenance; mirrors {@link SulukJob}'s field). */
  ["x-suluk-source"]?: SulukSource;
  [ext: `x-${string}`]: unknown;
}

/**
 * A composition agent (C027) — an LLM-orchestrated unit. The map KEY is its stable wire-level identity (the emitted
 * MCP-tool / OpenRouter-function id; C009 by-name, never by index). It carries NO Request/Response and is NEVER
 * consulted by the request→operation matcher (D1). `description` is required + routing-oriented (the field the
 * serving LLM selects on). `routes` are deterministic (a by-name `operationRef` into an existing operation, NO
 * `model`); `skills` are LLM (a `model` is present). `agents` are by-name sub-agent refs; `maxDepth` is REQUIRED
 * whenever `agents` is non-empty (a typed LEAF = `maxDepth` 0, `agents` {}), and a cycle-linter rejects name-cycles
 * at author/install time (JSON-Schema cannot express acyclicity). A child's effective scope is INTERSECTION(child,
 * caller), never union. Determinism is DECLARED, never schema-enforced.
 */
export interface SulukAgent {
  /** required, routing-oriented — the field the serving LLM selects on (a lint rejects empty/one-word). */
  description: string;
  /** static resource:action authz; the agent's complete reachable surface is statically enumerable from the document. */
  scope?: string[];
  /** instruction bundles; PRESENCE of `model` is the hard static skill(LLM)-vs-route(deterministic) discriminator. */
  skills?: Record<string, SulukSkillRef>;
  /** deterministic routes: by-name `$ref`s into EXISTING operations; NO `model` field, ever. */
  routes?: Record<string, SulukRouteRef>;
  /** by-name sub-agent refs (never inline — inlining would fork C009 identity). */
  agents?: Record<string, SulukAgentRef>;
  /** by-name refs into the top-level `x-suluk-resources` catalog (C036) — the loadable, on-demand instructions/references/scripts this agent can ACTIVATE (CF "Agent Skills" alignment; lazy + advisory; resolved at projection, never by the matcher). */
  resources?: Record<string, SulukResourceRef>;
  /** REQUIRED when `agents` is non-empty (a lint, not the schema): the recursion depth ceiling; a leaf is 0. */
  maxDepth?: number;
  /** marks a tier whose retrieved / lower-tier content may NOT escalate scope or upgrade a figure's provenance. */
  trustBoundary?: "untrusted";
  /** advisory per-tier context budget (basis: estimate); fail-loud, never silent-zero. */
  contextBudget?: { tokens: number; basis: "estimate" };
  /**
   * THINKING ENVELOPE (C029) — a static cap on WITHIN-agent iteration (reason→tool→reason in the SAME completion,
   * context accreting), orthogonal to `maxDepth` (which bounds cross-agent nesting depth, a fresh context per hop).
   * `maxRounds` is REQUIRED when `thinking` is present. DECLARED-not-enforced: it bounds re-entries and is consumed
   * by the context analyzer (round-accretion) + the linter; it NEVER enforces termination, and is NEVER read by the
   * matcher. The loop TRAJECTORY (when/why each round stops) stays runtime-opaque (matching Strands / the Claude
   * Agent SDK / OpenAI Agents). There is deliberately NO stopCondition vocabulary — that would model runtime control
   * flow a generator could only echo. Absent ⇒ opaque single pass (zero-migration default). Conin's 6-round loop.
   */
  thinking?: { maxRounds: number; budget?: { tokens: number; basis: "estimate" } };
  /** any other vendor facet — notably `x-suluk-cost` (an agent/skill boundary's declared cost; PROVISIONAL per C026). */
  [ext: `x-${string}`]: unknown;
}

/** A by-name reference to a sub-agent within the same `x-suluk-agents` map (C009/C013; resolved at projection time, never by the matcher). */
export interface SulukAgentRef {
  /** a by-name `$ref` like `#/x-suluk-agents/<key>` (never an inline agent). */
  ref: string;
}

/**
 * A SKILL within an agent — an instruction bundle (the LLM tier). PRESENCE of `model` is what makes this a skill
 * (the system-text path) rather than a deterministic route. Skill text is a PROVENANCE POINTER (source URL +
 * content-hash + version), not inlined mutable prose: the served instructions are the single source of truth and a
 * projected SKILL.md is GENERATED from it, the content-hash binding making drift tool-detectable and fail-loud.
 */
export interface SulukSkillRef {
  /**
   * EXPLICIT model preference list (OpenRouter ids), cheap→capable — the opt-out path. OR declare NEEDS via
   * `modelProfile`/`modelPrefer`/`modelRequire` and let `@suluk/models` pick the best CURRENT model (a skill
   * declares what it needs, not a frozen id). Structural-only — never read by the matcher (C027 seam to @suluk/models).
   */
  model?: string[];
  /** a named selection profile resolved against the model catalog (@suluk/models). */
  modelProfile?: "tool-reliable" | "cheap-fast" | "balanced" | "max-reasoning" | "long-context" | "vision";
  /** escape-hatch preference weights (0-3) over the 4 author-facing axes. */
  modelPrefer?: { intelligence?: 0 | 1 | 2 | 3; cost?: 0 | 1 | 2 | 3; speed?: 0 | 1 | 2 | 3; context?: 0 | 1 | 2 | 3 };
  /**
   * explicit hard requirements the author adds (beyond what's derived from the agent + the context analyzer). `zdr`
   * (C030, verified 2026-06-13): require zero-data-retention serving — enforced at runtime via the router's
   * `provider:{zdr:true}` (which combines with `openrouter/auto`, confirmed by a live probe), since we have no
   * per-model ZDR fact to pin against; so a `zdr` skill resolves to the ROUTER, and conflicts with a region/license
   * operator policy that forces a pin.
   */
  modelRequire?: { needsStructured?: boolean; inputModalities?: string[]; minContext?: number; zdr?: boolean };
  /**
   * How the model is RESOLVED from the survivor set (C030): `pinned` (default) — a concrete reproducible id; `router`
   * — delegate the per-request pick to OpenRouter's auto-router fenced by our enumerated survivor allowlist (opt-in,
   * UNGOVERNED skills only — a governed skill declaring `router` fails loud at contract time); `latest` — a ~-latest
   * alias (defers the version to request time; NOT reproducible). The switch is governance-gated: an operator-policied
   * agent force-pins for reproducible, auditable behavior. Author surface only; never read by the matcher.
   */
  modelResolve?: "pinned" | "router" | "latest";
  /** static serving partition: `resident` (default tools/list) vs `cold-tail` (revealed via discover_tools). */
  tier?: "resident" | "cold-tail";
  /** routing-oriented precondition prose (runtime-advisory; never a request-value selector — D1). */
  whenToUse?: string;
  /** author-declared (trusted) vs retrieved (untrusted) content (a retrieved skill may not escalate scope/provenance). */
  trust?: "author-declared" | "retrieved";
  scope?: string[];
  /** single source of truth + staleness binding (SKILL.md is generated from `source`, hashed to detect drift). */
  provenance?: { source: string; contentHash: string; version?: string };
  [ext: `x-${string}`]: unknown;
}

/**
 * A deterministic ROUTE within an agent — EXCLUSIVELY a by-name `operationRef` into an EXISTING
 * paths[*]/webhooks/x-suluk-jobs operation (never an inline re-declaration — inlining forks C009 identity and
 * strands the operation on a 3.1 downgrade). It has NO `model` field, ever — that absence is the hard static
 * route-vs-skill discriminator. `guarantee` is DECLARED intent, never schema-enforced (mirrors C026 PROVISIONAL).
 */
export interface SulukRouteRef {
  /** a by-name `$ref` into an existing operation (resolve-linted; a dangling ref fails burhan-converge). */
  operationRef: string;
  /** declared determinism intent (advisory, unverifiable-by-schema); NOT enforced. */
  guarantee?: "same-in-same-out" | "idempotent" | "safe";
  /**
   * Static serving partition (C027): `resident` (in the default tool list) vs `cold-tail` (revealed via
   * `discover_tools` on demand). Absent ⇒ resident. This is what a serving adapter trims to make the cheap/lower
   * tier carry a SMALLER tool surface — the conditional context reduction the tiering thesis needs (it must be
   * actively performed by the adapter, never enforced by the schema).
   */
  tier?: "resident" | "cold-tail";
  scope?: string[];
  // NB: NO `model` field — by construction. A route never carries a model.
}

/**
 * An OPERATOR governance policy (C028) — a member of the `x-suluk-policy` map, keyed by operator/fleet name. Every
 * field is STATIC, locally decidable, and NARROW-ONLY: applying a policy can only REMOVE capability an agent
 * self-declared (effective = INTERSECT(policy, agent)), never grant. No field may reference request/DOM/header/body
 * values (D1; the #20 tripwire is declined here too). `appliesTo` binds BY AGENT NAME (`#/x-suluk-agents/<key>`).
 */
export interface SulukPolicy {
  /** by-name refs into x-suluk-agents keys this policy governs (NEVER a request predicate). Empty/absent ⇒ all agents. */
  appliesTo?: string[];
  /** operator's max scope ceiling — effective agent scope = INTERSECT(agent.scope, scopeAllowlist). */
  scopeAllowlist?: string[];
  /** deny/allow sub-agent keys (an allow-list, when present, is the only permitted set). */
  agents?: { deny?: string[]; allow?: string[] };
  /** deny/allow route (tool) keys. */
  tools?: { deny?: string[]; allow?: string[] };
  /** deny/allow the retrieval/untrusted tier's tools specifically (its non-deterministic blast radius). */
  retrievalTools?: { deny?: string[]; allow?: string[] };
  /** pin the MAX tier — a cold-tail skill under `capTier: resident` is downgraded (and flagged). */
  capTier?: "resident" | "cold-tail";
  /** the only model ids permitted — effective skill model[] = INTERSECT(skill.model, modelAllowlist). */
  modelAllowlist?: string[];
  /** an upper bound on recursion depth — effective maxDepth = min(agent.maxDepth, maxDepthCap). */
  maxDepthCap?: number;
  /** forbid sub-agents entirely (⇒ effective maxDepth 0). */
  forbidNesting?: boolean;
  /**
   * The operator's DECLARED cost cap — the third of cap/estimate/actual (estimate = the agent's own x-suluk-cost,
   * actual = the C026 reconciled charge). The SCHEMA DECLARES this number; it does NOT enforce it — `enforcedBy`
   * names who does (a runtime admission-gate / adapter). Required so a reader can never mistake declaration for
   * enforcement (C026 PROVISIONAL honesty).
   */
  costCeiling?: { amount: number; amountUnit: "micro-usd" | "cents" | "usd"; basis?: string; enforcedBy: "adapter" | "runtime" };
  [ext: `x-${string}`]: unknown;
}

export interface Info {
  title: string;
  version: string;
  /** A short summary of the API (OpenAPI 3.1+ parity). */
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
}

/** API contact information ({@link Info.contact}). */
export interface Contact {
  name?: string;
  url?: string;
  email?: string;
  [ext: `x-${string}`]: unknown;
}

/** API license ({@link Info.license}). `identifier` (an SPDX expression) and `url` are mutually exclusive. */
export interface License {
  /** REQUIRED license name. */
  name: string;
  identifier?: string;
  url?: string;
  [ext: `x-${string}`]: unknown;
}

/** Server IDENTITY — a by-name shape primitive (C015 #55); environment URL config is a deployment concern. */
export interface Server {
  url: string;
  description?: string;
  /**
   * OAS server-variable map for `{var}` substitution in `url`. Per C015 (#55) a Server is an IDENTITY primitive
   * (URL config is a deployment concern), so variables are ADVISORY parity metadata — never part of by-name identity.
   */
  variables?: Record<string, ServerVariable>;
}

/** A server-URL template variable ({@link Server.variables}). */
export interface ServerVariable {
  /** REQUIRED default substitution value. If `enum` is present, this MUST be one of its members. */
  default: string;
  /** the allowed values, if constrained to a set (MUST be non-empty when present). */
  enum?: string[];
  description?: string;
}

/** External documentation pointer — referenced from schemas, tags, and operations. */
export interface ExternalDocumentation {
  /** REQUIRED target URL. */
  url: string;
  description?: string;
}

/** A tag definition (keyed by name in `OpenAPIv4Document.tags`, C009 — so it carries no `name` field). */
export interface Tag {
  summary?: string;
  description?: string;
  /** Suluk-specific classifier retained from the candidate model. */
  type?: string;
  externalDocs?: ExternalDocumentation;
}

/** A pathItem, keyed in `paths` by its uriTemplate. Each request *is* an operation (SPEC §1.3/1.4). */
export interface PathItem {
  summary?: string;
  description?: string;
  servers?: Server[];
  /** Optional per-level inheritance wrapper (C012 #116). */
  shared?: Shared;
  /** The operations at this path, keyed by stable name (C009). At least one required. */
  requests: Record<string, Request>;
  /** Responses reusable across this pathItem's requests (§5). */
  pathResponses?: Record<string, Response>;
}

/** Optional inheritance wrapper; its `parameterSchema` is allOf-composed into each request (C012 #116, @0.55). */
export interface Shared {
  parameterSchema?: ParameterSchema;
}

export type HttpMethod =
  | "get" | "GET" | "put" | "PUT" | "post" | "POST" | "patch" | "PATCH"
  | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "trace" | "TRACE";

/**
 * The standard HTTP status vocabulary (C012) — every registered numeric status code mapped to its semantic name,
 * plus the two non-numeric tokens Suluk's response model accepts: `"5XX"` (a status-class wildcard) and `"default"`.
 * This is a VALUE lookup (code → name), not a map-key constraint — {@link Response.status} is the only field typed
 * against it (via {@link HttpStatus}). It exists to make "what is a valid HTTP status in this document" a checked,
 * enumerable TypeScript fact instead of an open `string | number`.
 */
export interface HttpStatusCode {
  100: "continue";
  101: "switchingProtocols";
  103: "earlyHints";
  200: "ok";
  201: "created";
  202: "accepted";
  203: "nonAuthoritativeInformation";
  204: "noContent";
  205: "resetContent";
  206: "partialContent";
  207: "multiStatus";
  208: "alreadyReported";
  226: "imUsed";
  300: "multipleChoices";
  301: "movedPermanently";
  302: "found";
  303: "seeOther";
  304: "notModified";
  305: "useProxy";
  307: "temporaryRedirect";
  308: "permanentRedirect";
  400: "badRequest";
  401: "unauthorized";
  402: "paymentRequired";
  403: "forbidden";
  404: "notFound";
  405: "methodNotAllowed";
  406: "notAcceptable";
  407: "proxyAuthenticationRequired";
  408: "requestTimeout";
  409: "conflict";
  410: "gone";
  411: "lengthRequired";
  412: "preconditionFailed";
  413: "contentTooLarge";
  414: "uriTooLong";
  415: "unsupportedMediaType";
  416: "rangeNotSatisfiable";
  417: "expectationFailed";
  418: "imATeapot";
  421: "misdirectedRequest";
  422: "unprocessableContent";
  423: "locked";
  424: "failedDependency";
  425: "tooEarly";
  426: "upgradeRequired";
  428: "preconditionRequired";
  429: "tooManyRequests";
  431: "requestHeaderFieldsTooLarge";
  451: "unavailableForLegalReasons";
  500: "internalServerError";
  501: "notImplemented";
  502: "badGateway";
  503: "serviceUnavailable";
  504: "gatewayTimeout";
  505: "httpVersionNotSupported";
  506: "variantAlsoNegotiates";
  507: "insufficientStorage";
  508: "loopDetected";
  510: "notExtended";
  511: "networkAuthenticationRequired";
  "5XX": "undefinedServerError";
  "default": "default";
}

/**
 * A valid {@link Response.status} value: a numeric code (`200`), its EQUIVALENT string form (`"200"` — Suluk treats
 * the two as the same status, never a drift; see `@suluk/cockpit`'s `diffContracts`), the `"5XX"` status-class
 * wildcard, or `"default"`. Derived from {@link HttpStatusCode} so the vocabulary is declared exactly once.
 */
export type HttpStatus = keyof HttpStatusCode | `${Extract<keyof HttpStatusCode, number>}`;

/**
 * A Request *is* an operation (SPEC §1.4). DOM handle = its name (the key in `PathItem.requests`);
 * ADA identity = its signature (C003/C019 Appendix A — computed, not authored).
 */
export interface Request {
  method: HttpMethod;
  summary?: string;
  description?: string;
  /** Optional legacy handle; not the v4 primary identity (C009). */
  operationId?: string;
  tags?: string[];
  deprecated?: boolean;
  externalDocs?: ExternalDocumentation;
  /** Request body media type(s) — plain IANA media type; params via the content model (§6/§7). */
  contentType?: string | string[];
  contentSchema?: SchemaOrRef;
  parameterSchema?: ParameterSchema;
  /** Named responses (§5); each carries its own status. At least one required. */
  responses: Record<string, Response>;
  callbacks?: Record<string, Callback>;
  /** Applied security, referenced BY NAME (C014 #69). */
  security?: SecurityRequirement[];
  servers?: Server[];
  /**
   * PROVENANCE facet (council whuovh6gs, L2): where in the AUTHORED source this operation was projected FROM.
   * A stable SYMBOLIC pointer (file + exported symbol) — never a line number, never an authz/routing input
   * (advisory only; C022 inv.5). STAMPED by the projection pass, never hand-authored. Scrub from externally
   * published projections (it discloses internal layout) — see core's `scrubSource` / `sourceIndex`.
   */
  ["x-suluk-source"]?: SulukSource;
  /**
   * RATE-LIMIT facet (saastarter-parity Phase 0): the declared per-operation rate budget. ADVISORY VENDOR
   * EXTENSION (see {@link SulukRateLimit}) — @suluk/hono's middleware ENFORCES it on the wire; core only
   * carries the shape + derived reads (`rateLimitIndex`/`rateLimitCoverage`/`retryAfterSeconds`).
   */
  ["x-suluk-ratelimit"]?: SulukRateLimit;
  /**
   * DEDUPE facet (C110) — the declared per-operation idempotency/result-cache budget. ADVISORY VENDOR EXTENSION
   * (see {@link SulukDedupe}), the same declared-vs-enforced split as `x-suluk-ratelimit`: @suluk/hono's
   * `enforceDedupe` middleware ENFORCES it (an atomic reserve/complete against a swappable `DedupeStore`,
   * mirroring `RateLimitStore`'s shape exactly) — core only carries the shape.
   */
  ["x-suluk-dedupe"]?: SulukDedupe;
  /**
   * HUMAN-IN-THE-LOOP APPROVAL facet (Stage 1.4): declares that invoking this operation as an AGENT TOOL requires
   * human approval before it runs — a consequential/irreversible action an autonomous loop must pause on. Advisory,
   * like {@link SulukApproval} describes.
   */
  ["x-suluk-approval"]?: SulukApproval;
  /**
   * REACTIVE-STORE facet (C037) — `x-suluk-store`. Declares this operation's role in the `@suluk/sdk` reactive client:
   * a QUERY (`key` present) projects to a `$<key>` store; a MUTATION (`invalidates` present) invalidates those stores
   * on success. CLIENT-CODEGEN ONLY — a pure hint for the generated frontend layer; NEVER read by the matcher/runtime
   * (D1; see {@link SulukStore}, plan/facts/0reactive.bn + test/store-d1-invariance.test.ts). Target-agnostic: the
   * default adapter projects to nanostores + @nanostores/query, but the declaration is a dependency graph any reactive
   * runtime (TanStack Query / SWR / Pinia Colada) can consume — the C034 runtime-adapter-seam move, one layer up.
   */
  ["x-suluk-store"]?: SulukStore;
  /**
   * RUN-PIPELINE facet (C104) — `x-suluk-run`. This operation's composed pipeline, as data: every named node
   * (internal/external/generic/package op, or a not-yet-written stub) + the dependency edges between them. PRODUCED
   * by `@suluk/effect`'s `sulukFmt`/`sulukFmt.all` as they compose (never hand-authored, never drifts from the real
   * pipeline); drives `@suluk/journeys`'s graph-shaped BDD generation + stub codegen. Absent when no node in the
   * pipeline declares a label — the default, zero impact on an existing route. NEVER read by the matcher (D1).
   */
  ["x-suluk-run"]?: SulukRunGraph;
}

/**
 * HUMAN-IN-THE-LOOP APPROVAL facet (Stage 1.4). Like x-suluk-cost/access/ratelimit it is an ADVISORY vendor extension
 * in the `x-suluk-*` namespace — the facet DECLARES the gate; a runtime adapter ENFORCES it (e.g. @suluk/agents'
 * `projectCloudflareAgent` emits the Cloudflare Agents SDK `needsApproval` predicate from it). STATIC by construction:
 * `required` is a fixed boolean — the facet NEVER carries a request-value selector (the D1 red-line), so a server can
 * never be pressured into a dynamic dispatch decision; the gate is "this action, always", decided at author time.
 */
export interface SulukApproval {
  /** require human approval before this operation runs as an agent tool. */
  required: boolean;
  /** why approval is needed — shown to the human approver and in docs. */
  reason?: string;
}

/**
 * RATE-LIMIT facet shape (saastarter-parity Phase 0): the per-operation rate budget an operation DECLARES.
 * Orthogonal to the NORMATIVE spec, which holds rate-limiting out-of-scope (C012 / frontier #43, ceiling 0.74):
 * like `x-suluk-cost`/`access`/`source` this is a vendor extension in the `x-suluk-*` namespace, never a
 * normative OAS construct. Advisory only — the facet declares the budget; the middleware enforces it.
 *
 * `windowMs` + `maxRequests` are the fixed-window budget, ported from saastarter's `checkRateLimit` opts
 * (src/lib/effect/rate-limit.ts:16-19). `key` is the declared key STRATEGY the runtime resolves a concrete
 * key from: only `"ip"` is saastarter-faithful (it keys by a resolved IP); `"principal"`/`"api-key"`/`"global"`
 * are ORIGINATED extensions (honestly-low ceiling — `"principal"` keying is gated on the Principal-model
 * decision, roadmap Open-Decision #5, so the Phase-0 middleware implements only `"ip"` + a caller-supplied override).
 */
export interface SulukRateLimit {
  /** fixed window length, milliseconds. */
  windowMs: number;
  /** max requests permitted per resolved key within the window. */
  maxRequests: number;
  /** the key STRATEGY (the runtime derives the concrete key). `"ip"` is the faithful default. */
  key: "ip" | "principal" | "api-key" | "global";
  /** optional sub-bucket name — lets two operations share or separate a budget (advisory). */
  scope?: string;
  description?: string;
}

/**
 * DEDUPE facet shape (C110) — the per-operation idempotency/result-cache budget an operation DECLARES. Mirrors
 * {@link SulukRateLimit}'s shape exactly (same file, same split): advisory only — the facet declares the budget;
 * `@suluk/hono`'s `enforceDedupe` middleware enforces it against a swappable `DedupeStore` (the `RateLimitStore`
 * precedent, C108's own recommended path). `keySource` is always a REQUEST-level source the caller sent (a header
 * or body field NAME, never a VALUE and never a node-output binding) — the same D1-safe boundary
 * `SulukRunNode.idempotencyKeySource` already draws (C108): nothing here can be pressured into resolving a
 * dynamic request value as an instruction, only naming a stable slot to read one from.
 */
export interface SulukDedupe {
  /** how long a completed result is replayed for a repeated key, milliseconds. */
  ttlMs: number;
  /** WHERE the idempotency key comes from — a header name or a body field name (never a node-output binding). */
  keySource: { header: string } | { bodyField: string };
  /** optional sub-bucket name — lets two operations share or separate a dedupe scope (advisory, mirrors `SulukRateLimit.scope`). */
  scope?: string;
  description?: string;
}

/** A stable, symbolic pointer back to the authored source an element was projected from (advisory provenance). */
export interface SulukSource {
  /** repo-relative path to the authoring file (e.g. "src/server/schema.ts"). NOT a line number. */
  file: string;
  /** the exported symbol within that file (e.g. a Drizzle table export, or the operation's name). */
  symbol: string;
  /** what kind of authored thing it is — "drizzle-table" | "operation" | "better-auth" | … (advisory label). */
  kind?: string;
}

/** Per-location typed parameter slots (C004 #20). Each slot is a JSON Schema 2020-12 over its instance. */
export interface ParameterSchema {
  query?: SchemaOrRef;
  path?: SchemaOrRef;
  header?: SchemaOrRef;
  cookie?: SchemaOrRef;
  body?: SchemaOrRef;
}

/** Named in its containing map. Precedence: request > pathResponses > apiResponses (C012 #17b). */
export interface Response {
  /** HTTP status ("200"/200), a wildcard ("5XX"), or "default". */
  status: HttpStatus;
  contentType?: string | string[];
  contentSchema?: SchemaOrRef;
  description?: string;
  /** Response headers, keyed by header name (OAS parity; advisory over Suluk's flat contentType/contentSchema model). */
  headers?: Record<string, Header | Reference>;
  /** Operation links, keyed by name (OAS parity). */
  links?: Record<string, Link | Reference>;
}

/** A response Header (OAS parity) — like a parameter minus name/in; its value is typed by `schema`. */
export interface Header {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: SchemaOrRef;
  [ext: `x-${string}`]: unknown;
}

/** A design-time Link to another operation (OAS parity; {@link Response.links} / {@link Components.links}). */
export interface Link {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, unknown>;
  requestBody?: unknown;
  description?: string;
  server?: Server;
}

/** A named Example object (OAS parity; {@link Components.examples}). `value` and `externalValue` are mutually exclusive. */
export interface Example {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}

/**
 * A runtime-expression-keyed map of pathItem-shaped definitions (§14, C018).
 * The enclosing `Request.callbacks` is name-keyed, so `callbacks[name][expression]` is a {@link PathItem}.
 */
export type Callback = Record<string, PathItem>;

/** Reusable definitions; the referencing anchor (C013). Keyed by name (C009). */
export interface Components {
  schemas?: Record<string, Schema>;
  requests?: Record<string, Request>;
  responses?: Record<string, Response>;
  securitySchemes?: Record<string, SecurityScheme>;
  links?: Record<string, Link | Reference>;
  examples?: Record<string, Example | Reference>;
  headers?: Record<string, Header | Reference>;
  callbacks?: Record<string, Callback | Reference>;
  pathItems?: Record<string, PathItem>;
}

/** Map of securityScheme name → array of scope strings (referenced BY NAME, C014 #69). */
export type SecurityRequirement = Record<string, string[]>;

/**
 * The permissive Security Scheme carried by the document interfaces ({@link Components.securitySchemes}). Kept LOOSE
 * (every non-`type` field optional) so existing derivers — `@suluk/better-auth` projects these — never break. For the
 * exhaustive "what is possible" model, author/read against the discriminated {@link SecuritySchemeObject} (C099).
 */
export interface SecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect" | "mutualTLS";
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  /** a hint at how a `type:"http"` bearer token is formatted (e.g. "JWT"). */
  bearerFormat?: string;
  flows?: OAuthFlows | Record<string, unknown>;
  openIdConnectUrl?: string;
  description?: string;
}

/**
 * The PRECISE, discriminated Security Scheme model (C099) — the exhaustive companion to the permissive
 * {@link SecurityScheme}. Narrow by `type` to read a variant's required fields. Additive: the document interfaces
 * still carry {@link SecurityScheme} for backward compatibility; tightening them to this union is a future,
 * verify-gated Step.
 */
export type SecuritySchemeObject =
  | ApiKeySecurityScheme
  | HttpSecurityScheme
  | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme
  | MutualTLSSecurityScheme;

/** An `apiKey` scheme — a key carried in a named header, query param, or cookie. */
export interface ApiKeySecurityScheme {
  type: "apiKey";
  /** REQUIRED name of the header/query/cookie carrying the key. */
  name: string;
  /** REQUIRED location of the key. */
  in: "query" | "header" | "cookie";
  description?: string;
}

/** An `http` scheme — an RFC 7235 Authorization scheme (e.g. `basic`, `bearer`). */
export interface HttpSecurityScheme {
  type: "http";
  /** REQUIRED HTTP auth scheme name (e.g. "basic", "bearer"). */
  scheme: string;
  /** a hint at how a bearer token is formatted (e.g. "JWT"). */
  bearerFormat?: string;
  description?: string;
}

/** An `oauth2` scheme — one or more OAuth2 flows. */
export interface OAuth2SecurityScheme {
  type: "oauth2";
  /** REQUIRED flow configurations. */
  flows: OAuthFlows;
  description?: string;
}

/** An `openIdConnect` scheme — an OIDC discovery URL. */
export interface OpenIdConnectSecurityScheme {
  type: "openIdConnect";
  /** REQUIRED well-known OIDC discovery URL. */
  openIdConnectUrl: string;
  description?: string;
}

/** A `mutualTLS` scheme — mutual-TLS client certificate authentication. */
export interface MutualTLSSecurityScheme {
  type: "mutualTLS";
  description?: string;
}

/** The four OAuth2 flow configurations ({@link OAuth2SecurityScheme.flows}). */
export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}

/** One OAuth2 flow — which URLs apply depends on the flow (authorizationUrl for implicit/authorizationCode, tokenUrl for the token-issuing flows). */
export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  /** REQUIRED scope name → description map (MAY be empty). */
  scopes: Record<string, string>;
}

/**
 * An OpenAPI Reference Object (C013 #49). `$ref` is a JSON-Pointer "#/components/<type>/<name>"
 * resolved BY NAME (C009; the resolve algorithm is C019 Appendix A).
 */
export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * JSON Schema 2020-12 — the Schema Object model (C099).
 *
 * The inner Schema Object was opaque (`Record<string, unknown> | boolean`) through C013–C098. C099 renders the
 * 2020-12 dialect as a PRECISE, TypeBox/JSON-Schema-aligned type model — the descriptive source-of-truth for what
 * an input/output schema can be — WITHOUT changing what validates (the dialect stays the runtime authority) and
 * WITHOUT a runtime dependency. {@link OpaqueSchema} keeps {@link Schema} a strict superset of the old type.
 * ──────────────────────────────────────────────────────────────────────────── */

/** The seven JSON Schema 2020-12 primitive type names (the `type` keyword vocabulary). */
export type JsonSchemaType = "null" | "boolean" | "object" | "array" | "number" | "string" | "integer";

/** Common `format` tokens (2020-12 + OpenAPI). `format` stays open to any string (annotation, not a constraint). */
export type StringFormat =
  | "date-time" | "date" | "time" | "duration"
  | "email" | "idn-email" | "hostname" | "idn-hostname"
  | "ipv4" | "ipv6" | "uri" | "uri-reference" | "iri" | "iri-reference" | "uuid" | "uri-template"
  | "json-pointer" | "relative-json-pointer" | "regex"
  | "int32" | "int64" | "float" | "double" | "byte" | "binary" | "password";

/**
 * Keywords valid on ANY Schema Object regardless of `type` — 2020-12 core (`$id`/`$ref`/`$defs`/…), annotations
 * (`title`/`description`/`default`/`deprecated`/`readOnly`/`writeOnly`/`examples`), enumeration (`enum`/`const`),
 * applicators (`allOf`/`anyOf`/`oneOf`/`not`/`if`/`then`/`else`/`dependentSchemas`), and the OpenAPI schema flavor
 * (`discriminator`/`xml`/`externalDocs`/`example`). A `$ref` HERE is the JSON-Schema ref keyword (C019 slot rule) —
 * distinct from an OpenAPI {@link Reference}. `x-*` members (incl. the `x-suluk-*` facets) are carried, dialect-ignored.
 */
export interface SchemaBase {
  $schema?: string;
  $id?: string;
  $anchor?: string;
  /** the JSON-Schema `$ref` keyword (in Schema-Object position) — NOT an OpenAPI {@link Reference} (C019 slot rule). */
  $ref?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  $vocabulary?: Record<string, boolean>;
  $defs?: Record<string, SchemaOrRef>;
  $comment?: string;
  title?: string;
  description?: string;
  default?: unknown;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  /** 2020-12 `examples` (array) — preferred over the singular OpenAPI `example`. */
  examples?: unknown[];
  /** OpenAPI singular example — deprecated by 2020-12 in favor of `examples`. */
  example?: unknown;
  enum?: unknown[];
  const?: unknown;
  allOf?: SchemaOrRef[];
  anyOf?: SchemaOrRef[];
  oneOf?: SchemaOrRef[];
  not?: SchemaOrRef;
  if?: SchemaOrRef;
  then?: SchemaOrRef;
  else?: SchemaOrRef;
  dependentSchemas?: Record<string, SchemaOrRef>;
  /** OpenAPI polymorphism helper — names the property whose value selects a concrete subschema. */
  discriminator?: Discriminator;
  /** OpenAPI XML serialization metadata for this schema/property. */
  xml?: XmlObject;
  externalDocs?: ExternalDocumentation;
  [ext: `x-${string}`]: unknown;
}

/** `type: "string"` validation keywords. */
export interface StringKeywords {
  format?: StringFormat | (string & {});
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  contentSchema?: SchemaOrRef;
}

/** `type: "number" | "integer"` validation keywords. */
export interface NumericKeywords {
  format?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

/** `type: "object"` validation keywords. `additionalProperties: false` seals the object. */
export interface ObjectKeywords {
  properties?: Record<string, SchemaOrRef>;
  required?: string[];
  additionalProperties?: SchemaOrRef | boolean;
  patternProperties?: Record<string, SchemaOrRef>;
  propertyNames?: SchemaOrRef;
  minProperties?: number;
  maxProperties?: number;
  dependentRequired?: Record<string, string[]>;
  unevaluatedProperties?: SchemaOrRef | boolean;
}

/** `type: "array"` validation keywords. `prefixItems` types a positional tuple; `items` types the tail. */
export interface ArrayKeywords {
  items?: SchemaOrRef;
  prefixItems?: SchemaOrRef[];
  contains?: SchemaOrRef;
  minContains?: number;
  maxContains?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  unevaluatedItems?: SchemaOrRef | boolean;
}

/**
 * Every 2020-12 constraint keyword (string / number / object / array), all optional. Per the dialect a keyword that
 * does not apply to an instance's `type` is IGNORED, not forbidden — `{ type: "string", minItems: 3 }` is a valid
 * schema (minItems inert). So the model carries all constraints on every variant and lets `type` discriminate the
 * instance type. This also keeps a generic reader (which pulls `properties`/`required`/`items` off an unnarrowed
 * schema — e.g. `@suluk/compat`'s downgrade) working WITHOUT a per-`type` narrow.
 */
export type SchemaConstraints = Partial<StringKeywords & NumericKeywords & ObjectKeywords & ArrayKeywords>;

/** A `type: "string"` Schema Object — narrow by `type`; the string keywords are the meaningful ones. */
export type StringSchema = SchemaBase & SchemaConstraints & { type: "string" };
/** A `type: "number" | "integer"` Schema Object. */
export type NumberSchema = SchemaBase & SchemaConstraints & { type: "number" | "integer" };
/** A `type: "object"` Schema Object. */
export type ObjectSchema = SchemaBase & SchemaConstraints & { type: "object" };
/** A `type: "array"` Schema Object. */
export type ArraySchema = SchemaBase & SchemaConstraints & { type: "array" };
/** A `type: "boolean"` Schema Object. */
export type BooleanSchema = SchemaBase & SchemaConstraints & { type: "boolean" };
/** A `type: "null"` Schema Object. */
export type NullSchema = SchemaBase & SchemaConstraints & { type: "null" };
/** A multi-`type` Schema Object (`type` is an array of names). */
export type MultiTypeSchema = SchemaBase & SchemaConstraints & { type: JsonSchemaType[] };
/** A Schema Object with NO `type` — a pure composition / `enum` / `const` / `$ref` schema. */
export type UntypedSchema = SchemaBase & SchemaConstraints & { type?: undefined };
/**
 * The 2020-12 opaque ESCAPE HATCH — preserves the pre-C099 openness (`Record<string, unknown>`) so any object a
 * validator accepts, or a generator emits (e.g. `@suluk/zod`'s `zodToV4().schema`), stays a valid Schema Object.
 * The precise variants above are strictly ADDITIVE narrowings; this member keeps the union a superset of the old type
 * and (via its index signature) suppresses excess-property false-positives on hand-built schema literals.
 */
export type OpaqueSchema = Record<string, unknown>;

/**
 * A JSON Schema 2020-12 Schema Object — the discriminated union over `type`, plus composition-only
 * ({@link UntypedSchema}) and the {@link OpaqueSchema} fallback. Narrow by `type` to read a specific variant.
 */
export type SchemaObject =
  | StringSchema | NumberSchema | ObjectSchema | ArraySchema
  | BooleanSchema | NullSchema | MultiTypeSchema | UntypedSchema | OpaqueSchema;

/** A JSON Schema 2020-12 value: a Schema Object, or a boolean schema (`true` = accept all, `false` = reject all). */
export type Schema = SchemaObject | boolean;

/** A polymorphism discriminator (OpenAPI Schema flavor) — the property whose value selects the subschema. */
export interface Discriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

/** XML serialization metadata for a schema or property (OpenAPI Schema flavor). */
export interface XmlObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

/** Either an inline Schema Object (incl. a boolean schema) or an OpenAPI Reference Object. */
export type SchemaOrRef = Schema | Reference;

/**
 * The PROPERTY-LEVEL facet locus (saastarter-parity Phase 0). core's `x-suluk-*` facets are operation-level
 * today (on {@link Request}); a Schema Object's `properties[name]` is the locus for a property-level facet — e.g.
 * `@suluk/drizzle` attaching `x-suluk-i18n` to a localized column. An advisory typed VIEW: a subschema carrying an
 * `x-suluk-*` member is still a valid 2020-12 subschema (the dialect ignores `x-*` keywords).
 */
export interface SchemaProperty {
  /** a property subschema may carry any vendor `x-suluk-*` facet (advisory; ignored by the 2020-12 validator). */
  [facet: `x-suluk-${string}`]: unknown;
}

/** A map of property name → its (optionally facet-bearing) subschema — the property-level facet locus. */
export type PropertyFacets = Record<string, SchemaProperty>;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * COMPILE-TIME inference from a Schema Object to the TypeScript type of its valid instances — TypeBox's `Static<>`,
 * without the dependency. Correct for the common, decidable constructs: boolean schemas, `const`, `enum`, the six
 * primitive `type`s, arrays (`items`), objects (`properties` + `required`), and `allOf`/`anyOf`/`oneOf`. Precise
 * object required-vs-optional inference needs `required` authored `as const`; a widened `string[]` `required` treats
 * every listed property as required. Unmodeled constructs ($ref resolution, conditional applicators, pattern/
 * unevaluated keywords) resolve to `unknown` — honestly under-narrowed, never falsely narrowed. Intended for a NARROW
 * authored schema literal, not the wide {@link Schema} union (whose {@link OpaqueSchema} member yields `unknown`).
 */
export type Static<S> =
  S extends boolean ? unknown :
  S extends { const: infer C } ? C :
  S extends { enum: readonly (infer E)[] } ? E :
  S extends { allOf: readonly (infer A)[] } ? UnionToIntersection<Static<A>> :
  S extends { anyOf: readonly (infer A)[] } ? Static<A> :
  S extends { oneOf: readonly (infer A)[] } ? Static<A> :
  S extends { type: "string" } ? string :
  S extends { type: "integer" | "number" } ? number :
  S extends { type: "boolean" } ? boolean :
  S extends { type: "null" } ? null :
  S extends { type: "array" } ? StaticArray<S> :
  S extends { type: "object" } ? StaticObject<S> :
  unknown;

type StaticArray<S> = S extends { items: infer I } ? Static<I>[] : unknown[];

type StaticObject<S> =
  S extends { properties: infer P }
    ? S extends { required: readonly (infer R extends string)[] }
      ? StaticRequired<P, R> & StaticOptional<P, R>
      : { [K in keyof P]?: Static<P[K]> }
    : Record<string, unknown>;

type StaticRequired<P, R extends string> = { [K in keyof P as K extends R ? K : never]: Static<P[K]> };
type StaticOptional<P, R extends string> = { [K in keyof P as K extends R ? never : K]?: Static<P[K]> };

/**
 * Discriminate an OpenAPI Reference Object from an inline Schema.
 * NOTE: a JSON Schema may *also* contain a `$ref` keyword; per C019 Appendix A the slot+token rule
 * decides the kind — a `$ref` lexically inside a Schema Object is the JSON-Schema kind, not a Reference.
 * This guard is the structural check; callers in Schema-Object position MUST apply the slot rule.
 */
export function isReference(x: SchemaOrRef | undefined): x is Reference {
  return typeof x === "object" && x !== null && "$ref" in x && typeof (x as Reference).$ref === "string";
}

/* ────────────────────────────────────────────────────────────────────────────
 * EVENT ARCHITECTURE — CloudEvents 1.0.2 + AsyncAPI 3.x (C100).
 *
 * The async twin of the document model above: a precise, dependency-free model of **CloudEvents 1.0.2** (the event
 * ENVELOPE) + **AsyncAPI 3.x** (the event DOCUMENT), so the event surface is a typed source-of-truth the same way
 * the Schema Object section above is — reference the standard, do not depend on it. Lives in THIS file (not a
 * separate one) for the same reason the C099 Schema model does: `@suluk/core`'s index.ts flattens everything into
 * one namespace regardless of internal file layout, so splitting by concern into another file bought nothing and
 * only made it look like two documents to maintain. One file, one source of truth.
 *
 * NON-NORMATIVE (C018). The async surface is a PROJECTION of the v4 document's event triggers — `webhooks` (C018),
 * `x-suluk-jobs` (C025), and per-op `x-suluk-store.invalidates` (C037) — never part of the normative OpenAPI
 * contract above. These types are the emit TARGET that `@suluk/hono`'s `emitAsyncApi` derives INTO (the analog of
 * the Schema type being what `zodToV4` emits into).
 *
 * CloudEvents: {@link CloudEventV1} mirrors the `cloudevents` npm package's `CloudEventV1<T>` field-for-field (same
 * names → a runtime `cloudevents` event is structurally assignable), WITHOUT the dependency. {@link
 * cloudEventEnvelopeSchema} is its JSON-Schema face, built on the {@link ObjectSchema} defined above.
 * AsyncAPI: informed by `@scalar/types` `asyncapi/3.1`, reusing {@link Contact}/{@link License}/
 * {@link ExternalDocumentation}/{@link Schema} from the document model above.
 * ──────────────────────────────────────────────────────────────────────────── */

/** The `specversion` attribute value for CloudEvents 1.0.x. */
export type CloudEventSpecVersion = "1.0";
/** CloudEvents HTTP content modes — how the envelope maps onto an HTTP message (structured = whole envelope in the body). */
export type CloudEventContentMode = "binary" | "structured" | "batch";
/** Structured-mode media type for a single event. */
export const CLOUDEVENTS_JSON_CONTENT_TYPE = "application/cloudevents+json";
/** Structured-mode media type for a batch of events. */
export const CLOUDEVENTS_BATCH_JSON_CONTENT_TYPE = "application/cloudevents-batch+json";
/** Binary-mode header prefix — each context attribute rides as `ce-<attribute>` (e.g. `ce-type`, `ce-source`). */
export const CLOUDEVENTS_HEADER_PREFIX = "ce-";

/** The OPTIONAL CloudEvents 1.0 attributes + the payload slots + extension attributes (mirrors `CloudEventV1OptionalAttributes<T>`). */
export interface CloudEventV1OptionalAttributes<T = unknown> {
  /** RFC3339 timestamp of when the occurrence happened. */
  time?: string;
  /** the subject of the event within the context of the `source`. */
  subject?: string;
  /** content type of `data` (e.g. "application/json"). */
  datacontenttype?: string;
  /** a URI to the schema that `data` adheres to. */
  dataschema?: string;
  /** the event payload. */
  data?: T;
  /** the event payload, base64-encoded (binary data); mutually exclusive with `data`. */
  data_base64?: string;
  /** CloudEvents extension attributes (lowercase-alphanumeric names). */
  [key: string]: unknown;
}

/** The REQUIRED context attributes `source` + `type`, plus the optionals (mirrors `CloudEventV1Attributes<T>`). */
export interface CloudEventV1Attributes<T = unknown> extends CloudEventV1OptionalAttributes<T> {
  /** REQUIRED. a URI-reference identifying the context in which the event happened (the producer). */
  source: string;
  /** REQUIRED. the event type — reverse-DNS recommended (e.g. "dev.suluk.webhook.stripe"). */
  type: string;
}

/**
 * A CloudEvents 1.0 event ENVELOPE, generic over its `data` payload type `T` — mirrors the `cloudevents` npm package's
 * `CloudEventV1<T>` field-for-field (a runtime `cloudevents` event is structurally assignable here) with NO runtime
 * dependency. The "what an event instance looks like" type a handler / SDK consumer uses; {@link
 * cloudEventEnvelopeSchema} is its JSON-Schema face for an AsyncAPI message `payload`.
 */
export interface CloudEventV1<T = unknown> extends CloudEventV1Attributes<T> {
  /** REQUIRED. a unique id for this event occurrence. */
  id: string;
  /** REQUIRED. the CloudEvents spec version ("1.0"). */
  specversion: CloudEventSpecVersion | (string & {});
}

/** Structural guard — is `x` a CloudEvents 1.0 envelope (the four required context attributes present as strings)? */
export function isCloudEvent(x: unknown): x is CloudEventV1 {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Record<string, unknown>;
  return typeof e.id === "string" && typeof e.source === "string" &&
    typeof e.type === "string" && typeof e.specversion === "string";
}

/**
 * Build the CloudEvents 1.0 structured-JSON envelope as a typed {@link ObjectSchema} — the JSON Schema an AsyncAPI
 * message `payload` carries. `data` slots the event's own payload schema (open `{}` when absent); `additionalProperties`
 * stays true so CloudEvents extension attributes validate. This is the single, typed home of the envelope shape.
 */
export function cloudEventEnvelopeSchema(type: string, source: string, data?: SchemaOrRef): ObjectSchema {
  return {
    type: "object",
    title: "CloudEvent",
    required: ["specversion", "id", "source", "type"],
    properties: {
      specversion: { type: "string", const: "1.0", description: "The CloudEvents spec version." },
      id: { type: "string", description: "A unique id for this event occurrence." },
      source: { type: "string", format: "uri-reference", description: "The event producer.", examples: [source] },
      type: { type: "string", const: type, description: "The event type (reverse-DNS)." },
      time: { type: "string", format: "date-time", description: "When the event occurred." },
      datacontenttype: { type: "string", const: "application/json" },
      data: data ?? {},
    },
    additionalProperties: true, // CloudEvents extension attributes are allowed
  };
}

/** The AsyncAPI version tag (Suluk emits "3.0.0"; "3.1.0" accepted). */
export type AsyncApiVersion = "3.0.0" | "3.1.0" | (string & {});
/** An AsyncAPI operation action — `send` (the app publishes) or `receive` (the app consumes). */
export type AsyncApiAction = "send" | "receive";

/** AsyncAPI info block — reuses {@link Contact}/{@link License}/{@link ExternalDocumentation}. */
export interface AsyncApiInfo {
  title: string;
  version: string;
  summary?: string;
  description?: string;
  contact?: Contact;
  license?: License;
  externalDocs?: ExternalDocumentation;
  [ext: `x-${string}`]: unknown;
}

/** A correlation-id locator for a message (AsyncAPI). */
export interface AsyncApiCorrelationId {
  /** a runtime expression locating the correlation id (e.g. "$message.header#/correlationId"). */
  location: string;
  description?: string;
}

/** A named example for a message. */
export interface AsyncApiMessageExample {
  name?: string;
  summary?: string;
  headers?: Record<string, unknown>;
  payload?: unknown;
}

/** A by-name reference to a message (a bare `$ref`, as used in a channel's `messages` map). */
export interface AsyncApiMessageRef {
  $ref: string;
}

/**
 * An AsyncAPI Message. For a Suluk event, `payload` is a {@link cloudEventEnvelopeSchema} (a CloudEvents 1.0 envelope);
 * `payload`/`headers` reuse the typed {@link SchemaOrRef}. Field names/optionality follow AsyncAPI 3.x.
 */
export interface AsyncApiMessage {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  /** the wire content type (e.g. "application/cloudevents+json"). */
  contentType?: string;
  headers?: SchemaOrRef;
  /** the message payload schema — for Suluk events, the CloudEvents envelope. */
  payload?: SchemaOrRef;
  correlationId?: AsyncApiCorrelationId | Reference;
  externalDocs?: ExternalDocumentation;
  bindings?: Record<string, unknown>;
  examples?: AsyncApiMessageExample[];
  [ext: `x-${string}`]: unknown;
}

/** An AsyncAPI channel-address parameter. */
export interface AsyncApiParameter {
  enum?: string[];
  default?: string;
  description?: string;
  examples?: string[];
  /** a runtime expression for the parameter's location. */
  location?: string;
}

/** An AsyncAPI Channel — an addressable place events flow through. */
export interface AsyncApiChannel {
  /** the channel address (or null when unknown). */
  address?: string | null;
  title?: string;
  summary?: string;
  description?: string;
  messages?: Record<string, AsyncApiMessageRef | AsyncApiMessage | Reference>;
  parameters?: Record<string, AsyncApiParameter | Reference>;
  servers?: Reference[];
  externalDocs?: ExternalDocumentation;
  bindings?: Record<string, unknown>;
  [ext: `x-${string}`]: unknown;
}

/** An AsyncAPI Operation — the app `send`s to or `receive`s from a channel. */
export interface AsyncApiOperation {
  action: AsyncApiAction;
  channel: Reference | AsyncApiMessageRef;
  title?: string;
  summary?: string;
  description?: string;
  messages?: (AsyncApiMessageRef | Reference)[];
  externalDocs?: ExternalDocumentation;
  bindings?: Record<string, unknown>;
  [ext: `x-${string}`]: unknown;
}

/** Reusable AsyncAPI definitions. For Suluk's emit, `messages` holds every CloudEvent message. */
export interface AsyncApiComponents {
  messages: Record<string, AsyncApiMessage>;
  schemas?: Record<string, Schema>;
  channels?: Record<string, AsyncApiChannel>;
  operations?: Record<string, AsyncApiOperation>;
  parameters?: Record<string, AsyncApiParameter | Reference>;
  correlationIds?: Record<string, AsyncApiCorrelationId | Reference>;
  externalDocs?: ExternalDocumentation;
  [ext: `x-${string}`]: unknown;
}

/**
 * An AsyncAPI 3.x document — the event-driven companion to `OpenAPIv4Document`. Suluk EMITS one via `@suluk/hono`'s
 * `emitAsyncApi` (a NON-NORMATIVE projection of the v4 doc's `webhooks` / `x-suluk-jobs` / store invalidations —
 * C018/C025/C037), every message a CloudEvents 1.0 envelope. `channels`/`operations`/`components` are REQUIRED because a
 * Suluk-emitted doc always carries them (Scalar's parse-oriented model has them optional — this is an emitter type).
 */
export interface AsyncApiDocument {
  asyncapi: AsyncApiVersion;
  info: AsyncApiInfo;
  channels: Record<string, AsyncApiChannel>;
  operations: Record<string, AsyncApiOperation>;
  components: AsyncApiComponents;
  servers?: Record<string, unknown>;
  defaultContentType?: string;
  id?: string;
  [ext: `x-${string}`]: unknown;
}

/* ────────────────────────────────────────────────────────────────────────────
 * PROVISIONING — the Open Service Broker API v2 companion model (C101).
 *
 * A THIRD companion to the document model above (after C099's JSON Schema Object model and C100's CloudEvents +
 * AsyncAPI model): a precise, dependency-free model of the **Open Service Broker API v2** wire contract — grounded
 * in the OSB spec + the projected `openapiv3.json`/`openapiv4.json` (see `@suluk/provision`'s `spec.md`) — so
 * infrastructure provisioning gets the same typed source-of-truth treatment. Lives in THIS file for the same
 * one-file reason C100 does.
 *
 * UNLIKE CloudEvents/AsyncAPI (which project FROM triggers already declared IN the v4 document — `webhooks`,
 * `x-suluk-jobs`), OSB describes a genuinely different concern: what BACKING INFRASTRUCTURE an app needs (a D1
 * database, a KV namespace, a scoped token, …), which historically had NO representation in the v4 document at all
 * — `@suluk/provision`'s `InstanceSpec[]` (`provision.config.ts`) was authored as a fully independent, parallel
 * artifact. C101 closes that gap the same way C025 (`x-suluk-jobs`) did for background work: {@link
 * SulukProvisionInstance} + the document-level `x-suluk-provision` map (declared on {@link OpenAPIv4Document} above)
 * is the LIGHT annotation an author writes ONCE — broker id, ref, plan, params, bind mapping — with NO OSB wire
 * ceremony. `@suluk/provision`'s `deriveInstanceSpecs(doc)` PROJECTS that map into its own `InstanceSpec[]` (the
 * exact shape its mature plan/apply/bind engine already consumes, unchanged); a broker then goes on to speak the
 * full OSB wire contract below when it actually talks to a real Service Broker. So: Suluk's document stays the
 * single source of truth; the OSB surface gets whatever wire-level ceremony IT needs (dashboard clients, plan
 * schemas, maintenance info, …) at the PROJECTION layer, never polluting the domain model above.
 *
 * NON-NORMATIVE (mirrors C018's stance on the async surface): `x-suluk-provision` is a vendor extension, never read
 * by the DOM→ADA matcher, never part of the normative OpenAPI contract.
 *
 * Field NAMES below are the OSB WIRE names (snake_case), verbatim from the spec — each type maps 1:1 to a schema in
 * `@suluk/provision`'s projected `openapiv4.json`. `@deprecated` marks fields the spec retains only for backwards
 * compatibility. Three schema names are renamed to avoid shadowing a TypeScript/JS global or an existing core name:
 * OSB `Object` → {@link JsonObject}, OSB `Error` → {@link ServiceBrokerError}, and OSB `Catalog` → {@link
 * CatalogResponse} (this file's own {@link Components} already uses `Catalog`-adjacent vocabulary elsewhere).
 * `@suluk/provision` keeps its OWN reduced "seam" view (`Broker`/`InstanceSpec`/`ServiceOffering`/`ServicePlan`/…) —
 * the framework abstraction analogous to `emitAsyncApi`'s projection logic staying in `@suluk/hono` rather than core.
 * ──────────────────────────────────────────────────────────────────────────── */

/** OSB last-operation state for an ASYNC provision/deprovision (a database that takes seconds, a cert that takes minutes). */
export type OperationState = "in progress" | "succeeded" | "failed";

/** An arbitrary JSON object (OSB schema `Object`) — an untyped bag whose shape the service defines, e.g. a Service
 *  Instance's `parameters` or a binding's `credentials`. */
export type JsonObject = Record<string, unknown>;

/**
 * Platform-attached request context (OSB `Context`). An OPEN object identifying the Platform + the environment a
 * provision/update/bind originates from (e.g. `platform`, `organization_guid`, `space_guid`, `namespace`). Extensible
 * by profile — see the OSB Context Conventions — so it carries an index signature rather than a fixed shape.
 */
export interface Context {
  /** the Platform issuing the request, e.g. "cloudfoundry" / "kubernetes". */
  platform?: string;
  [key: string]: unknown;
}

/** Free-form service/plan metadata (OSB `Metadata`) — display hints (`displayName`, `imageUrl`, `documentationUrl`,
 *  costs, …). An OPEN object; the spec fixes no keys. */
export interface Metadata {
  [key: string]: unknown;
}

/** Maintenance information for a Service Plan (OSB `Maintenance Info`). `version` is a semver the Platform matches when
 *  provisioning/updating; a mismatch on update is the `MaintenanceInfoConflict` error. */
export interface MaintenanceInfo {
  /** REQUIRED semver of the maintenance state this plan is at. */
  version: string;
  description?: string;
}

/** A Platform's OAuth2 client for a service dashboard (OSB `DashboardClient`) — the credentials a broker declares so its
 *  dashboard can call back into the Platform. */
export interface DashboardClient {
  /** the id of the OAuth client the dashboard uses to authenticate against the UAA/Platform. */
  id?: string;
  /** the client secret. */
  secret?: string;
  /** a URI for the service dashboard to receive the OAuth redirect. */
  redirect_uri?: string;
}

/** JSON-Schemas the broker declares for the parameters it accepts (OSB `Schemas`), used by a Platform to validate/prompt
 *  before it calls provision/update/bind. */
export interface Schemas {
  service_instance?: ServiceInstanceSchema;
  service_binding?: ServiceBindingSchema;
}
/** The parameter JSON-Schemas for creating/updating a Service Instance ({@link Schemas.service_instance}). */
export interface ServiceInstanceSchema {
  create?: { parameters?: JsonObject };
  update?: { parameters?: JsonObject };
}
/** The parameter JSON-Schema for creating a Service Binding ({@link Schemas.service_binding}). */
export interface ServiceBindingSchema {
  create?: { parameters?: JsonObject };
}

/** The permissions a service may require of the Platform ({@link Service.requires}). The only values the spec defines. */
export type ServiceRequires = "syslog_drain" | "route_forwarding" | "volume_mount";

/**
 * A Service Plan within an offering (OSB `Plan`) — the complete wire object. `@suluk/provision`'s `ServicePlan` is the
 * framework's reduced view (id/name/description/free); this carries the full catalog surface a real broker advertises.
 */
export interface Plan {
  /** REQUIRED broker-assigned plan id, unique within the Platform's catalog. */
  id: string;
  /** REQUIRED CLI-friendly plan name, unique within the offering. */
  name: string;
  /** REQUIRED user-facing plan description. */
  description: string;
  metadata?: Metadata;
  maintenance_info?: MaintenanceInfo;
  /** whether the plan is free of charge (default `true`). */
  free?: boolean;
  /** whether instances of this plan are bindable — OVERRIDES the offering's {@link Service.bindable} default. */
  bindable?: boolean;
  /** parameter JSON-Schemas for this plan's instances/bindings. */
  schemas?: Schemas;
  /** the maximum duration (seconds) a Platform SHOULD poll an async operation on this plan before giving up. */
  maximum_polling_duration?: number;
  /** whether an instance may be updated TO/FROM this plan. */
  plan_updateable?: boolean;
  /** whether bindings of this plan can be rotated (default `false`). */
  binding_rotatable?: boolean;
}

/**
 * A Service Offering (OSB `Service`) — the complete wire object a broker advertises in its catalog. `@suluk/provision`'s
 * `ServiceOffering` is the framework's reduced view; this is the full surface (tags, requires, dashboard client,
 * metadata, the plan list, …).
 */
export interface Service {
  /** REQUIRED CLI-friendly service name, unique within the broker. */
  name: string;
  /** REQUIRED broker-assigned service id, unique within the Platform's catalog. */
  id: string;
  /** REQUIRED user-facing service description. */
  description: string;
  /** searchable tags for the offering. */
  tags?: string[];
  /** permissions the user grants by provisioning (see {@link ServiceRequires}). */
  requires?: ServiceRequires[];
  /** REQUIRED default bindability for the offering's plans (a {@link Plan} MAY override via {@link Plan.bindable}). */
  bindable: boolean;
  metadata?: Metadata;
  dashboard_client?: DashboardClient;
  /** whether bindings of this offering can be rotated. */
  binding_rotatable?: boolean;
  /** whether instances of this offering can be updated to a different plan. */
  plan_updateable?: boolean;
  /** REQUIRED — the offering's plans (at least one). */
  plans: Plan[];
}

/** The catalog response body (OSB `Catalog`, `GET /v2/catalog`) — the wire form. `@suluk/provision`'s `Catalog` is the
 *  framework's reduced view (over `ServiceOffering`); this is the full wire shape over {@link Service}. */
export interface CatalogResponse {
  services?: Service[];
}

/** Platform-namespaced metadata echoed on a Service Instance (OSB `ServiceInstanceMetadata`). */
export interface ServiceInstanceMetadata {
  /** Platform labels attached to the instance. */
  labels?: JsonObject;
  /** additional Platform attributes. */
  attributes?: JsonObject;
}

/** Request body to provision a Service Instance (OSB `ServiceInstanceProvisionRequestBody`,
 *  `PUT /v2/service_instances/{instance_id}`). */
export interface ServiceInstanceProvisionRequestBody {
  /** REQUIRED id of the service to provision. */
  service_id: string;
  /** REQUIRED id of the plan to provision. */
  plan_id: string;
  context?: Context;
  /** REQUIRED historically; superseded by {@link Context}. @deprecated use `context`. */
  organization_guid: string;
  /** REQUIRED historically; superseded by {@link Context}. @deprecated use `context`. */
  space_guid: string;
  /** service-specific provisioning configuration. */
  parameters?: JsonObject;
}

/** Response body of a SYNCHRONOUS provision (OSB `ServiceInstanceProvisionResponse`). */
export interface ServiceInstanceProvisionResponse {
  /** URL of a web-based management UI for the instance. */
  dashboard_url?: string;
  metadata?: ServiceInstanceMetadata;
}

/** Response body of an ASYNCHRONOUS provision/update — the `operation` handle the Platform polls (OSB
 *  `ServiceInstanceAsyncOperation`). */
export interface ServiceInstanceAsyncOperation {
  dashboard_url?: string;
  /** opaque handle identifying the in-flight operation, echoed to `last_operation`. */
  operation?: string;
  metadata?: ServiceInstanceMetadata;
}

/** Request body to update a Service Instance (OSB `ServiceInstanceUpdateRequestBody`,
 *  `PATCH /v2/service_instances/{instance_id}`). */
export interface ServiceInstanceUpdateRequestBody {
  context?: Context;
  /** REQUIRED id of the service the instance belongs to. */
  service_id: string;
  /** the plan to move the instance to (omitted → unchanged). */
  plan_id?: string;
  parameters?: JsonObject;
  previous_values?: ServiceInstancePreviousValues;
}

/** The instance's prior values, sent on update so a broker can reason about the transition (OSB
 *  `ServiceInstancePreviousValues`). */
export interface ServiceInstancePreviousValues {
  /** @deprecated the spec retains this only for backwards compatibility. */
  service_id?: string;
  /** the plan id prior to the update. */
  plan_id?: string;
  /** @deprecated the spec retains this only for backwards compatibility. */
  organization_id?: string;
  /** @deprecated the spec retains this only for backwards compatibility. */
  space_id?: string;
}

/** The fetched state of a Service Instance (OSB `ServiceInstanceResource`, `GET /v2/service_instances/{instance_id}`). */
export interface ServiceInstanceResource {
  service_id?: string;
  plan_id?: string;
  dashboard_url?: string;
  /** the parameters the instance was provisioned with. */
  parameters?: JsonObject;
  maintenance_info?: MaintenanceInfo;
  metadata?: ServiceInstanceMetadata;
}

/** A bare async-operation acknowledgement carrying only the poll handle (OSB `AsyncOperation`). */
export interface AsyncOperation {
  operation?: string;
}

/**
 * The polled state of an async operation (OSB `LastOperationResource`, `GET …/last_operation`). While
 * `state: "in progress"` the Platform keeps polling; `succeeded`/`failed` stops it. `instance_usable` /
 * `update_repeatable` are meaningful ONLY for a failed update or deprovision (both default `true`). Reuses
 * {@link OperationState} — one enum for the whole package.
 */
export interface LastOperationResource {
  /** REQUIRED — see {@link OperationState}. */
  state: OperationState;
  /** user-facing status detail; if present MUST be non-empty. */
  description?: string;
  /** on a FAILED update/deprovision: is the instance still usable? MUST be absent for other operations. */
  instance_usable?: boolean;
  /** on a FAILED update: can the same update be retried? MUST be absent for other operations. */
  update_repeatable?: boolean;
}

/** The `bind_resource` object — what the binding is FOR (OSB `ServiceBindingResouceObject`; the schema name carries the
 *  spec's historical spelling). Referenced by {@link ServiceBindingRequest.bind_resource}. */
export interface ServiceBindingResouceObject {
  /** the app the binding is created for. */
  app_guid?: string;
  /** the route (URL) a route-services binding is created for. */
  route?: string;
}

/** Request body to create a Service Binding (OSB `ServiceBindingRequest`,
 *  `PUT …/service_bindings/{binding_id}`). */
export interface ServiceBindingRequest {
  context?: Context;
  /** REQUIRED id of the service the instance belongs to. */
  service_id: string;
  /** REQUIRED id of the plan the instance was provisioned with. */
  plan_id: string;
  /** @deprecated superseded by {@link ServiceBindingResouceObject.app_guid} in `bind_resource`. */
  app_guid?: string;
  bind_resource?: ServiceBindingResouceObject;
  parameters?: JsonObject;
  /** for binding rotation: the id of the binding this one supersedes. */
  predecessor_binding_id?: string;
}

/** Validity window echoed on a binding (OSB `ServiceBindingMetadata`). */
export interface ServiceBindingMetadata {
  /** RFC3339 timestamp after which the credentials expire. */
  expires_at?: string;
  /** RFC3339 timestamp after which the binding SHOULD be rotated. */
  renew_before?: string;
}

/** A network endpoint exposed by a binding (OSB `ServiceBindingEndpoint`) — used to program egress access. */
export interface ServiceBindingEndpoint {
  /** REQUIRED host (or CIDR/domain) reachable for this endpoint. */
  host: string;
  /** REQUIRED ports (or port ranges) at `host`. */
  ports: string[];
  /** transport protocol (default `tcp`). */
  protocol?: "tcp" | "udp" | "all";
}

/** A device backing a volume mount ({@link ServiceBindingVolumeMount.device}, OSB `ServiceBindingVolumeMountDevice`). */
export interface ServiceBindingVolumeMountDevice {
  /** REQUIRED id of the volume to mount. */
  volume_id: string;
  /** config passed to the volume driver's mount call. */
  mount_config?: JsonObject;
  /** device-driver-specific config. */
  device_config?: JsonObject;
}

/** A volume the Platform must mount into the app for this binding (OSB `ServiceBindingVolumeMount`). */
export interface ServiceBindingVolumeMount {
  /** REQUIRED name of the volume driver plugin. */
  driver: string;
  /** REQUIRED path in the app container the volume mounts onto. */
  container_dir: string;
  /** REQUIRED mount mode — read-only or read-write. */
  mode: "r" | "rw";
  /** REQUIRED device type — only `shared` is currently defined. */
  device_type: "shared";
  /** REQUIRED — the device to mount. */
  device: ServiceBindingVolumeMountDevice;
}

/** Response body of a SYNCHRONOUS binding create (OSB `ServiceBindingResponse`). */
export interface ServiceBindingResponse {
  metadata?: ServiceBindingMetadata;
  /** the credentials the app uses to reach the service. */
  credentials?: JsonObject;
  /** URL to which the Platform streams app logs (a `syslog_drain` binding). */
  syslog_drain_url?: string;
  /** URL the Platform routes traffic through (a `route_forwarding` binding). */
  route_service_url?: string;
  volume_mounts?: ServiceBindingVolumeMount[];
  endpoints?: ServiceBindingEndpoint[];
}

/** The fetched state of a Service Binding (OSB `ServiceBindingResource`, `GET …/service_bindings/{binding_id}`) — the
 *  binding response plus the `parameters` it was created with. */
export interface ServiceBindingResource {
  metadata?: ServiceBindingMetadata;
  credentials?: JsonObject;
  syslog_drain_url?: string;
  route_service_url?: string;
  volume_mounts?: ServiceBindingVolumeMount[];
  endpoints?: ServiceBindingEndpoint[];
  parameters?: JsonObject;
}

/**
 * A Service Broker error body (OSB `Error`, returned with a 4xx/5xx). `error` is an optional machine code (e.g.
 * `AsyncRequired`, `ConcurrencyError`, `MaintenanceInfoConflict`); `instance_usable` / `update_repeatable` are
 * meaningful only for a failed update or deprovision. Named to avoid shadowing the global `Error`.
 */
export interface ServiceBrokerError {
  /** a single machine-readable error code (MUST match a defined OSB error code when present). */
  error?: string;
  /** user-facing message; if present MUST be non-empty. */
  description?: string;
  /** on a FAILED update/deprovision: is the instance still usable? MUST be absent for other operations. */
  instance_usable?: boolean;
  /** on a FAILED update: can the same update be retried? MUST be absent for other operations. */
  update_repeatable?: boolean;
}