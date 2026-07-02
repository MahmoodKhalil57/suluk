# Configuration

## OutlineRenderOptions

### Properties

#### only

only render these operations (by name); default all.

**Type:** `string[]`

#### feature

**Type:** `string`

## BindOptions

### Properties

#### aliases

shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions.

**Type:** `Record<string, string>`

#### definitions

the scaffolder's full mapping layer (aliases + decompositions + named journeys).

**Type:** `Definitions`

#### maxHoles

how many coverage-hole stubs to emit (default: all).

**Type:** `number`

## EmitOptions

### Properties

#### clientModule

import specifier for the consumer's generated SDK (default: the consumer's local "./sdk").

**Type:** `string`

#### clientFactory

named export that creates a client (default: "createClient").

**Type:** `string`

#### baseUrlEnv

env var holding the live base URL (default: "SULUK_BASE_URL").

**Type:** `string`

#### tokenEnv

env var holding a bearer token for authenticated scenarios (default: "SULUK_USER_TOKEN").

**Type:** `string`

#### aliases

shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions.

**Type:** `Record<string, string>`

#### definitions

the scaffolder's full mapping layer (aliases + decompositions + named journeys).

**Type:** `Definitions`

#### maxHoles

how many coverage-hole stubs to emit (default: all).

**Type:** `number`

## CompileDemoOptions

### Properties

#### aliases

shorthand for `definitions.steps` with 1:1 string values — an author-owned synonym map. Merged into definitions.

**Type:** `Record<string, string>`

#### definitions

the scaffolder's full mapping layer (aliases + decompositions + named journeys).

**Type:** `Definitions`

#### maxHoles

how many coverage-hole stubs to emit (default: all).

**Type:** `number`

## RenderOptions

### Properties

#### name

collection name (default the doc/feature title or "Demo").

**Type:** `string`

#### baseUrl

the PROD base URL — the live-call target the tester switches to.

**Type:** `string`

#### localBaseUrl

the LOCAL base URL a developer tests against FIRST (the same collection, just a different `baseUrl`). Default a
 Cloudflare Workers `wrangler dev` port.

**Type:** `string`

## BuildDemoFilesOptions

### Properties

#### format

which collection(s) to emit (default "both").

**Type:** `DemoFormat`

#### name

collection name (default the contract's info.title).

**Type:** `string`

#### baseUrl

the PROD base URL (the live-call target).

**Type:** `string`

#### localBaseUrl

the LOCAL base URL a developer rehearses against first.

**Type:** `string`

## SynthOptions

### Properties

#### direction

**Type:** `SynthDirection`