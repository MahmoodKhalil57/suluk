[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/cockpit

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

<h1 align="center">@suluk/cockpit</h1>

<p align="center"><b>The pure cockpit core — one brain, two faces: the cycle model, the builder model, codegen, deploy planning, and the validate/audit/preview/converge helpers shared by the VS Code extension and the <code>/superadmin</code> web panel.</b></p>

<p align="center">
  <em>Part of <a href="https://github.com/MahmoodKhalil57/suluk">Suluk</a> — one typed OpenAPI v4 contract projecting into every full-stack layer.</em>
</p>

---

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/cockpit
```

## What it does

Given **one** v4 "Suluk" document, the cockpit computes every view a developer tool needs over it — as
**pure functions, no host API**. The VS Code extension (`suluk-vscode`) and the web admin panel (`@suluk/admin`)
both consume this exact core, so a projection is never reimplemented in a shell.

- **The cycle model** — `buildCycle` projects the document into a layered view (data · contract · auth · cost ·
  docs · state · UI · providers · tests). Each layer is a *projection* of the same source, so you can read the
  lineage at a glance. The model is also a function of the requesting principal — pass scopes and gated
  operations drop out.
- **Validate / audit / preview** — `validateSource` (meta-schema), `auditSource` (doc-coverage findings), and
  `previewHtml` (a self-contained Scalar or Swagger page) over raw source text.
- **The builder model + codegen** — `buildBuilderModel` walks the tiered composition (pages → sections → blocks →
  components); `generateForm` / `generateTable` / `generateAppFiles` land real TSX + a shadcn registry.
- **Lifecycle & coherence** — `contractGates` + `shipSummary` (the "are you ready to ship?" checklist),
  `convergeContract` (cross-cutting contradictions a clean merge leaves behind), `diffContracts` (local-vs-deployed
  drift), `crossCut` (one contract refracted through every viewer), `contractToD2` (ERD / cycle / operation diagrams).
- **Deploy planning** — `deployPlan` / `deployMarkdown` turn the contract into a Cloudflare plan + a `DEPLOY.md`.
  The cockpit **plans**; it never runs `wrangler` and holds no credentials.

## When to reach for it

- You are building **another shell** over the Suluk contract (an editor integration, a CI gate, a dashboard) and
  want the same brain the VS Code extension and `/superadmin` panel use — not a re-derivation.
- You need a **single, principal-aware projection** of a v4 document: what entities, operations, costs, providers
  and gated surfaces it implies, plus its ship-readiness and coherence.

When **not** to: if you only need *one* projection in isolation, depend on it directly — `@suluk/scalar` /
`@suluk/swagger` for docs HTML, `@suluk/shadcn` for forms/tables, `@suluk/builder` for the app graph, `@suluk/deploy`
for the plan. The cockpit's value is **composing** them into the tool views above; reach past it when you don't need that.

## Usage

### The cycle model (the spine)

```ts
import { parseDocument } from "@suluk/core";
import { buildCycle, cycleSummary } from "@suluk/cockpit";

const doc = parseDocument(source); // a v4 "Suluk" document
const model = buildCycle(doc);

model.valid;     // passes the v4 meta-schema?
model.coverage;  // documentation coverage 0..1
cycleSummary(model);
// → [{ layer: "Data (entities)", summary: "3 entities", status: "ok" }, … ]

// Project for a principal — scope-gated operations they can't reach drop out of every layer:
const asViewer = buildCycle(doc, { principal: { scopes: ["read:pets"] } });
```

### Validate · audit · preview (over raw source text)

```ts
import { validateSource, auditSource, previewHtml } from "@suluk/cockpit";

const { ok, diagnostics } = validateSource(yamlOrJsonText);
const { findings } = auditSource(yamlOrJsonText);     // under-documented routes
const { html } = previewHtml(yamlOrJsonText, "scalar"); // or "swagger" — a self-contained page
```

### Ship-readiness + coherence

```ts
import { contractGates, shipSummary, convergeContract } from "@suluk/cockpit";
import type { Baseline } from "@suluk/visual";

const baseline: Baseline = {}; // the pixel-confidence baseline (empty ⇒ not yet verified)
const gates = contractGates(doc, baseline);
const { ready, line } = shipSummary(gates);
// → { ready: false, line: "1 blocker · 1 to do · 3/5 pass" }

const report = convergeContract(doc); // cross-cutting contradictions
report.clean; // true ⇒ no dangling refs / undeclared schemes / orphan scopes / empty paths
```

### Drift, cross-cut, diagrams

```ts
import { diffContracts, crossCut, defaultViewers, contractToD2 } from "@suluk/cockpit";

// "what's drifted in prod" — your LOCAL contract vs the DEPLOYED /openapi.json
diffContracts(local, deployed).summary; // "1+ 0- 2~ ops · 1+ 0- 0~ schemas" | "in sync — local matches deployed"

// one contract refracted through every viewer — the scope-gated surface
crossCut(doc, defaultViewers(doc)).gated; // operations not visible to every viewer

// another projection: D2 diagram source ("erd" | "cycle" | "operations")
const d2 = contractToD2(doc, "erd"); // render with the d2 CLI / playground / kroki.io
```

### Codegen + deploy planning (the actions that land artifacts)

```ts
import { generateForm, generateAppFiles, deployPlan, deployMarkdown } from "@suluk/cockpit";

const formTsx = generateForm(doc, "Pet");        // a shadcn form component (TSX) for an entity
const files = generateAppFiles(doc);             // [{ path, content }] — openapi.json, components, pages, registry, diagrams

const plan = deployPlan(doc);                    // a Cloudflare DeployPlan
const md = deployMarkdown(plan);                 // a DEPLOY.md the user follows (Suluk never runs wrangler)
```

### Modules — install a contract fragment, re-project for free

```ts
import { installModule, ECOMMERCE, buildCycle } from "@suluk/cockpit";

const { doc: merged } = installModule(host, ECOMMERCE); // ECOMMERCE | CRM | BILLING are first-party fragments
buildCycle(merged); // every layer now includes the module's entities, operations, cost and provider slots
```

### Agents (OBSERVE-only)

```ts
import { agentsView, agentsSummary } from "@suluk/cockpit";

const view = agentsView(doc); // the x-suluk-agents tier tree, effective scope, gate findings, reachable surface
agentsSummary(view);          // a one-line digest — read-only; agent execution + secrets live OUTSIDE the cockpit
```

## API

The package exposes a single entry point (`@suluk/cockpit`). The core groups:

| Export | What it does |
| --- | --- |
| `buildCycle`, `cycleSummary`, `docChecks` | the layered cycle model (principal-aware) + doc-level contract checks |
| `validateSource`, `auditSource`, `previewHtml`, `looksLikeV4` | validate / audit / preview over raw source text |
| `buildBuilderModel`, `builderTree`, `entitiesFromDoc`, `generateAppFiles`, `generateRegistryJson` | the tiered builder model + the app/registry generators |
| `entityNames`, `generateForm`, `generateTable`, `generateStoresModule`, `exportV4Json` | per-entity codegen + the canonical JSON export |
| `contractGates`, `shipSummary` | the contract-level ship-readiness gates + a one-line summary |
| `convergeContract` | a coherence audit (dangling refs / undeclared schemes / orphan scopes / preview backdoors) |
| `diffContracts`, `canonical` | local-vs-deployed contract drift |
| `crossCut`, `documentScopes`, `defaultViewers`, `previewRoles`, `previewAllowedRoles`, `previewLaunchUrl` | the per-viewer / role-preview security surface |
| `contractToD2`, `diagramViews` | D2 diagram source (ERD / cycle / operations) |
| `componentReport`, `approveComponents`, `primitiveCss` | UI-primitive decomposition + pixel-confidence (surfaces `@suluk/visual`) |
| `deployPlan`, `deployMarkdown`, `previewDeployPlan`, `previewDeployMarkdown` | Cloudflare deploy planning + the rendered `DEPLOY.md` |
| `agentsView`, `agentsSummary` | the `x-suluk-agents` OBSERVE view (tier tree · scope · context · model selection) |
| `installModule`, `namespaceModule`, `previewInstall`, `gradeModule`, `composeModules`, `planComposition` | install / compose contract-fragment modules into the hub doc |
| `ECOMMERCE`, `CRM`, `BILLING`, `FIRST_PARTY_REGISTRY`, `PROVIDER_CATALOG`, `STACK_TEMPLATES` | the first-party module + provider + stack-template catalogs |
| `providerFacets`, `readProviders`, `swapProvider`, `parseRegistry`, `validateModule`, `resolveTemplate` | provider-slot + registry + template helpers (re-exported from `@suluk/builder`) |
| `formatMicroUsd`, `summarize` | cost formatting (re-exported from `@suluk/cost`) for a live ledger |

Every function is pure and typed against `OpenAPIv4Document` from `@suluk/core`; the type exports (`CycleModel`,
`Gate`, `ConvergeReport`, `ContractDiff`, `CrossCut`, `AgentsView`, …) ride alongside each group.

## Boundary

The cockpit is **L3 — it renders and generates, never hosts** (the C023 line). It is pure logic with no host API:
it returns models, strings and file lists; the *shell* writes files, fetches the deployed `/openapi.json`, opens
terminals and renders webviews. Two consequences:

- **No credentials seam.** Deploy planning emits a `DEPLOY.md` and the plan; it never runs `wrangler` or touches a
  token — `wrangler login`'s OAuth happens in *your* terminal so credentials never reach Suluk (C020). Role-preview
  links are computed (`previewLaunchUrl`) but the cockpit never mints or holds a session.
- **Agents are OBSERVE-only.** `agentsView` derives the static tier tree, effective scope, gate findings and a
  *projection preview* (file/tool **names**). It never executes an agent, fetches a preprompt, or reads a secret.

Inject the host concerns (the bytes to fetch, the deployed document to diff against, the baseline to approve at);
keep the projections here. To contribute a new view, add a pure function over `OpenAPIv4Document` and let both
shells render it.

## License

Apache-2.0

## Interfaces

- [AgentGovernedView](interfaces/AgentGovernedView.md)
- [AgentNodeView](interfaces/AgentNodeView.md)
- [AgentRouteView](interfaces/AgentRouteView.md)
- [AgentSkillView](interfaces/AgentSkillView.md)
- [AgentsView](interfaces/AgentsView.md)
- [BuilderModel](interfaces/BuilderModel.md)
- [BuilderNode](interfaces/BuilderNode.md)
- [ChangedOp](interfaces/ChangedOp.md)
- [ComponentReport](interfaces/ComponentReport.md)
- [ComposeResult](interfaces/ComposeResult.md)
- [CompositionPlan](interfaces/CompositionPlan.md)
- [ContractDiff](interfaces/ContractDiff.md)
- [ConvergeFinding](interfaces/ConvergeFinding.md)
- [ConvergeReport](interfaces/ConvergeReport.md)
- [CostSummary](interfaces/CostSummary.md)
- [CrossCut](interfaces/CrossCut.md)
- [CycleItem](interfaces/CycleItem.md)
- [CycleLayer](interfaces/CycleLayer.md)
- [CycleModel](interfaces/CycleModel.md)
- [DeployPlan](interfaces/DeployPlan.md)
- [DeployProvider](interfaces/DeployProvider.md)
- [DeployStep](interfaces/DeployStep.md)
- [Diagnostic](interfaces/Diagnostic.md)
- [DocCheck](interfaces/DocCheck.md)
- [Gate](interfaces/Gate.md)
- [GatedOp](interfaces/GatedOp.md)
- [GeneratedFile](interfaces/GeneratedFile.md)
- [InstallPreview](interfaces/InstallPreview.md)
- [InstallResult](interfaces/InstallResult.md)
- [ModuleEntry](interfaces/ModuleEntry.md)
- [ModuleGrade](interfaces/ModuleGrade.md)
- [ModuleRegistry](interfaces/ModuleRegistry.md)
- [OpRef](interfaces/OpRef.md)
- [ParsedRegistry](interfaces/ParsedRegistry.md)
- [PreviewRole](interfaces/PreviewRole.md)
- [Principal](interfaces/Principal.md)
- [ProviderBinding](interfaces/ProviderBinding.md)
- [ProviderChange](interfaces/ProviderChange.md)
- [ProviderDelta](interfaces/ProviderDelta.md)
- [ProviderImpl](interfaces/ProviderImpl.md)
- [RegistrySource](interfaces/RegistrySource.md)
- [SignedEnvelope](interfaces/SignedEnvelope.md)
- [StackTemplate](interfaces/StackTemplate.md)
- [SulukModule](interfaces/SulukModule.md)
- [Viewer](interfaces/Viewer.md)
- [ViewerView](interfaces/ViewerView.md)

## Type Aliases

- [Baseline](type-aliases/Baseline.md)
- [ConvergeCode](type-aliases/ConvergeCode.md)
- [DiagramView](type-aliases/DiagramView.md)
- [GateStatus](type-aliases/GateStatus.md)
- [LayerStatus](type-aliases/LayerStatus.md)

## Variables

- [BILLING](variables/BILLING.md)
- [CRM](variables/CRM.md)
- [ECOMMERCE](variables/ECOMMERCE.md)
- [FIRST\_PARTY\_REGISTRY](variables/FIRST_PARTY_REGISTRY.md)
- [PROVIDER\_CATALOG](variables/PROVIDER_CATALOG.md)
- [STACK\_TEMPLATES](variables/STACK_TEMPLATES.md)

## Functions

- [agentsSummary](functions/agentsSummary.md)
- [agentsView](functions/agentsView.md)
- [approveComponents](functions/approveComponents.md)
- [assertConformance](functions/assertConformance.md)
- [auditSource](functions/auditSource.md)
- [buildBuilderModel](functions/buildBuilderModel.md)
- [buildCycle](functions/buildCycle.md)
- [builderTree](functions/builderTree.md)
- [canonical](functions/canonical.md)
- [componentReport](functions/componentReport.md)
- [composeModules](functions/composeModules.md)
- [conformanceGates](functions/conformanceGates.md)
- [contractGates](functions/contractGates.md)
- [contractToD2](functions/contractToD2.md)
- [convergeContract](functions/convergeContract.md)
- [crossCut](functions/crossCut.md)
- [cycleSummary](functions/cycleSummary.md)
- [defaultViewers](functions/defaultViewers.md)
- [deployMarkdown](functions/deployMarkdown.md)
- [deployPlan](functions/deployPlan.md)
- [diagramViews](functions/diagramViews.md)
- [diffContracts](functions/diffContracts.md)
- [docChecks](functions/docChecks.md)
- [documentScopes](functions/documentScopes.md)
- [entitiesFromDoc](functions/entitiesFromDoc.md)
- [entityNames](functions/entityNames.md)
- [exportV4Json](functions/exportV4Json.md)
- [formatMicroUsd](functions/formatMicroUsd.md)
- [generateAppFiles](functions/generateAppFiles.md)
- [generateForm](functions/generateForm.md)
- [generateRegistryJson](functions/generateRegistryJson.md)
- [generateSigningKeypair](functions/generateSigningKeypair.md)
- [generateStoresModule](functions/generateStoresModule.md)
- [generateTable](functions/generateTable.md)
- [gradeModule](functions/gradeModule.md)
- [installModule](functions/installModule.md)
- [isSignedEnvelope](functions/isSignedEnvelope.md)
- [looksLikeV4](functions/looksLikeV4.md)
- [namespaceModule](functions/namespaceModule.md)
- [parseRegistry](functions/parseRegistry.md)
- [planComposition](functions/planComposition.md)
- [previewAllowedRoles](functions/previewAllowedRoles.md)
- [previewDeployMarkdown](functions/previewDeployMarkdown.md)
- [previewDeployPlan](functions/previewDeployPlan.md)
- [previewHtml](functions/previewHtml.md)
- [previewInstall](functions/previewInstall.md)
- [previewLaunchUrl](functions/previewLaunchUrl.md)
- [previewRoles](functions/previewRoles.md)
- [primitiveCss](functions/primitiveCss.md)
- [providerFacets](functions/providerFacets.md)
- [readProviders](functions/readProviders.md)
- [resolveTemplate](functions/resolveTemplate.md)
- [shipSummary](functions/shipSummary.md)
- [signRegistry](functions/signRegistry.md)
- [summarize](functions/summarize.md)
- [swapProvider](functions/swapProvider.md)
- [validateModule](functions/validateModule.md)
- [validateSource](functions/validateSource.md)
- [verifyRegistrySignature](functions/verifyRegistrySignature.md)
