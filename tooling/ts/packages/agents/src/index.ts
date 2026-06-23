/**
 * @suluk/agents — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
 * deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
 * one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
 * it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
 * and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.
 *
 * NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
 * test/core-boundary.test.ts enforces it as a maintained tripwire.
 */
export { lintAgents, lintOk, assertAgentInstallable, type LintFinding, type Severity } from "./lint";
export {
  parsePointer, resolveOperationRef, agentMap, subAgentKey, childKeys, findCycle, subtreeDepth, deepStrings,
  type OperationLocus, type ResolvedOperation,
} from "./resolve";
export { contentHash, renderSkillMd, type SkillRenderInput } from "./skill";
export {
  projectClaudePlugin, projectOpenRouter,
  type ClaudePluginOptions, type ClaudePluginArtifacts,
  type OpenRouterOptions, type OpenRouterAgentManifest, type OpenRouterFunctionTool,
} from "./project";
// the THIRD projection target (Stage 2.A): one agent → an owned Cloudflare Agents-SDK scaffold (the runtime) + its
// Durable Object descriptor for @suluk/deploy / @suluk/cloudflare. L3-pure (source strings, no `agents` dep).
export { projectCloudflareAgent, type CloudflareAgentOptions, type CloudflareAgentArtifacts } from "./cloudflare";
// the runtime-adapter seam (C034): swappable AgentRuntimeProvider + a registry — Cloudflare is the first adapter, so a
// future Node/Vercel agent runtime is a new adapter, not a rewrite (mirrors @suluk/deploy's DeployProvider/providers).
export { runtimeProviders, cloudflareRuntime, type AgentRuntimeProvider, type AgentRuntimeArtifacts } from "./runtime";
export { reachableSurface, residentSurface, residentToolNames, assertServedSubset, assertServedSubsetGoverned, assertDefaultServedResident, verifySkillFreshness, conformanceOk, type ConformanceFinding } from "./conformance";
export { intersectScope, analyzeScopes, localEscalations, type Scope, type ScopeEscalation } from "./scope";
export {
  agentManifest, verifyAgentFreshness,
  type AgentManifest, type AgentManifestNode, type AgentManifestSkill, type AgentManifestRoute, type AgentManifestGoverned,
} from "./manifest";
// policy (C028): the operator governance overlay — monotone-narrowing MEET + the static lints. costCeiling is
// DECLARED, never schema-enforced (enforcedBy names a runtime adapter); enforcement is reserved (build-by-nobody).
export {
  policyConstrain, effectiveUnderPolicies, policiesFor, policyAppliesTo, lintPolicy, policyOk,
  type EffectiveAgent, type EffectiveSkill, type PolicyNarrowing, type PolicyConstrainResult,
} from "./policy";
// context budget (C027): estimate each agent's default context load (resident instructions + tool surface) vs its
// budget + smallest model window, and say what to unflatten when overloaded. Estimates, not a tokenizer.
export {
  contextReport, suggestUnflatten,
  type ContextReport, type AgentContextLoad, type UnflattenSuggestion, type FlattenSuggestion,
  type ModelFit, type ToolContextCost, type ContextOptions,
} from "./context";
// model-selection seam (C027 × @suluk/models): a skill declares NEEDS (profile + the analyzer's minWindowRequired +
// the C028 allowlist MEET) and the catalog picks the best CURRENT model — never a hard-coded id.
export { resolveSkillModels, skillModels, deriveCQT, type SkillModelResolution, type ResolvedTarget } from "./model-select";
export { selectModel, deriveRequirements, SEED_CATALOG, PROFILES, type ModelCatalog, type SelectResult, type Preferences, type HardFilters } from "@suluk/models";
export { agentDiagram, agentDiagramHtml, type DiagramNode, type DiagramKind, type AgentDiagramOptions } from "./diagram";
// agent-hardening grade (C027, Stage 1.3): aggregate the install lint + context + (served-fact) conformance/freshness
// + two structure checks into one A–F score + a CI gate — the harden idiom for the agent-COMPOSITION facet.
export {
  gradeAgent, gradeAgents, assertAgentGrade, agentGradeOk, gradeOf,
  type AgentGrade, type AgentGradeReport, type AgentGradeFinding, type AgentGradeOptions, type GradeDimension, type GradeSeverity,
} from "./grade";
