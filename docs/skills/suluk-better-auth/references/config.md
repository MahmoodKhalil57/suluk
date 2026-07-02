# Configuration

## IngestOptions

### Properties

#### basePath

Prefix every ingested path with this base (Better Auth mounts under "/api/auth").

**Type:** `string`

## PrincipalOptions

### Properties

#### roleScopes

Map a role name → the scopes it grants (e.g. { admin: ["read:*","write:*"], user: ["read:self"] }).

**Type:** `Record<string, string[]>`

#### orgRoleScopes

Map an ORG role → the scopes it grants WITHIN an org (each namespaced to `org:<id>:<scope>`).

**Type:** `Record<string, string[]>`

## MountAuthOptions

### Properties

#### basePath

Base path Better Auth is mounted at (default "/api/auth").

**Type:** `string`

#### methods

HTTP methods to route (default ["POST","GET"]).

**Type:** `string[]`

## VerifyApiKeyOptions

### Properties

#### requireScopes

require the key to carry these scopes (checked in the SAME call via Better Auth `permissions`, services/auth.ts:133-147).

**Type:** `string[]`

## CascadeOptions

### Properties

#### continueOnError

if a step throws: log + continue (true), or ABORT the whole cascade (false — the fail-closed default, so a
 failed cleanup never silently half-erases and then deletes the user).

**Type:** `boolean`

#### log

diagnostics sink (default console.error).

**Type:** `(step: string, error: unknown) => void`

## EmailVerificationOptions

### Properties

#### sendVerificationEmail

send the verification email — bind to your branded-email builder.

**Type:** `(data: { user: { email: string }; url: string; token?: string }) => void | Promise<void>`

**Required:** yes

#### autoSignIn

sign the user in automatically after they click the verification link (default true — frictionless).

**Type:** `boolean`

#### sendOnSignUp

send a verification email on sign-up (default true).

**Type:** `boolean`

## PreviewLoginOptions

### Properties

#### allowedRoles

The roles a preview may assume — derive from the contract (cockpit previewRoles), NEVER a hardcoded list.
 A requested role MUST be a member; "anonymous" is handled by the launcher (it opens the app with no login).

**Type:** `string[]`

**Required:** yes

#### mintSession

Establish a role-scoped session for the SEEDED demo user of `role` (looks it up in env.PREVIEW_DB).
 This is the only code that touches a session; it must bind to a seeded throwaway row, never a real user.

**Type:** `(role: string) => MintedSession | Promise<MintedSession>`

**Required:** yes

#### redirectTo

Where to land after login (default "/").

**Type:** `string`

## DevLoginOptions

### Properties

#### armed

FAIL-CLOSED gate — MUST be `true` to arm the endpoint. The registry passes its dev-mock condition; prod passes false.

**Type:** `boolean`

**Required:** yes

#### auth

the Better Auth instance (its `api.signUpEmail`/`signInEmail`).

**Type:** `DevLoginAuthLike`

**Required:** yes

#### request

the incoming request — a JSON body `{ email }`.

**Type:** `Request`

**Required:** yes

#### devPassword

override the fixed internal dev password (dev only; never surfaced).

**Type:** `string`