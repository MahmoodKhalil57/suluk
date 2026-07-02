# Functions

## manifest

### `agentManifest`
Build the canonical, signable manifest for an agent and its reachable sub-tree. Pure; does not throw.
```ts
agentManifest(doc: OpenAPIv4Document, agentName: string, opts: { catalog?: ModelCatalog }): AgentManifest
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `opts: { catalog?: ModelCatalog }` — default: `{}`
**Returns:** `AgentManifest`

### `verifyAgentFreshness`
Verify a signed manifest's skills against the CURRENT served snapshots: each skill's signed `contentHash` must
equal the hash of its current snapshot. A mismatch ⇒ the served preprompt drifted after the signature was minted
(a stale/unsigned change). A skill with no declared `contentHash` ⇒ unpinned (drift undetectable). Snapshots are
keyed qualified `"<agentKey>/<skillName>"` (preferred) OR bare `"<skillName>"` (back-compat) — the same dual-accept
`gradeAgent` and `resolveInstruction` use, so one `snapshots` map feeds every consumer; a skill with no provided
snapshot is skipped (cannot be checked here).
```ts
verifyAgentFreshness(manifest: AgentManifest, snapshots: Record<string, string>): ConformanceFinding[]
```
**Parameters:**
- `manifest: AgentManifest`
- `snapshots: Record<string, string>`
**Returns:** `ConformanceFinding[]`
