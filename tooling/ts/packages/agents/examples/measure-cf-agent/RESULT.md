# Stage 0 measurement result — Cloudflare chat agent, hand-written vs Suluk-projected

> Run 2026-06-22. `bun run examples/measure-cf-agent/measure.ts` (against the **real** `@suluk/agents` projection;
> all 86 package tests still green). Feeds [doc/architecture/cloudflare-agents-roadmap.md](../../../../../doc/architecture/cloudflare-agents-roadmap.md) Stage 0.

## The number

| Category | LOC | % | Meaning |
|---|---:|---:|---|
| **WIRING** | 27 | 56% | identical for every agent — a generator emits it verbatim (imports, Env, `onChatMessage` skeleton, message prune, `routeAgentRequest`, `toUIMessageStreamResponse`, **wrangler DO binding + sqlite migration**) |
| **TOOL-DERIVABLE** | 7 | 15% | from contract operations — tool name/description/**input schema** + the model id (proven: `projectOpenRouter` emits the exact JSON-Schema `parameters`) |
| **BESPOKE** | 13 | 27% | irreducible brain — system-prompt bytes, loop policy (`stepCountIs`), tool `execute` bodies, the client-only `get_user_timezone` |
| **BESPOKE:GAP** | 1 | 2% | bespoke today; the Stage-1.4 `x-suluk-approval` facet would derive it (`needsApproval`) |

- **Derivable now: 34/48 = 71%.** After `x-suluk-approval`: **73%.**
- **Verdict: GENERATOR (Stage 2 path A).** The derivable wiring is the clear majority; `projectCloudflareAgent` earns its keep.

## What the run proved (not asserted)

The existing `@suluk/agents`, with **no new code**, already emits from `weather.contract.ts`:
- the **default tool surface** `[get_weather, calculate, discover_tools]` + **cold-tail** `[get_forecast]` (tier-trim works);
- each tool's **full input JSON Schema** (e.g. `get_weather` → `{city: string, maxLength 80, pattern …}`) — the part a dev hand-writes as Zod;
- the **model preference list** from the skill, the **resident tool names** for `@suluk/mcp`, the reachable surface;
- a Claude **plugin** (`plugin.json` + `.mcp.json` with no secret + a `SKILL.md` that pins the instruction `contentHash`).

A cross-check in `measure.ts` asserts the tools claimed derivable actually come out of the projection, so the accounting can't silently drift from reality.

## Honest caveats (so the verdict isn't over-read)

1. **One example, and a favorable one.** A simple tool-calling chat agent is wiring-heavy. Agents with fat brains (RAG retrieval strategy, multi-step HITL, voice/audio loops, stateful workflows) push the BESPOKE fraction up — 71% is near the **high end**, representative of "thin tool-calling agents," not all agents. Re-measuring an email or scheduled agent (Stage 0, second pass) would bracket the range.
2. **The WIRING/BESPOKE block sizes are a structured estimate**, hand-assigned per tagged block in `handwritten.cf-agent.ts` — not a compiled line-diff. The *tool* claims are machine-checked; the wiring LOC are judgment. Treat 71% as ±10%.
3. **The value is correctness, not LOC saved.** The 56% wiring is exactly what devs get wrong (DO migration classes, `nodejs_compat`, routing convention, no-secret `.mcp.json`, prompt-hash pinning). That — plus derived schemas that can't drift from the API — is the pitch, not "write less code."

## Files

- `weather.contract.ts` — the one `x-suluk-agents` declaration (side b source).
- `handwritten.cf-agent.ts` — what a dev writes today, every block tagged `[WIRING]`/`[TOOL-DERIVABLE]`/`[BESPOKE]`/`[BESPOKE:GAP]` (side a).
- `measure.ts` — runs the real projection, proves the tags, prints the accounting + verdict.
