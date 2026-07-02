# Configuration

## JourneysConfig

Journeys config (Suluk registry: `journeys`) — where the BDD harness finds your contract + your authored `.feature`
stories. `@suluk/journeys` projects a step VOCABULARY from the v4 contract, binds your Gherkin against it (exact-or-
unbound), grades coverage, and can emit a runnable `bun:test` suite through `@suluk/sdk`'s generated client. This file
is the owned wiring the harness (`src/journeys.test.ts`) reads. Point `contractPath` at your generated v4 doc.

### Properties

#### featuresDir

directory holding the authored `.feature` files (relative to repo root).

**Type:** `string`

**Required:** yes

#### contractPath

path to your generated v4 "Suluk" contract JSON.

**Type:** `string`

**Required:** yes

#### coverageFloor

the lowest BDD coverage grade CI accepts (A best … F worst).

**Type:** `"A" | "B" | "C" | "D" | "F"`

**Required:** yes