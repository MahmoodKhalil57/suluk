[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/builder

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/builder</h1>

<p align="center"><b>Compose a whole app from one declarative spec — <code>buildApp</code> emits the backend (CRUD routes + a v4 document) AND the frontend (shadcn components + page TSX) at once.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/builder
```

## What it does

- **One spec → both ends.** Give `buildApp` a list of entities (each a v4 Schema Object); it returns the
  backend (5 CRUD `RouteContract`s per entity, emitted to a valid v4 document) and the frontend (a shadcn
  Form + Table per entity, plus a page TSX that composes them).
- **A tiered contract-narrowing DSL** — `components → blocks → sections → pages`. Each tier hardcodes most of
  the tier below and re-publishes a deliberately *narrower* `params`. A page can reorder/hide a section's
  blocks and set its tone, but it **cannot** reach into the form's fields — those simply aren't in the
  section's contract, so the validator rejects them. The narrowing *is* the safety surface.
- **Modules** — a `SulukModule` is a mergeable v4 contract fragment (entities + CRUD + cost + provider slots).
  `installModule` merges one into the app document and **refuses on any collision or unmet requirement**
  (never partially applies). `composeModules` installs a whole set in dependency order.
- **Distribution** — `toShadcnRegistry` packages each entity slice (its components + backend routes + v4
  schema) as one installable shadcn registry item; `signRegistry`/`verifyRegistrySignature` add publisher
  provenance for an open marketplace.

Everything is pure and synchronous (no I/O, no runtime), so the whole composition is unit-tested.

## When to reach for it

- You want to **compose a whole app declaratively** from first-party building blocks rather than hand-wiring
  routes, forms, and tables for every entity.
- You're building a **module/registry surface** — installable, composable contract fragments with
  collision-refusal, dependency ordering, swappable provider slots, and signed provenance.
- You're authoring a **landing page as a projection** (hero/features/pricing/testimonials/faq/cta/footer) with
  i18n-key copy + SEO meta + JSON-LD — see `buildMarketing`.

Reach **past** it for the pieces it composes: the underlying schema→contract conversion is `@suluk/zod` /
`@suluk/drizzle`, the route → v4 + validation engine is `@suluk/hono`, and the form/table TSX is
`@suluk/shadcn`. `@suluk/builder` orchestrates those; it doesn't replace them.

## Usage

### Build a whole app from entities (the common case)

```ts
import * as z from "zod";
import { zodToV4 } from "@suluk/zod";
import { buildApp, type Entity } from "@suluk/builder";

// entities as v4 Schema Objects (Zod → v4 is the cycle's standard path)
const Pet: Entity = {
  name: "Pet",
  schema: zodToV4(z.object({
    id: z.number().int().optional(),
    name: z.string().min(1),
    status: z.enum(["available", "sold"]),
  })).schema,
};
const Category: Entity = {
  name: "Category",
  schema: zodToV4(z.object({ id: z.number().int().optional(), name: z.string() })).schema,
};

const app = buildApp({ entities: [Pet, Category], info: { title: "Shop", version: "1.0.0" } });

app.backend.routes;          // 10 RouteContracts (5 CRUD × 2 entities): listPet, createPet, …
app.backend.document;        // a valid OpenAPI v4 document emitted from those routes
app.frontend.components;     // [{ name: "PetForm", tsx }, { name: "PetTable", tsx }, …]
app.frontend.pages;          // [{ name: "App", tsx }] — page composing every entity's CRUD section
app.errors;                  // DslError[] — empty ⇒ the composition is contract-sound
```

`crudRoutesFromSchema(name, schema)` is the unit behind the backend if you only want the routes for one
entity.

### Package each slice as an installable shadcn registry

```ts
import { buildApp, toShadcnRegistry } from "@suluk/builder";

const reg = toShadcnRegistry(app, { name: "pets-registry" });

reg.index;   // registry.json — name + homepage + items[]
reg.items;   // one registry:block per entity (Form + Table + backend routes + v4 schema)
             // plus one registry:page per generated page
// each block installs the whole vertical via `npx shadcn add pet-crud`
```

### Compose a platform from modules

A `SulukModule` is a mergeable v4 contract fragment. The package ships a curated first-party registry
(`AUTH`, `ECOMMERCE`, `CRM`, `BILLING`, `MARKETING`) and `composeModules` installs a set in dependency order
(providers before requirers) through the same refuse-on-collision gate:

```ts
import { composeModules, AUTH, ECOMMERCE, CRM } from "@suluk/builder";

const empty = { openapi: "4.0.0-candidate", info: { title: "App", version: "1.0.0" }, paths: {}, components: { schemas: {} } };

// deliberately out of order — planComposition topologically sorts so AUTH (provides User) installs first
const { doc, steps, ok } = composeModules(empty, [ECOMMERCE, CRM, AUTH]);
ok;                                            // true ⇒ every requirement met, no collision, all installed
Object.keys(doc.components!.schemas!);         // Account, Cart, Contact, Deal, Order, Product, Session, User, …
```

Install one module directly (and preview before committing):

```ts
import { installModule, previewInstall, namespaceModule } from "@suluk/builder";

const preview = previewInstall(appDoc, ECOMMERCE);
preview.willInstall;    // boolean
preview.conflicts;      // why it would be refused (collisions / unmet requires)
preview.addsSchemas;    // ["Product", "Order", …]
preview.grade;          // { grade: "A" | "B" | "C", costCoverage, warnings, … }

const result = installModule(appDoc, ECOMMERCE);
if (!result.installed) {
  // refused — appDoc is UNCHANGED; result.conflicts explains why
  // resolve a name clash by namespacing the module, then retry:
  installModule(appDoc, namespaceModule(ECOMMERCE, "Shop"));  // ⇒ ShopProduct, ShopOrder, …
}
```

Build a stack from a named template:

```ts
import { resolveTemplate, STACK_TEMPLATES, composeModules } from "@suluk/builder";

const saas = STACK_TEMPLATES.find((t) => t.name === "SaaS starter")!;   // auth + billing + crm
const { modules, missing } = resolveTemplate(saas);                     // missing reports any unresolved name
const platform = composeModules(emptyDoc, modules);
```

### Swap a provider slot

A module declares `providerSlots` (e.g. `{ payments: "stripe" }`), recorded into the document as
`x-suluk-providers`. Swap one binding for another implementation of the same interface:

```ts
import { readProviders, swapProvider, PROVIDER_CATALOG } from "@suluk/builder";

readProviders(doc);                          // [{ facet: "payments", impl: "stripe", alternatives: […] }]
const { doc: next, error } = swapProvider(doc, "payments", "paddle");   // error set (doc unchanged) on a bad swap
PROVIDER_CATALOG.payments;                   // stripe, paddle, lemonsqueezy (all the same PaymentProvider interface)
```

### Build a marketing landing (landing-as-projection)

```ts
import { buildMarketing, seoMeta, jsonLd, type MarketingSpec } from "@suluk/builder";

const spec: MarketingSpec = {
  hero: { titleKey: "home.heroTitle", ctaKey: "home.getStarted", ctaHref: "/signup" },
  features: { featureKeys: ["home.f1", "home.f2"] },
  pricing: { plans: [{ id: "pro", nameKey: "plans.pro", priceCents: 2900, featureKeys: ["plans.f1"], ctaKey: "plans.cta", stripePriceId: "price_123" }] },
  testimonials: {},   // present ⇒ include; default source = approved Reviews (the app resolves the query)
  faq: {},
};

const landing = buildMarketing(spec);     // { sections, blocks, page, errors } — synchronous, no fetch
const meta = seoMeta({ title: "Acme", description: "The app." });        // og* default from title/description
const ld = jsonLd("Organization", { name: "Acme", url: "https://acme.test" });   // schema.org for <head>
```

Copy is carried as **i18n message keys** (the app resolves them per locale) and data-driven sections carry a
declarative `source` projection — never literal copy or an author-time fetch.

### Trusting a remote registry

```ts
import { parseRegistry, validateModule, verifyRegistrySignature } from "@suluk/builder";

const parsed = parseRegistry(await (await fetch(url)).json());   // rejects malformed/hostile entries (surfaced, not hidden)
parsed.modules;    // only the well-formed ModuleEntry[]
parsed.rejected;   // [{ title, reason }] — why each was refused

// for signed registries, verify against a pinned publisher public key before trusting:
const trusted = await verifyRegistrySignature(registryValue, signatureB64, publisherPublicKeyJwk);
```

## API

| Export | What it does |
| --- | --- |
| `buildApp(spec)` | The headline: entities → `{ backend: { routes, document }, frontend: { components, pages }, registry, errors }`. |
| `crudRoutesFromSchema(name, schema, defs?)` | The 5 CRUD `RouteContract`s for one entity (the unit behind the backend). |
| `formBlock` / `tableBlock` / `crudSection` / `appPage` | The DSL documents for each tier (blocks → section → page). |
| `registry` / `emptyRegistry` / `findDoc` / `allowedTypes` | Build and query the document registry the validator/renderer resolves against. |
| `validateDocument` / `validateAll` | The contract-narrowing + tier-rule checks → `DslError[]`. |
| `resolveParams` / `resolveList` | A document's effective param values / a list param's ordered selection. |
| `renderPageTsx` / `resolveComponents` | Render a page document to frontend TSX / the ordered component names it resolves to. |
| `toShadcnRegistry(app, opts?)` | Package the built app as a shadcn registry (one block per entity + a page item). |
| `installModule` / `previewInstall` / `namespaceModule` / `gradeModule` | Install / preview / collision-resolve / grade a `SulukModule`. |
| `planComposition` / `composeModules` | Dependency-order and install a set of modules into one platform contract. |
| `AUTH` / `ECOMMERCE` / `CRM` / `BILLING` / `MARKETING` | The curated first-party modules (+ `FIRST_PARTY_REGISTRY`). |
| `STACK_TEMPLATES` / `resolveTemplate` | Named module sets ("SaaS starter", "Storefront", …) and their resolver. |
| `PREVIEW` / `PREVIEW_ONLY_MARKER` | The deploy-only role-login fragment (deliberately excluded from the registry/templates). |
| `buildMarketing` / `marketingPage` / `seoMeta` / `jsonLd` | The marketing section tier + SEO meta + schema.org JSON-LD. |
| `PROVIDER_CATALOG` / `readProviders` / `swapProvider` / `providerFacets` | Read and swap provider slots (payments/auth/email/storage). |
| `parseRegistry` / `validateModule` | Validate an untrusted registry fetched from a URL, surfacing rejected entries. |
| `signRegistry` / `verifyRegistrySignature` / `generateSigningKeypair` / `isSignedEnvelope` | ECDSA P-256 publisher signatures for the open marketplace. |

The package has a single entry point — `@suluk/builder` (`import { … } from "@suluk/builder"`). There are no
sub-path exports and no CLI.

## Boundary

This package **renders and generates — it never hosts** (the Suluk L3 line). `buildApp`/`renderPageTsx`/
`toShadcnRegistry` emit **source and documents you own and can edit** (TSX components, a v4 document, a shadcn
registry); the module functions return a merged contract value. Nothing here calls home or stands up a runtime.

Everything is pure over its inputs: `buildApp` takes entity **schemas** (you bring the Drizzle/Zod source), the
registry/remote functions take the **bytes** (you fetch the JSON), and the generated frontend wires to the
`@suluk/nano-stores` client at a `baseUrl` **you** supply. Database access, the actual route handlers, custom
business rules, and the leaf UI components stay app-side — the package composes the contract and the
scaffolding, not the irreducible 20%.

New reusable blocks, sections, and modules belong in the first-party registry here; app-specific compositions
stay in your app.

## License

Apache-2.0

## Interfaces

- [AppSpec](interfaces/AppSpec.md)
- [BindRef](interfaces/BindRef.md)
- [BuiltApp](interfaces/BuiltApp.md)
- [BuiltMarketing](interfaces/BuiltMarketing.md)
- [ComposeResult](interfaces/ComposeResult.md)
- [ComposeStep](interfaces/ComposeStep.md)
- [CompositionPlan](interfaces/CompositionPlan.md)
- [DslDocument](interfaces/DslDocument.md)
- [DslError](interfaces/DslError.md)
- [DslNode](interfaces/DslNode.md)
- [EachRef](interfaces/EachRef.md)
- [Entity](interfaces/Entity.md)
- [InstallPreview](interfaces/InstallPreview.md)
- [InstallResult](interfaces/InstallResult.md)
- [MarketingSpec](interfaces/MarketingSpec.md)
- [ModuleCost](interfaces/ModuleCost.md)
- [ModuleEntry](interfaces/ModuleEntry.md)
- [ModuleGrade](interfaces/ModuleGrade.md)
- [ModuleRegistry](interfaces/ModuleRegistry.md)
- [ParsedRegistry](interfaces/ParsedRegistry.md)
- [PlanSpec](interfaces/PlanSpec.md)
- [ProjectionSource](interfaces/ProjectionSource.md)
- [ProviderBinding](interfaces/ProviderBinding.md)
- [ProviderImpl](interfaces/ProviderImpl.md)
- [Registry](interfaces/Registry.md)
- [RegistryFile](interfaces/RegistryFile.md)
- [RegistryItem](interfaces/RegistryItem.md)
- [RegistrySource](interfaces/RegistrySource.md)
- [SeoMeta](interfaces/SeoMeta.md)
- [SeoMetaInput](interfaces/SeoMetaInput.md)
- [SignedEnvelope](interfaces/SignedEnvelope.md)
- [SlotRef](interfaces/SlotRef.md)
- [StackTemplate](interfaces/StackTemplate.md)
- [SulukModule](interfaces/SulukModule.md)
- [SwapResult](interfaces/SwapResult.md)

## Type Aliases

- [DslChild](type-aliases/DslChild.md)
- [JsonLdKind](type-aliases/JsonLdKind.md)
- [ListControl](type-aliases/ListControl.md)
- [ParamSpec](type-aliases/ParamSpec.md)
- [Tier](type-aliases/Tier.md)

## Variables

- [AUTH](variables/AUTH.md)
- [BILLING](variables/BILLING.md)
- [COMPOSES](variables/COMPOSES.md)
- [CRM](variables/CRM.md)
- [ECOMMERCE](variables/ECOMMERCE.md)
- [FIRST\_PARTY\_REGISTRY](variables/FIRST_PARTY_REGISTRY.md)
- [LAYOUT](variables/LAYOUT.md)
- [MARKETING](variables/MARKETING.md)
- [MARKETING\_COMPONENTS](variables/MARKETING_COMPONENTS.md)
- [PREVIEW](variables/PREVIEW.md)
- [PREVIEW\_ONLY\_MARKER](variables/PREVIEW_ONLY_MARKER.md)
- [PROVIDER\_CATALOG](variables/PROVIDER_CATALOG.md)
- [STACK\_TEMPLATES](variables/STACK_TEMPLATES.md)

## Functions

- [allowedTypes](functions/allowedTypes.md)
- [appPage](functions/appPage.md)
- [buildApp](functions/buildApp.md)
- [buildMarketing](functions/buildMarketing.md)
- [composeModules](functions/composeModules.md)
- [crudRoutesFromSchema](functions/crudRoutesFromSchema.md)
- [crudSection](functions/crudSection.md)
- [crudV4Paths](functions/crudV4Paths.md)
- [emptyRegistry](functions/emptyRegistry.md)
- [findDoc](functions/findDoc.md)
- [formBlock](functions/formBlock.md)
- [generateSigningKeypair](functions/generateSigningKeypair.md)
- [gradeModule](functions/gradeModule.md)
- [installModule](functions/installModule.md)
- [isBind](functions/isBind.md)
- [isEach](functions/isEach.md)
- [isListSpec](functions/isListSpec.md)
- [isSignedEnvelope](functions/isSignedEnvelope.md)
- [isSlot](functions/isSlot.md)
- [jsonLd](functions/jsonLd.md)
- [marketingPage](functions/marketingPage.md)
- [moduleOperations](functions/moduleOperations.md)
- [namespaceModule](functions/namespaceModule.md)
- [parseRegistry](functions/parseRegistry.md)
- [planComposition](functions/planComposition.md)
- [previewInstall](functions/previewInstall.md)
- [providerFacets](functions/providerFacets.md)
- [readProviders](functions/readProviders.md)
- [registry](functions/registry.md)
- [renderPageTsx](functions/renderPageTsx.md)
- [resolveComponents](functions/resolveComponents.md)
- [resolveList](functions/resolveList.md)
- [resolveParams](functions/resolveParams.md)
- [resolveTemplate](functions/resolveTemplate.md)
- [schemaRefName](functions/schemaRefName.md)
- [seoMeta](functions/seoMeta.md)
- [signRegistry](functions/signRegistry.md)
- [swapProvider](functions/swapProvider.md)
- [tableBlock](functions/tableBlock.md)
- [toShadcnRegistry](functions/toShadcnRegistry.md)
- [validateAll](functions/validateAll.md)
- [validateDocument](functions/validateDocument.md)
- [validateModule](functions/validateModule.md)
- [verifyRegistrySignature](functions/verifyRegistrySignature.md)
