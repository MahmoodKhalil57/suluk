# Configuration

## HardenOptions

Overridable floors — defaults match the baseline (1024 chars / ±1e12 / 1000 items / no control chars).

### Properties

#### maxLength

**Type:** `number`

#### textPattern

reject NUL + control chars (tab/newline/CR allowed). Pass null to skip adding a pattern.

**Type:** `string | null`

#### numberMax

**Type:** `number`

#### numberMin

**Type:** `number`

#### maxItems

**Type:** `number`

## ReadinessOptions

### Properties

#### ignore

skip operations (e.g. third-party/ingested surfaces) — they don't count toward the readiness grade.

**Type:** `(uri: string, name: string) => boolean`