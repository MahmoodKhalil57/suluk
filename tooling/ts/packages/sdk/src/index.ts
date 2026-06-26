/**
 * @suluk/sdk — generate a complete, intuitive TypeScript SDK from a v4 "Suluk" contract. ofetch-based,
 * entity-grouped, fully typed, auth wired, and the v4 superpowers (declared cost + access) surfaced as typed
 * metadata on each method. A library a developer downloads and uses straight away — not a bag of functions.
 *
 *   import { generateSdk } from "@suluk/sdk";
 *   const tsSource = generateSdk(v4Document, { baseURL: "https://api.example.com" }); // a self-contained .ts file
 */
export { generateSdk, tsType, resolveOps, clientAccessor, type SdkOptions, type OpInfo } from "./generate";
/**
 * generateStores(doc) — project the C037 reactive facet (`x-suluk-store` + `x-suluk-notify`) into a typed Nano Stores
 * reactive layer (states + mutation→store invalidation + a hookable callback seam) on top of the generated client.
 *
 *   import { generateSdk, generateStores } from "@suluk/sdk";
 *   const sdk = generateSdk(doc, { baseURL });   // the typed RPC client
 *   const stores = generateStores(doc);          // the reactive layer over it (a self-contained .ts file)
 */
export { generateStores, type StoresOptions } from "./generate-stores";
