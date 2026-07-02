# Functions

## crosscut

### `crossCut`
Project the contract through every viewer and surface the gated operations.
```ts
crossCut(doc: OpenAPIv4Document, viewers: Viewer[]): CrossCut
```
**Parameters:**
- `doc: OpenAPIv4Document`
- `viewers: Viewer[]`
**Returns:** `CrossCut`

### `documentScopes`
Every scope referenced by any operation's security requirements (sorted, deduped).
```ts
documentScopes(doc: OpenAPIv4Document): string[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `string[]`

### `defaultViewers`
Sensible default viewers for a document: anonymous, one per declared scope, and the full operator view —
so a single command shows the whole gated surface without the user hand-entering scope sets.
```ts
defaultViewers(doc: OpenAPIv4Document): Viewer[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `Viewer[]`

### `previewRoles`
```ts
previewRoles(doc: OpenAPIv4Document): PreviewRole[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `PreviewRole[]`

### `previewAllowedRoles`
The roles a preview may be minted AS — the authenticated principals, EXCLUDING the login-less `anonymous`. This
is the ONE source for the deployed gate's allow-list AND for which demo users seed.sql seeds; keeping them equal
means a role can be previewed iff it is seeded iff the gate allows it (no allow-but-unseedable divergence).
```ts
previewAllowedRoles(doc: OpenAPIv4Document): string[]
```
**Parameters:**
- `doc: OpenAPIv4Document`
**Returns:** `string[]`

### `previewLaunchUrl`
Resolve the browser deep-link for previewing AS a role — the security-critical guard, made PURE so it is
unit-testable (the extension package has no test harness). Hard-REFUSES any non-preview env BEFORE producing
a URL (INV-08: role-preview can never target prod/local). anonymous ⇒ just the app; a role ⇒ the preview
deploy's own gated /preview/login. The extension calls this, then openExternal — it never builds the URL itself.
```ts
previewLaunchUrl(env: { baseUrl: string; isPreview: boolean }, role: string): { refused: true; reason: string } | { refused: false; url: string }
```
**Parameters:**
- `env: { baseUrl: string; isPreview: boolean }`
- `role: string`
**Returns:** `{ refused: true; reason: string } | { refused: false; url: string }`
