# Functions

## deploy

### `deployPlan`
Build the Cloudflare deploy plan from a v4 document (its schemas → entities).
```ts
deployPlan(doc: OpenAPIv4Document): DeployPlan
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `DeployPlan`

### `deployMarkdown`
Render the deploy plan as a DEPLOY.md the user can follow step by step.
```ts
deployMarkdown(plan: DeployPlan): string
```
**Parameters:**
- `plan: DeployPlan`
**Returns:** `string`

### `previewDeployPlan`
Build the PREVIEW deploy plan (charter-bounded role-preview): a `${slug}-preview` Worker with the two
fail-closed locks + a seed.sql for the contract's roles. Terminal-gated identically to prod — Suluk holds no
infra token; the USER runs wrangler. The seeded roles come from the contract (previewRoles), never hardcoded.
```ts
previewDeployPlan(doc: OpenAPIv4Document): DeployPlan
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `DeployPlan`

### `previewDeployMarkdown`
Render a PREVIEW deploy plan as a PREVIEW-DEPLOY.md — same steps, but headed with the role-preview safety.
```ts
previewDeployMarkdown(plan: DeployPlan): string
```
**Parameters:**
- `plan: DeployPlan`
**Returns:** `string`
