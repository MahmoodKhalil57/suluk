# Configuration

## LoadOptions

### Properties

#### content

the .env file text (with encrypted tokens).

**Type:** `string`

**Required:** yes

#### privateKey

SULUK_PRIVATE_KEY — required iff any value is encrypted.

**Type:** `string`

#### target

where to inject (default: process.env when it exists). Pass an object to capture without touching the real env.

**Type:** `Record<string, string | undefined>`

#### override

overwrite keys already set in the target (default false — a real environment variable wins over the file).

**Type:** `boolean`

## AssertOptions

### Properties

#### surface

the surface being validated (gates requiredInSurface + forbidInSurface).

**Type:** `Surface`

#### allow

var names whose ERRORS are downgraded to allowed (an explicit, auditable override).

**Type:** `string[]`

#### onWarn

called once per warning (e.g. console.warn) — assertEnv never throws on warnings.

**Type:** `(issue: EnvIssue) => void`