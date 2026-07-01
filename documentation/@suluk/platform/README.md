[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/platform

# @suluk/platform

Write **one manifest**; the generator plans the shadcn-registry adds, generates the wired Hono entry, merges each module's
provision fragment, and emits the whole scaffold (package.json / tsconfig / wrangler.toml / .env.example / …). The
higher-level surface over the [Suluk registry](https://github.com/MahmoodKhalil57/suluk) + `@suluk/provision`.

There are two authoring surfaces. The **legacy** one (C051) is a single object and is supported forever. The **C053** one
splits a platform into a reusable **system** and a swappable **brand**, adds typed opts, and lets services **compose**.

## The C053 model

### A service is a common interface

`defineService<SO, BO>({ id, mount, provision?, deps?, env?, serviceOpts?, brandOpts?, reads?, compose? })` — the shape a
community shadcn registry extends. The 19 core services are exported as typed consts (`authService`, `creditsService`, …).

### System vs brand

```ts
import { defineSystem, defineBrand, definePlatform, authService, creditsService, emailService } from "@suluk/platform";
import { analyticsService } from "@acme/suluk-analytics"; // a community service

export const system = defineSystem({
  registry: "MahmoodKhalil57/suluk",
  services: [authService, creditsService, emailService, analyticsService],
  globalServiceOpts: { ENVIRONMENT: "production", TRUSTED_ORIGINS: "https://app.example" },
  serviceOpts: { auth: { mcp: { loginPage: "…", consentPage: "…", resource: "…", scopes: ["credits:read"] } } }, // typed by id
  wire: [{ id: "signup-grant", from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 100 } }],
});

export const brand = defineBrand({
  name: "app",
  globalBrandOpts: { BRAND_NAME: "App", BASE_URL: "https://app.example", EMAIL_FROM: "hi@app.example" },
});

export default definePlatform({ system, brand });
```

A **system** (services + serviceOpts + globalServiceOpts + wiring) is the reusable, publishable template. A **brand**
(brandOpts + globalBrandOpts) is thin and swappable — two businesses run the same system with different brands; the generated
entry *code* is identical, only `wrangler.toml [vars]` differ.

### The 2×2 opts matrix

|  | per-service | global |
|---|---|---|
| **service axis** (how it works) | `serviceOpts` → the entry (mount opts) | `globalServiceOpts` (a service `reads` the keys it needs) |
| **brand axis** (identity) | `brandOpts` → `[vars]` | `globalBrandOpts` → `[vars]` |

`serviceOpts` is typed per service id off the imported service objects (or `CoreServiceOptsMap` for a string id) — a wrong
opt is a compile error.

### Composition (`wire`)

An edge binds a producer **port** to a consumer **capability**. It renders **into the producer's existing mount-opt field**
(e.g. `auth.onUserCreated`), not a separate statement — so it reuses a real seam and the hook closure gets a real `env`.
`resolveWiring` validates presence, port/capability existence, JSON-safe params, safe identifiers, and acyclicity; fan-out
(several wires on one port) composes in declaration order. A community service participates by offering a capability (fills a
core port) or exposing its own.

## CLI

```sh
suluk-platform            # generate from ./platform.config.ts (legacy OR { system, brand })
suluk-platform --config <path>
suluk-platform migrate    # print the { system, brand } split of a legacy config (a starting point)
```

`migrate` is byte-faithful: `liftLegacy` → the same generated app as the legacy manifest.

## Guarantees

- **Byte-identity.** A legacy manifest — and any `{ system, brand }` with no wire — regenerates the exact bytes the C051
  generator produced (pinned by a golden test over the real 18-service reference app).
- **Fail closed.** A missing registry, a wrong-typed wire param, or a colliding wire import throws at generate time, not in
  the shipped app.
- **Own the wiring, npm the logic** (C052). A community extends services *and* composition without forking `@suluk` logic.

## Interfaces

- [AuthServiceOpts](interfaces/AuthServiceOpts.md)
- [BrandManifest](interfaces/BrandManifest.md)
- [Capability](interfaces/Capability.md)
- [CatalogEntry](interfaces/CatalogEntry.md)
- [CompositionSurface](interfaces/CompositionSurface.md)
- [EnvVar](interfaces/EnvVar.md)
- [GenerateOptions](interfaces/GenerateOptions.md)
- [GenerateResult](interfaces/GenerateResult.md)
- [McpOAuthOpts](interfaces/McpOAuthOpts.md)
- [Platform](interfaces/Platform.md)
- [PlatformManifest](interfaces/PlatformManifest.md)
- [PlatformPlan](interfaces/PlatformPlan.md)
- [Port](interfaces/Port.md)
- [Schema](interfaces/Schema.md)
- [Service](interfaces/Service.md)
- [SystemManifest](interfaces/SystemManifest.md)
- [WireDecl](interfaces/WireDecl.md)
- [WireImport](interfaces/WireImport.md)
- [Wiring](interfaces/Wiring.md)

## Type Aliases

- [Mount](type-aliases/Mount.md)
- [ServiceRef](type-aliases/ServiceRef.md)

## Variables

- [adminService](variables/adminService.md)
- [appService](variables/appService.md)
- [auditService](variables/auditService.md)
- [authService](variables/authService.md)
- [BASE\_DEPS](variables/BASE_DEPS.md)
- [billingService](variables/billingService.md)
- [CATALOG](variables/CATALOG.md)
- [contractService](variables/contractService.md)
- [CORE\_SERVICES](variables/CORE_SERVICES.md)
- [costService](variables/costService.md)
- [creditsService](variables/creditsService.md)
- [DEV\_DEPS](variables/DEV_DEPS.md)
- [ECOSYSTEM\_VERSIONS](variables/ECOSYSTEM_VERSIONS.md)
- [emailService](variables/emailService.md)
- [erasureService](variables/erasureService.md)
- [i18nService](variables/i18nService.md)
- [journeysService](variables/journeysService.md)
- [keysService](variables/keysService.md)
- [logsService](variables/logsService.md)
- [mcpService](variables/mcpService.md)
- [rateCreditService](variables/rateCreditService.md)
- [rateLimitService](variables/rateLimitService.md)
- [referenceService](variables/referenceService.md)
- [webhooksService](variables/webhooksService.md)

## Functions

- [assertJsonSafe](functions/assertJsonSafe.md)
- [buildPackageJson](functions/buildPackageJson.md)
- [collectEnv](functions/collectEnv.md)
- [defineBrand](functions/defineBrand.md)
- [definePlatform](functions/definePlatform.md)
- [defineService](functions/defineService.md)
- [defineSystem](functions/defineSystem.md)
- [generatePlatform](functions/generatePlatform.md)
- [groupImports](functions/groupImports.md)
- [isPlatform](functions/isPlatform.md)
- [liftLegacy](functions/liftLegacy.md)
- [liftSystemBrand](functions/liftSystemBrand.md)
- [lit](functions/lit.md)
- [mergeGitignore](functions/mergeGitignore.md)
- [mergePackageJson](functions/mergePackageJson.md)
- [mergeProvision](functions/mergeProvision.md)
- [mergeWranglerToml](functions/mergeWranglerToml.md)
- [optsType](functions/optsType.md)
- [orderServices](functions/orderServices.md)
- [planPlatform](functions/planPlatform.md)
- [resolveNodeOpts](functions/resolveNodeOpts.md)
- [resolveVersion](functions/resolveVersion.md)
- [resolveWiring](functions/resolveWiring.md)
- [serviceId](functions/serviceId.md)
- [toCatalogEntry](functions/toCatalogEntry.md)
- [validateIdentifier](functions/validateIdentifier.md)
