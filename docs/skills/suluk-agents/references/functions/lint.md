# Functions

## lint

### `lintAgents`
`@suluk/agents` — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.

NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
test/core-boundary.test.ts enforces it as a maintained tripwire.
```ts
lintAgents(doc: OpenAPIv4Document): LintFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `LintFinding[]`

### `lintOk`
True ⇒ no error-severity findings (warnings/info are advisory).
```ts
lintOk(findings: LintFinding[]): boolean
```
**Parameters:**
- `findings: LintFinding[]`
**Returns:** `boolean`

### `assertAgentInstallable`
Convenience: lint a single agent's existence + errors, throwing the first error (for fail-loud projection).
```ts
assertAgentInstallable(doc: OpenAPIv4Document, agentName: string): void
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
