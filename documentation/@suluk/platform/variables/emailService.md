[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/platform](../README.md) / emailService

# Variable: emailService

> `const` **emailService**: `object`

Defined in: [service.ts:265](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/platform/src/service.ts#L265)

## Type Declaration

### deps

> `readonly` **deps**: \[`"@suluk/email"`\]

### env

> `readonly` **env**: \[\{ `hint`: `"omit → the console provider (dev)"`; `name`: `"RESEND_API_KEY"`; `secret`: `true`; \}, \{ `hint`: `"the from-address"`; `name`: `"EMAIL_FROM"`; \}, \{ `hint`: `"email template branding"`; `name`: `"BRAND_NAME"`; \}, \{ `hint`: `"email link base"`; `name`: `"BASE_URL"`; \}, \{ `hint`: "\"production\" → use Resend (else console)"; `name`: `"ENVIRONMENT"`; \}\]

### id

> `readonly` **id**: `"email"` = `"email"`

### mount

> `readonly` **mount**: `object`

#### mount.from

> `readonly` **from**: `"./routes/email"` = `"./routes/email"`

#### mount.kind

> `readonly` **kind**: `"route"` = `"route"`

#### mount.path

> `readonly` **path**: `"/api/email"` = `"/api/email"`

#### mount.symbol

> `readonly` **symbol**: `"emailRoutes"` = `"emailRoutes"`
