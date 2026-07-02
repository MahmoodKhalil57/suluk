# Types & Enums

## dsl

### `Tier`
The composition DSL — the contract model.

Ported from ~/apps/multivendorbuilder's DSL and rebuilt on the Suluk discipline. The tier rule
(components → blocks → sections → pages) is secondary; the LOAD-BEARING idea is the contract:

  A document's `params` is EXACTLY and ONLY what the tier above may set.

Each tier consumes the full contract of the tier below, hardcodes most of it with literals, and
re-publishes a deliberately narrower `params` upward. "The owner can't change the form's fields" is not
a special rule — `fields` simply isn't in the section's `params`, so the validator rejects it like any
unknown key. The narrowing IS the contract surface. This is the SAME discipline as Suluk's per-viewer doc
projection (an operation you can't see isn't a rule — its scope just isn't in your principal), applied to
composition rather than visibility.

Bindings inside a document's `root` / `catalog`:
  { $bind: "paramName" }  → forward this document's resolved param value (object form so a literal stays literal)
  { $each: "listParam" }  → expand to the catalog entries the consumer selected (honouring the list controls)
  { $slot: true }         → where consumer-passed children render
```ts
"components" | "blocks" | "sections" | "pages"
```

### `ListControl`
`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.
```ts
"include" | "hide" | "reorder" | "repeat"
```

### `ParamSpec`
`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.
```ts
{ type: "enum"; options: string[]; default?: string; required?: boolean } | { type: "text"; default?: string; required?: boolean } | { type: "number"; default?: number; required?: boolean } | { type: "boolean"; default?: boolean; required?: boolean } | { type: "list"; options: string[]; controls: ListControl[]; default?: string[] }
```

### `DslNode`
`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.
**Properties:**
- `type: string` — A component (leaf) name, or a block/section doc name.
- `variant: string` (optional) — Pick a named preset (variant) on the referenced document.
- `props: Record<string, unknown>` (optional) — Inputs for the referenced doc, or props for a component. A value may be a {$bind} into the current doc.
- `children: DslChild | DslChild[]` (optional)

### `DslDocument`
`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.
**Properties:**
- `name: string`
- `tier: Tier`
- `params: Record<string, ParamSpec>` (optional) — The upward contract: ALL (and only) what the tier above may set.
- `variants: Record<string, Record<string, unknown>>` (optional) — Named presets binding this document's own params.
- `catalog: Record<string, DslNode>` (optional) — Named, fully-configured child instances a `list` param picks from.
- `root: DslNode`

### `DslChild`
`@suluk/builder` — the tiered contract-narrowing DSL (components → blocks → sections → pages), bound to the
Suluk cycle. The mechanism is ported from ~/apps/multivendorbuilder's DSL and rebuilt with the Suluk
discipline (typed, tested, projected from live entities instead of hand-authored). The load-bearing idea is
the contract: a document's `params` is EXACTLY and ONLY what the tier above may set — the narrowing is the
safety surface, the same discipline as Suluk's per-viewer doc projection.

The Suluk twist: a SECTION is a full-stack vertical slice (data → contract → docs → state → ui) and a PAGE
composes sections — so buildApp emits the backend (routes + v4) AND the frontend (components + page TSX)
from one spec. Each slice can also be packaged as a shadcn REGISTRY ITEM (toShadcnRegistry) bundling its
frontend + backend files into one installable unit. CANDIDATE tooling — NOT official OAS.
```ts
string | number | DslNode | EachRef | SlotRef
```

### `BindRef`
Forwards a resolved param of the current document.
**Properties:**
- `$bind: string`

### `EachRef`
Placeholder expanded to the consumer's catalog selection.
**Properties:**
- `$each: string`

### `SlotRef`
Placeholder where a consumer's passed-in children render.
**Properties:**
- `$slot: true`

## registry

### `Registry`
**Properties:**
- `components: Set<string>` — Leaf component (UI primitive) names a block may reference.
- `blocks: Record<string, DslDocument>`
- `sections: Record<string, DslDocument>`
- `pages: Record<string, DslDocument>`

## validate

### `DslError`
**Properties:**
- `doc: string`
- `path: string`
- `message: string`

## fullstack

### `Entity`
**Properties:**
- `name: string`
- `schema: SchemaOrRef`

### `AppSpec`
**Properties:**
- `entities: Entity[]`
- `pages: DslDocument[]` (optional) — Optional explicit pages; if omitted, one "App" page composing every entity's CRUD section is generated.
- `info: { title?: string; version?: string }` (optional)
- `baseUrl: string` (optional)

### `BuiltApp`
**Properties:**
- `entities: Entity[]`
- `registry: Registry`
- `backend: { routes: RouteContract[]; document: OpenAPIv4Document }`
- `frontend: { components: { name: string; tsx: string }[]; pages: { name: string; tsx: string }[] }`
- `errors: DslError[]` — DSL contract violations (empty ⇒ the composition is sound).

## registry-shadcn

### `RegistryItem`
**Properties:**
- `$schema: string`
- `name: string`
- `type: string`
- `title: string`
- `description: string`
- `dependencies: string[]` (optional)
- `registryDependencies: string[]` (optional)
- `files: RegistryFile[]`

### `RegistryFile`
**Properties:**
- `path: string`
- `content: string`
- `type: string` — registry:component | registry:lib | registry:file | registry:page | …
- `target: string` (optional) — For registry:file — the install target path in the consumer project.

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

### `ModuleCost`
A per-operation cost facet (mirrors @suluk/cost's CostModel; kept local so builder needn't depend on cost).
**Properties:**
- `components: { source: string; basis: string; microUsd: number }[]`
- `estimateMicroUsd: number`

### `ModuleRegistry`
**Properties:**
- `name: string`
- `homepage: string` (optional)
- `modules: ModuleEntry[]`

### `ModuleEntry`
**Properties:**
- `title: string`
- `description: string`
- `module: SulukModule`

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

## modules

### `StackTemplate`
A named set of modules that compose into a working platform (L2 — the non-developer flow).
**Properties:**
- `name: string`
- `description: string`
- `modules: string[]` — module names, resolved against a registry

## marketing

### `MarketingSpec`
**Properties:**
- `hero: { titleKey: string; subtitleKey?: string; ctaKey: string; ctaHref: string }`
- `features: { featureKeys: string[] }` (optional)
- `pricing: { plans: PlanSpec[]; currency?: string }` (optional)
- `testimonials: { source?: ProjectionSource }` (optional) — present (even {}) ⇒ include the testimonials section; default source = approved Reviews.
- `faq: { source?: ProjectionSource }` (optional) — present (even {}) ⇒ include the FAQ section; default source = active Faqs, ordered.
- `cta: { titleKey: string; buttonKey: string; buttonHref: string; newsletter?: boolean }` (optional)
- `footer: { builtWith?: string[]; newsletterLabelKey?: string }` (optional)
- `order: string[]` (optional) — explicit section order; default = every configured section, canonical order.

### `BuiltMarketing`
**Properties:**
- `registry: Registry`
- `blocks: DslDocument[]`
- `sections: DslDocument[]`
- `page: DslDocument`
- `errors: DslError[]` — DSL contract violations (empty ⇒ the landing composition is sound).

### `PlanSpec`
A pricing plan — static config (no live Stripe matrix); `stripePriceId` is carried for the app to resolve.
**Properties:**
- `id: string`
- `nameKey: string`
- `priceCents: number`
- `featureKeys: string[]`
- `ctaKey: string`
- `ctaHref: string` (optional)
- `featured: boolean` (optional)
- `stripePriceId: string` (optional) — the app resolves the live price/checkout from this, if set.

### `ProjectionSource`
A declarative projection a data-driven section reads from — the app's renderer turns it into a query.
**Properties:**
- `entity: string`
- `where: Record<string, unknown>` (optional)
- `sort: string` (optional)
- `limit: number` (optional)

### `SeoMeta`
**Properties:**
- `title: string`
- `description: string`
- `keywords: string[]`
- `canonical: string` (optional)
- `ogTitle: string`
- `ogDescription: string`
- `ogImage: string` (optional)
- `ogType: string`
- `twitterCard: string`
- `locale: string`
- `alternates: Record<string, string>`

### `SeoMetaInput`
**Properties:**
- `title: string`
- `description: string`
- `keywords: string[]` (optional)
- `canonical: string` (optional)
- `ogTitle: string` (optional)
- `ogDescription: string` (optional)
- `ogImage: string` (optional)
- `ogType: string` (optional)
- `twitterCard: string` (optional)
- `locale: string` (optional)
- `alternates: Record<string, string>` (optional) — locale → URL alternates (hreflang).

### `JsonLdKind`
```ts
"Organization" | "WebSite" | "Product" | "Review" | "FAQPage"
```

## compose

### `CompositionPlan`
**Properties:**
- `order: SulukModule[]` — modules in install order — each one's requires are met by the base or an earlier entry
- `unmet: { module: string; requires: string }[]` — requirements neither the base nor ANOTHER selected module provides (a self-provide cannot bootstrap)
- `collisions: string[]` — clashes installModule would refuse even with names satisfied: duplicate module, two providers of one
 entity (incl. the base), or two entity names mapping to one lowercased path resource
- `unresolved: string[]` — modules that could not be ordered — they require each other, or sit behind a cycle
- `ok: boolean` — true ⇒ the whole set installs in `order` with every requirement met and no collision (matches composeModules)

### `ComposeResult`
**Properties:**
- `doc: OpenAPIv4Document`
- `steps: ComposeStep[]`
- `plan: CompositionPlan`
- `ok: boolean` — true ⇒ the plan was complete AND every step installed cleanly

### `ComposeStep`
**Properties:**
- `module: string`
- `installed: boolean`
- `conflicts: string[]`
- `added: { schemas: string[]; operations: string[] }`

## providers

### `ProviderImpl`
Provider SLOTS (M3) — "swap out a provider you chose." A module declares `providerSlots` (e.g.
`{ payments: "stripe" }`); installModule records them into the document as `x-suluk-providers`. Each facet
(payments / auth / email / storage) is a SLOT bound to one implementation of a duck-typed interface — exactly
the pattern @suluk/stripe's `PaymentProvider` and @suluk/deploy's `DeployProvider` already prove. Swapping
rebinds the slot to another implementation of the SAME interface; the contract (the operations, their cost)

<!-- truncated -->
