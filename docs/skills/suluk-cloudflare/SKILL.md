---
description: "Butter-smooth, API-driven provisioning + deployment for a Suluk app on Cloudflare — no wrangler CLI. A typed REST client + idempotent provisioners (D1, KV, R2, secrets) + the Workers module-script + static-assets upload flow, orchestrated into one deploy(). The platform that ships itself, shipping itself. CANDIDATE tooling."
name: suluk-cloudflare
---

# @suluk/cloudflare

Butter-smooth, API-driven provisioning + deployment for a Suluk app on Cloudflare — no wrangler CLI. A typed REST client + idempotent provisioners (D1, KV, R2, secrets) + the Workers module-script + static-assets upload flow, orchestrated into one deploy(). The platform that ships itself, shipping itself. CANDIDATE tooling.

## Quick Start

```ts
import { deployWith, type AssetFile } from "@suluk/cloudflare";
import { readFileSync } from "node:fs";

const assets: AssetFile[] = [
  { path: "/index.html", bytes: new Uint8Array(readFileSync("dist/index.html")), contentType: "text/html" },
  // …walk your dist/ dir and map each file to { path, bytes, contentType }
];

const res = await deployWith(
  { apiToken: process.env.CLOUDFLARE_API_TOKEN!, accountId: process.env.CLOUDFLARE_ACCOUNT_ID },
  {
    scriptName: "saasuluk",
    module: readFileSync("worker/dist/worker.js", "utf8"), // the bundled ES module
    compatibilityDate: "2026-06-01",
    compatibilityFlags: ["nodejs_compat"],
    d1: { binding: "DB", databaseName: "saasuluk-db", migrations: [{ name: "0000_init.sql", sql: "CREATE TABLE t (id INTEGER);" }] },
    kv: [{ binding: "RATE_LIMIT_KV", title: "saasuluk-ratelimit" }],
    r2: [{ binding: "MEDIA", bucketName: "saasuluk-media" }],
    assets,
    assetsConfig: { html_handling: "auto-trailing-slash" },
    vars: { STRIPE_METER_EVENT_NAME: "saasuluk_cost" },     // plain-text bindings
    secrets: { BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET }, // encrypted; empty/undefined skipped
    crons: ["0 * * * *"],
    observability: true,
  },
  (msg) => console.log("  " + msg), // optional DeployLog — narrates each step
);

console.log(`Deployed "${res.scriptName}" to ${res.accountId} — D1 ${res.d1?.id}, ${res.assetsUploaded} assets, secrets: ${res.secretsSet.join(", ")}`);
```

## Configuration

4 configuration interfaces — see references/config.md for details.

## Quick Reference

41 exports (24 functions, 2 classes, 15 types) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)