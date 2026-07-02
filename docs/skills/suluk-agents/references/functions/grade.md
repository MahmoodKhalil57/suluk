# Functions

## grade

### `gradeAgent`
Grade ONE agent A–F by aggregating the package's existing checks (+ two structure checks). Pure & static by default.
```ts
gradeAgent(doc: OpenAPIv4Document, agentName: string, opts: AgentGradeOptions): AgentGradeReport
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `opts: AgentGradeOptions` — default: `{}`
**Returns:** `AgentGradeReport`

### `gradeAgents`
Grade EVERY agent in the document (weakest first) — the rollup. Computes the whole-doc passes ONCE (not per agent).
```ts
gradeAgents(doc: OpenAPIv4Document, opts: AgentGradeOptions): AgentGradeReport[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `opts: AgentGradeOptions` — default: `{}`
**Returns:** `AgentGradeReport[]`

### `assertAgentGrade`
CI GATE (the hard incentive, mirrors `@suluk/harden`'s assertGrade): throw if the agent's grade is below `min`.
Returns the report on pass, so a test can additionally assert on it.
```ts
assertAgentGrade(doc: OpenAPIv4Document, agentName: string, min: AgentGrade, opts: AgentGradeOptions): AgentGradeReport
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
- `min: AgentGrade`
- `opts: AgentGradeOptions` — default: `{}`
**Returns:** `AgentGradeReport`

### `agentGradeOk`
True ⇒ the agent's grade is at least `min`.
```ts
agentGradeOk(report: AgentGradeReport, min: AgentGrade): boolean
```
**Parameters:**
- `report: AgentGradeReport`
- `min: AgentGrade`
**Returns:** `boolean`

### `gradeOf`
harden's letter thresholds, mirrored so the two grades share one ORDINAL scale (Stage 1.5 combines LETTERS).
```ts
gradeOf(score: number): AgentGrade
```
**Parameters:**
- `score: number`
**Returns:** `AgentGrade`
