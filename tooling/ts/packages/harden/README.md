<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/harden

**Schema hardening as a derived, scored contract facet — grade a v4 document's input schemas A–F, fail CI below a floor, and fill the gaps with one transform.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/harden
```

## What it does

It audits the **input** surface of an OpenAPI v4 "Suluk" document — every request body and typed parameter slot (`path` / `query` / `header` / `cookie` / `body`) — for the validations that keep malformed or oversized input from breaking the system:

- **no `any`/`unknown`** — every input has a determinable `type` (or is bounded by `enum`/`const`);
- **every string** a `maxLength` **and** a `pattern` (a character allowlist) — unless bounded by `format`/`enum`/`const`;
- **every number** a `maximum` (and ideally a `minimum`);
- **every array** a `maxItems` (a DoS guard);
- **every object** closed (`additionalProperties: false`) and typed (defined `properties`).

It scores each operation and the whole document (0–100 → letter grade), emits concrete `Finding`s with a `fix` string, and gives you a **CI gate** (`assertGrade`) so a regression below the floor throws. The inverse half — `hardenSchema` / `hardenDocument` — is the transform that *fills* those gaps with sensible baseline bounds, turning an F/D contract into a B with one call (authors then tighten per field).

`$ref`'d models are walked once and deduped across operations, so a shared schema is audited (and reported) a single time.

## When to reach for it

- You build a v4 document (from `@suluk/drizzle`, `@suluk/hono`, or by hand) and want **input-validation coverage** scored and visible — to incentivise hardening rather than hope for it.
- You want to **gate CI**: `assertGrade(doc, "A")` in a test throws if the authored surface regresses below the floor.
- You want to **auto-tighten** loose schemas: run `hardenDocument` over a built document to add baseline bounds doc-wide (including the route generator's otherwise-unbounded path-param strings).

This package only *reads and rewrites* the schemas inside a v4 document. It does not validate live requests (that's the wire / `@suluk/core`), and it does not render the grade into a UI — the `@suluk/reference` hardening panel and the `@suluk/editor` diagnostics bar do that by calling `auditDocument` themselves.

## Usage

### Audit — grade the input surface

```ts
import { auditDocument } from "@suluk/harden";

const report = auditDocument(doc); // doc: OpenAPIv4Document
report.grade;        // "A" | "B" | "C" | "D" | "F"
report.score;        // 0–100
report.bySeverity;   // { high, medium, low } — counts across all findings
report.byOperation;  // per-operation audits, weakest first
report.findings;     // Finding[] — { rule, severity, path, message, fix }, deduped by rule@path

for (const f of report.findings) {
  console.log(`${f.severity.toUpperCase()} ${f.path}: ${f.message} → ${f.fix}`);
}
```

Audit a single operation, or skip surfaces you don't author (e.g. a merged third-party auth surface) so they don't count toward the grade:

```ts
import { auditOperation, auditDocument } from "@suluk/harden";

// One operation: auditOperation(doc, uri, operationName, rawRequest)
const op = auditOperation(doc, "/users", "createUser", req);

// Exclude ingested surfaces from the rollup:
const report = auditDocument(doc, {
  ignore: (uri, name) => uri.toLowerCase().includes("auth"),
});
```

### Gate CI — `assertGrade`

The hard incentive: throw if the document's hardening grade falls below `min`. Returns the full `DocAudit` when it passes.

```ts
import { test } from "bun:test";
import { assertGrade } from "@suluk/harden";

test("contract input surface stays fully bounded (grade A)", async () => {
  const document = await app.request("/openapi.json").then((r) => r.json());
  const audit = assertGrade(document, "A", {
    ignore: (uri) => uri.toLowerCase().includes("auth"), // auth is third-party
  });
  // throws below A; on pass you get the report:
  expect(audit.bySeverity.high).toBe(0);
});
```

The thrown message names the worst operations and the high/medium counts, so a failing build tells the author exactly what to add.

### Harden — the inverse transform

`hardenSchema` adds baseline bounds to a single JSON Schema; `hardenDocument` does it to **every** input schema in a built v4 document, in place. Both are idempotent and **never override an author-set bound** — they only fill gaps. Strings bounded by `enum`/`const`/`format` are left alone.

```ts
import { hardenSchema, hardenDocument } from "@suluk/harden";

// Per schema — layer it after your own per-field validations so it only fills what's left:
const schema = hardenSchema(myInsertSchema);
// strings → maxLength + a control-char-rejecting pattern; numbers → min/max;
// arrays → maxItems; objects → additionalProperties:false

// Doc-wide, in place — the transform that makes assertGrade pass:
const document = hardenDocument(builtDoc);
```

Override the floors when the defaults (1024 chars / ±1e12 / 1000 items) are wrong for you, or pass `textPattern: null` to skip the string pattern entirely:

```ts
import { hardenSchema, type HardenOptions } from "@suluk/harden";

const opts: HardenOptions = { maxLength: 80, numberMax: 1_000, maxItems: 50 };
const tightened = hardenSchema(schema, opts);
```

## API

| Export | What it does |
| --- | --- |
| `auditDocument(doc, opts?)` | Audit the whole document → `DocAudit` (per-op grades, deduped rollup, severity breakdown). |
| `auditOperation(doc, uri, name, req)` | Audit one operation's input surface → `OpAudit`. |
| `assertGrade(doc, min, opts?)` | CI gate: throw if the grade is below `min`; else return the `DocAudit`. |
| `grade(score)` | Map a 0–100 score to a letter grade (`A` ≥ 90, `B` ≥ 75, `C` ≥ 60, `D` ≥ 40, else `F`). |
| `hardenSchema(schema, opts?)` | Add baseline bounds to one JSON Schema (idempotent; never overrides). |
| `hardenDocument(doc, opts?)` | Harden every input schema in a built v4 document, in place. |
| `HardenOptions` | `{ maxLength?, textPattern?, numberMax?, numberMin?, maxItems? }` — overridable floors for the transform. |

Types `Audit`, `OpAudit`, `DocAudit`, `Finding`, `Severity` (`"high" \| "medium" \| "low"`), and `Grade` (`"A" \| "B" \| "C" \| "D" \| "F"`) are exported alongside.

## Boundary

The audit↔transform pair is the template for "ship both halves": the audit grades the gaps, `harden` fills them. Hardening is a **derived contract facet** — like `x-suluk-cost`/`x-suluk-access`/`x-suluk-source`, it is *projected from* the contract, not authored separately.

This package stays L3 — **render/generate, never host**. It reads and rewrites the schemas inside a v4 document and returns reports/transformed documents; it does not run a server, validate live wire requests, or store anything. You inject the document (the built v4 doc) and consume the result (a grade, findings, or a hardened copy). Surfacing the grade to a developer (a docs panel, an editor bar) is the consumer's job; enforcing the bounds at runtime is the wire's job.

## License

Apache-2.0
