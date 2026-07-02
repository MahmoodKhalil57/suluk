/**
 * Idempotent resource provisioners — create-OR-get, so `deploy` can run repeatedly without "already exists" errors.
 * Each resolves the account id off the client and uses the Cloudflare API's list-then-create pattern.
 */
import type { CloudflareClient } from "./client";

export interface D1Database {
  uuid: string;
  name: string;
}

/** Create-or-get a D1 database by name. */
export async function provisionD1(cf: CloudflareClient, name: string): Promise<D1Database> {
  const acct = await cf.resolveAccountId();
  const existing = await cf.request<D1Database[]>("GET", `/accounts/${acct}/d1/database`, { query: { name } });
  const hit = (existing ?? []).find((d) => d.name === name);
  if (hit) return hit;
  return cf.request<D1Database>("POST", `/accounts/${acct}/d1/database`, { json: { name } });
}

/** Run SQL against a D1 database (D1 accepts multiple `;`-separated statements per call). `params` are bound via the
 *  D1 /query `params` array — ALWAYS pass values as params (never string-interpolate user/test data into `sql`). */
export async function queryD1(cf: CloudflareClient, databaseId: string, sql: string, params?: unknown[]): Promise<unknown> {
  const acct = await cf.resolveAccountId();
  return cf.request("POST", `/accounts/${acct}/d1/database/${databaseId}/query`, { json: params && params.length ? { sql, params } : { sql } });
}

/** Rows from a D1 query response — the API returns `[{ results, success, meta }]` (one per statement); take the last. */
export function d1Rows(result: unknown): Record<string, unknown>[] {
  const arr = Array.isArray(result) ? (result as { results?: Record<string, unknown>[] }[]) : [];
  return arr[arr.length - 1]?.results ?? [];
}

// ---- KV data-plane verbs (siblings of provisionKvNamespace) — used by the @suluk/journeys state hatch. ----
const kvBase = (acct: string, ns: string) => `/accounts/${acct}/storage/kv/namespaces/${ns}`;

/** Read a KV value (raw); null when the key is absent. */
export async function kvGet(cf: CloudflareClient, namespaceId: string, key: string): Promise<string | null> {
  const acct = await cf.resolveAccountId();
  return cf.requestText("GET", `${kvBase(acct, namespaceId)}/values/${encodeURIComponent(key)}`);
}

/** Write a KV value (optional TTL in seconds). */
export async function kvPut(cf: CloudflareClient, namespaceId: string, key: string, value: string, opts: { expirationTtl?: number } = {}): Promise<void> {
  const acct = await cf.resolveAccountId();
  await cf.request("PUT", `${kvBase(acct, namespaceId)}/values/${encodeURIComponent(key)}`, { body: value, query: { expiration_ttl: opts.expirationTtl } });
}

/** Delete a KV key. */
export async function kvDelete(cf: CloudflareClient, namespaceId: string, key: string): Promise<void> {
  const acct = await cf.resolveAccountId();
  await cf.request("DELETE", `${kvBase(acct, namespaceId)}/values/${encodeURIComponent(key)}`);
}

/** List KV keys (optionally by prefix) — returns the key names. */
export async function kvList(cf: CloudflareClient, namespaceId: string, prefix?: string): Promise<string[]> {
  const acct = await cf.resolveAccountId();
  const keys = await cf.request<{ name: string }[]>("GET", `${kvBase(acct, namespaceId)}/keys`, { query: { prefix, limit: 1000 } });
  return (keys ?? []).map((k) => k.name);
}

// ---- Zone-scoped: the www → apex 301 redirect (C058). First zone-scoped capability; the client is generic. The token
//      needs Zone:Read + Zone WAF/Dynamic-Redirect:Edit. ----

/** Resolve a zone id from its apex host (e.g. `example.com`). Throws when the token can't see the zone. */
export async function resolveZoneId(cf: CloudflareClient, apexHost: string): Promise<string> {
  const zones = await cf.request<{ id: string; name: string }[]>("GET", "/zones", { query: { name: apexHost } });
  const z = (zones ?? [])[0];
  if (!z) throw new Error(`@suluk/cloudflare: no zone for "${apexHost}" (token needs Zone:Read + Dynamic Redirect:Edit)`);
  return z.id;
}

const WWW_REDIRECT_PHASE = "http_request_dynamic_redirect";
const wwwRuleDesc = (apexHost: string) => `suluk: www.${apexHost} → ${apexHost} (301)`;

/** The entrypoint ruleset's existing rules for the dynamic-redirect phase (null when the zone has no ruleset yet). */
async function redirectRules(cf: CloudflareClient, zoneId: string): Promise<{ description?: string }[] | null> {
  try {
    const rs = await cf.request<{ rules?: { description?: string }[] }>("GET", `/zones/${zoneId}/rulesets/phases/${WWW_REDIRECT_PHASE}/entrypoint`);
    return rs?.rules ?? [];
  } catch {
    return null; // 404 — no dynamic-redirect ruleset on this zone yet
  }
}

