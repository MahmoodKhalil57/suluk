# Functions

## policy

### `policyConstrain`
Apply ONE operator policy to an agent — a monotone MEET. Returns the narrowed envelope + an audit of every cut.
```ts
policyConstrain(agentName: string, agent: SulukAgent, policy: SulukPolicy): PolicyConstrainResult
```
**Parameters:**
- `agentName: string`
- `agent: SulukAgent`
- `policy: SulukPolicy`
**Returns:** `PolicyConstrainResult`

### `effectiveUnderPolicies`
Apply ALL governing policies to an agent (MEET is associative/commutative — compose left-to-right).
```ts
effectiveUnderPolicies(doc: OpenAPIv4Document, agentName: string): PolicyConstrainResult
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentName: string`
**Returns:** `PolicyConstrainResult`

### `policiesFor`
All policies in the document that govern `agentKey`.
```ts
policiesFor(doc: OpenAPIv4Document, agentKey: string): SulukPolicy[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `agentKey: string`
**Returns:** `SulukPolicy[]`

### `policyAppliesTo`
Does this policy govern `agentKey`? (empty/absent appliesTo ⇒ all agents.)
```ts
policyAppliesTo(policy: SulukPolicy, agentKey: string): boolean
```
**Parameters:**
- `policy: SulukPolicy`
- `agentKey: string`
**Returns:** `boolean`

### `lintPolicy`
Lint every operator policy: D1 selector-rejection, dangling appliesTo, unsatisfiability, widening, cap<estimate.
```ts
lintPolicy(doc: OpenAPIv4Document): LintFinding[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `LintFinding[]`

### `policyOk`
True ⇒ no error-severity policy findings.
```ts
policyOk(findings: LintFinding[]): boolean
```
**Parameters:**
- `findings: LintFinding[]`
**Returns:** `boolean`
