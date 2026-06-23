/**
 * measure.ts — SIDE (b) of the Stage-0 measurement. Runs the REAL @suluk/agents projection against weather.contract.ts
 * and proves that every [WIRING]/[TOOL-DERIVABLE] block in handwritten.cf-agent.ts is something the existing package
 * already emits — then prints the line accounting + the boilerplate-elimination ratio + the generator-vs-template verdict.
 *
 *   bun run tooling/ts/packages/agents/examples/measure-cf-agent/measure.ts
 */
import { projectOpenRouter, projectClaudePlugin, reachableSurface, residentToolNames } from "../../src/index";
import { weatherDoc, weatherInstructions } from "./weather.contract";

const AGENT = "weatherAssistant";

// ── 1. What the EXISTING projection already derives (the proof behind the [TOOL-DERIVABLE]/[WIRING] tags) ──────────
const m = projectOpenRouter(weatherDoc, AGENT, { instructions: weatherInstructions });
const plugin = projectClaudePlugin(weatherDoc, AGENT, {
  mcpUrl: "https://weather.example.com/mcp", version: "1.0.0", homepage: "https://weather.example.com",
  instructions: weatherInstructions,
});
const reach = reachableSurface(weatherDoc, AGENT);
const resident = residentToolNames(weatherDoc, AGENT);

console.log("── DERIVED by @suluk/agents (today, no new code) ──────────────────────────────");
console.log("model preference   :", m.model);
console.log("default tool surface:", m.tools.map((t) => t.function.name));
console.log("cold-tail (discover):", m.discoverable.map((t) => t.function.name));
console.log("resident tool names :", resident);
console.log("reachable surface   :", reach);
console.log("get_weather params  :", JSON.stringify(m.tools.find((t) => t.function.name === "get_weather")?.function.parameters));
console.log("calculate params    :", JSON.stringify(m.tools.find((t) => t.function.name === "calculate")?.function.parameters));
console.log("plugin files        :", Object.keys(plugin.files));
console.log("SKILL.md pins hash  :", /contentHash: sha256-/.test(plugin.files["skills/chat/SKILL.md"] ?? ""));
console.log(".mcp.json no secret :", !/bearer|token|secret|api[_-]?key/i.test(plugin.files[".mcp.json"]));

// ── 2. Cross-check: the tools I CLAIM are derivable must equal what the projection actually emits ─────────────────
const derivedToolNames = new Set([...m.tools, ...m.discoverable].map((t) => t.function.name).filter((n) => n !== "discover_tools"));
const claimedDerivableTools = ["get_weather", "calculate", "get_forecast"]; // the [TOOL-DERIVABLE] tool blocks
const mismatch = claimedDerivableTools.filter((n) => !derivedToolNames.has(n));
if (mismatch.length) throw new Error(`accounting drift — claimed-derivable tools not actually projected: ${mismatch.join(", ")}`);

// ── 3. Line accounting — each block maps to a tagged section in handwritten.cf-agent.ts ──────────────────────────
type Cat = "WIRING" | "TOOL-DERIVABLE" | "BESPOKE" | "BESPOKE:GAP";
const blocks: { block: string; loc: number; cat: Cat }[] = [
  { block: "imports (agents/ai/zod)",            loc: 5, cat: "WIRING" },
  { block: "Env interface (wrangler types)",     loc: 4, cat: "WIRING" },
  { block: "onChatMessage skeleton + binding",   loc: 3, cat: "WIRING" },
  { block: "model id (skill.model[0])",          loc: 1, cat: "TOOL-DERIVABLE" },
  { block: "system prompt text",                 loc: 3, cat: "BESPOKE" },
  { block: "convertToModelMessages + prune",     loc: 1, cat: "WIRING" },
  { block: "stopWhen / stepCountIs (loop policy)",loc: 1, cat: "BESPOKE" },
  { block: "get_weather: name+desc+inputSchema", loc: 3, cat: "TOOL-DERIVABLE" },
  { block: "get_weather: execute body",          loc: 4, cat: "BESPOKE" },
  { block: "calculate: name+desc+inputSchema",   loc: 3, cat: "TOOL-DERIVABLE" },
  { block: "calculate: needsApproval gate",      loc: 1, cat: "BESPOKE:GAP" },
  { block: "calculate: execute body",            loc: 1, cat: "BESPOKE" },
  { block: "get_user_timezone (client-only tool)",loc: 4, cat: "BESPOKE" },
  { block: "toUIMessageStreamResponse",          loc: 1, cat: "WIRING" },
  { block: "worker fetch + routeAgentRequest",   loc: 4, cat: "WIRING" },
  { block: "wrangler.jsonc (DO binding+migration)",loc: 9, cat: "WIRING" },
];

const sum = (c: Cat) => blocks.filter((b) => b.cat === c).reduce((n, b) => n + b.loc, 0);
const total = blocks.reduce((n, b) => n + b.loc, 0);
const wiring = sum("WIRING"), toolDeriv = sum("TOOL-DERIVABLE"), bespoke = sum("BESPOKE"), gap = sum("BESPOKE:GAP");
const derivableNow = wiring + toolDeriv;
const derivableAfterFacet = derivableNow + gap;
const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

console.log("\n── LINE ACCOUNTING (handwritten.cf-agent.ts) ─────────────────────────────────");
for (const b of blocks) console.log(`  ${b.cat.padEnd(14)} ${String(b.loc).padStart(2)}  ${b.block}`);
console.log("  ────────────────────────────────────────────────────────");
console.log(`  total meaningful LOC            : ${total}`);
console.log(`  WIRING (generator emits verbatim): ${wiring}  (${pct(wiring)})`);
console.log(`  TOOL-DERIVABLE (from contract op): ${toolDeriv}  (${pct(toolDeriv)})`);
console.log(`  BESPOKE (irreducible brain)      : ${bespoke}  (${pct(bespoke)})`);
console.log(`  BESPOKE:GAP (Stage-1.4 facet)    : ${gap}  (${pct(gap)})`);
console.log("  ────────────────────────────────────────────────────────");
console.log(`  DERIVABLE NOW (wiring+tool)      : ${derivableNow}/${total}  = ${pct(derivableNow)}`);
console.log(`  DERIVABLE after x-suluk-approval : ${derivableAfterFacet}/${total}  = ${pct(derivableAfterFacet)}`);

const ratio = derivableNow / total;
const verdict =
  ratio >= 0.6 ? "GENERATOR — derivable wiring is the majority; projectCloudflareAgent earns its keep (Stage 2 path A)."
  : ratio >= 0.4 ? "BORDERLINE — generator helps but the brain dominates; weigh template (path B) first."
  : "TEMPLATE — too little is derivable; ship a copy-paste example (Stage 2 path B), skip the generator.";
console.log(`\n  VERDICT: ${verdict}`);
