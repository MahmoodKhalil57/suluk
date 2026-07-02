# Types & Enums

## generate

### `OpInfo`
`@suluk/sdk` — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract. ofetch-based,
entity-grouped, fully typed, auth wired, and the v4 superpowers (declared cost + access) surfaced as typed
metadata on each method. A library a developer downloads and uses straight away — not a bag of functions.

  import { generateSdk } from "@suluk/sdk";
  const tsSource = generateSdk(v4Document, { baseURL: "https://api.example.com" }); // a self-contained .ts file
**Properties:**
- `name: string`
- `ns: string[]`
- `member: string`
- `method: string`
- `uri: string`
- `pathParams: string[]`
- `queryRaw: unknown` (optional)
- `bodyRaw: unknown` (optional)
- `respType: string`
- `cost: number | null`
- `requires: string`
- `scope: string` (optional)
- `summary: string` (optional)
- `store: SulukStore` (optional)
- `fields: FieldDescriptor[]` (optional)
- `bid: string` (optional)
- `qid: string` (optional)
- `bodyTs: string` (optional)
- `queryTs: string` (optional)
