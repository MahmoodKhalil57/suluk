---
description: "Official Better-Auth-on-Hono support for Suluk: auth methods -> v4 securitySchemes; ingest Better Auth's OpenAPI 3.0 -> v4; session -> principal for per-viewer docs. CANDIDATE tooling."
name: suluk-better-auth
---

# @suluk/better-auth

Official Better-Auth-on-Hono support for Suluk: auth methods -> v4 securitySchemes; ingest Better Auth's OpenAPI 3.0 -> v4; session -> principal for per-viewer docs. CANDIDATE tooling.

## Quick Start

```ts
import { authSecuritySchemes, ingestAuthOpenAPI, mergeAuth } from "@suluk/better-auth";
import { auth } from "./auth"; // your betterAuth({ … }) instance, with the openAPI() plugin enabled

// 1. auth methods → v4 securitySchemes
const { securitySchemes } = authSecuritySchemes({ session: true, bearer: true, apiKey: true });

// 2. ingest Better Auth's own OpenAPI 3.0 surface, lifted to v4 and prefixed under its mount base
const authSchema = await auth.api.generateOpenAPISchema(); // OpenAPI 3.0
const authV4 = ingestAuthOpenAPI(authSchema, { basePath: "/api/auth" });

// 3. fold auth routes + schemes into your app's v4 document
const document = mergeAuth(appDocument, authV4, { securitySchemes });
// → document.paths now has "api/auth/sign-up/email", …; components.securitySchemes has sessionCookie/bearerAuth/apiKey
```

## Configuration

8 configuration interfaces — see references/config.md for details.

## Quick Reference

42 exports (24 functions, 16 types, 2 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)