/** Ensure a www→apex 301 redirect (path + query preserved) on the zone. Idempotent (dedup by rule description). */
export async function ensureWwwRedirect(cf: CloudflareClient, zoneId: string, apexHost: string): Promise<{ added: boolean }> {
  const desc = wwwRuleDesc(apexHost);
  const rule = {
    action: "redirect",
    action_parameters: { from_value: { status_code: 301, target_url: { expression: `concat("https://${apexHost}", http.request.uri.path)` }, preserve_query_string: true } },
    expression: `(http.host eq "www.${apexHost}")`,
    description: desc,
    enabled: true,
  };
  const rules = (await redirectRules(cf, zoneId)) ?? [];
  if (rules.some((r) => r.description === desc)) return { added: false }; // already present
  await cf.request("PUT", `/zones/${zoneId}/rulesets/phases/${WWW_REDIRECT_PHASE}/entrypoint`, { json: { rules: [...rules, rule] } });
  return { added: true };
}

/** Remove the suluk www→apex redirect rule from the zone (leaves any other redirect rules intact). */
export async function removeWwwRedirect(cf: CloudflareClient, zoneId: string, apexHost: string): Promise<void> {
  const desc = wwwRuleDesc(apexHost);
  const rules = await redirectRules(cf, zoneId);
  if (!rules) return;
  await cf.request("PUT", `/zones/${zoneId}/rulesets/phases/${WWW_REDIRECT_PHASE}/entrypoint`, { json: { rules: rules.filter((r) => r.description !== desc) } });
}

export interface Migration {
  /** a stable identifier (e.g. the file name) — recorded in the ledger so it runs at most once. */
  name: string;
  sql: string;
}

/** SQLite "the schema is already there" errors — benign when baselining a DB migrated before the ledger existed. */
const IDEMPOTENT_ERR = /duplicate column|already exists|duplicate table/i;

/**
 * Apply D1 migrations with a LEDGER (`_suluk_migrations`) so each runs exactly once — the missing piece that makes a
 * redeploy safe. A migration not yet in the ledger is run and recorded; if it fails because the schema is ALREADY
 * present (a DB migrated by raw execute before tracking existed), that idempotency error is swallowed and the
 * migration is baselined (recorded), not fatal. Any other SQL error aborts. Returns the names newly recorded.
 */
export async function applyMigrations(cf: CloudflareClient, databaseId: string, migrations: Migration[], now: () => number = () => Date.now()): Promise<string[]> {
  const acct = await cf.resolveAccountId();
  const run = (sql: string) => cf.request<unknown>("POST", `/accounts/${acct}/d1/database/${databaseId}/query`, { json: { sql } });
  await run("CREATE TABLE IF NOT EXISTS _suluk_migrations (name TEXT PRIMARY KEY, applied_at INTEGER)");
  const applied = new Set(d1Rows(await run("SELECT name FROM _suluk_migrations")).map((r) => String(r.name)));
  const newly: string[] = [];
  for (const m of migrations) {
    if (applied.has(m.name)) continue;
    try {
      await run(m.sql);
    } catch (e) {
      if (!IDEMPOTENT_ERR.test((e as Error).message)) throw e; // a real error — surface it
      // else: schema already present (pre-ledger) → baseline below, don't abort
    }
    await run(`INSERT OR IGNORE INTO _suluk_migrations (name, applied_at) VALUES ('${m.name.replace(/'/g, "''")}', ${now()})`);
    newly.push(m.name);
  }
  return newly;
}

export interface KvNamespace {
  id: string;
  title: string;
}

/** Create-or-get a Workers KV namespace by title (e.g. a sessions or rate-limit store). */
export async function provisionKvNamespace(cf: CloudflareClient, title: string): Promise<KvNamespace> {
  const acct = await cf.resolveAccountId();
  const list = await cf.request<KvNamespace[]>("GET", `/accounts/${acct}/storage/kv/namespaces`, { query: { per_page: 100 } });
  const hit = (list ?? []).find((n) => n.title === title);
  if (hit) return hit;
  return cf.request<KvNamespace>("POST", `/accounts/${acct}/storage/kv/namespaces`, { json: { title } });
}

/** Create-or-get an R2 bucket by name (e.g. media/upload storage). */
export async function provisionR2Bucket(cf: CloudflareClient, name: string): Promise<{ name: string }> {
  const acct = await cf.resolveAccountId();
  const res = await cf.request<{ buckets?: { name: string }[] }>("GET", `/accounts/${acct}/r2/buckets`);
  const hit = (res?.buckets ?? []).find((b) => b.name === name);
  if (hit) return hit;
  return cf.request<{ name: string }>("POST", `/accounts/${acct}/r2/buckets`, { json: { name } });
}

/** Set ONE Worker secret (an encrypted `secret_text` binding). The script must already exist. */
export async function putSecret(cf: CloudflareClient, scriptName: string, name: string, value: string): Promise<void> {
  const acct = await cf.resolveAccountId();
  await cf.request("PUT", `/accounts/${acct}/workers/scripts/${scriptName}/secrets`, { json: { name, text: value, type: "secret_text" } });
}

/** Set many secrets, skipping empty/undefined values; returns the names actually set. */
export async function putSecrets(cf: CloudflareClient, scriptName: string, secrets: Record<string, string | undefined>): Promise<string[]> {
  const set: string[] = [];
  for (const [name, value] of Object.entries(secrets)) {
    if (value) { await putSecret(cf, scriptName, name, value); set.push(name); }
  }
  return set;
}
