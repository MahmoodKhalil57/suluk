/**
 * Upload a Workers MODULE script via the multipart `PUT /workers/scripts/{name}` endpoint: a `metadata` JSON part
 * (main_module + compatibility + bindings + assets + observability) plus the bundled ES-module part. Vars become
 * `plain_text` bindings; a static-assets JWT becomes the `assets` binding + metadata. `keep_bindings` preserves
 * existing secret bindings across redeploys, so you set secrets once and they survive.
 */
import type { CloudflareClient } from "./client";

export interface WorkerBinding {
  type: string;
  name: string;
  [k: string]: unknown;
}

/**
 * A Durable Object migration, INLINE in the script-upload metadata (NOT the D1 `Migration` in resources.ts — that
 * is SQL run against a database; this is a declarative tag that tells Workers a DO class exists and which storage
 * backend it uses). NB the wire field is `new_tag` (+ optional `old_tag`), unlike wrangler.jsonc which uses `tag`.
 * `new_sqlite_classes` is what the Agents SDK + the Workers free plan require; `new_classes` is the legacy KV backend.
 */
export interface WorkerMigration {
  /** the migration tag this upload advances to (e.g. "v1"). */
  new_tag: string;
  /** the tag the server must currently be at — optimistic concurrency; omit on the first deploy. */
  old_tag?: string;
  /** classes to create with the SQLite storage backend (Agents SDK requirement). */
  new_sqlite_classes?: string[];
  /** classes to create with the legacy key-value backend (Paid plan only). */
  new_classes?: string[];
  renamed_classes?: { from: string; to: string }[];
  deleted_classes?: string[];
}

export interface DeployWorkerOptions {
  name: string;
  /** the bundled ES-module source. */
  module: string;
  /** the module filename referenced as `main_module` (default "worker.js"). */
  mainModule?: string;
  compatibilityDate: string;
  compatibilityFlags?: string[];
  /** typed bindings (d1, kv_namespace, r2_bucket, durable_object_namespace, …). */
  bindings?: WorkerBinding[];
  /** Durable Object migrations — ride inline on THIS script upload (no separate call). Omit when there are none. */
  migrations?: WorkerMigration[];
  /** plain-text vars → `plain_text` bindings. */
  vars?: Record<string, string>;
  /** the static-assets completion JWT (from uploadAssets) + the binding name + assets config. */
  assets?: { jwt: string | null; binding?: string; config?: Record<string, unknown> };
  /** enable Workers observability (logs/traces). */
  observability?: boolean;
  /** preserve bindings of these types from the prior version (default keeps secrets across deploys). */
  keepBindings?: string[];
}

export async function deployWorker(cf: CloudflareClient, opts: DeployWorkerOptions): Promise<{ id?: string }> {
  const acct = await cf.resolveAccountId();
  const main = opts.mainModule ?? "worker.js";

  const bindings: WorkerBinding[] = [...(opts.bindings ?? [])];
  for (const [name, text] of Object.entries(opts.vars ?? {})) bindings.push({ type: "plain_text", name, text });
  if (opts.assets?.jwt) bindings.push({ type: "assets", name: opts.assets.binding ?? "ASSETS" });

  const metadata: Record<string, unknown> = {
    main_module: main,
    compatibility_date: opts.compatibilityDate,
    ...(opts.compatibilityFlags?.length ? { compatibility_flags: opts.compatibilityFlags } : {}),
    bindings,
    // DO migrations ride inline here — omitted entirely when absent (an empty migrations block can reset DO state).
    ...(opts.migrations?.length ? { migrations: opts.migrations } : {}),
    keep_bindings: opts.keepBindings ?? ["secret_text", "secret_key"],
    ...(opts.assets?.jwt ? { assets: { jwt: opts.assets.jwt, ...(opts.assets.config ? { config: opts.assets.config } : {}) } } : {}),
    ...(opts.observability !== undefined ? { observability: { enabled: opts.observability } } : {}),
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append(main, new Blob([opts.module], { type: "application/javascript+module" }), main);

  return cf.request<{ id?: string }>("PUT", `/accounts/${acct}/workers/scripts/${opts.name}`, { body: form });
}

/** Set the cron triggers for a script (separate endpoint — metadata doesn't carry them). */
export async function putCronTriggers(cf: CloudflareClient, scriptName: string, crons: string[]): Promise<void> {
  const acct = await cf.resolveAccountId();
  await cf.request("PUT", `/accounts/${acct}/workers/scripts/${scriptName}/schedules`, { json: crons.map((cron) => ({ cron })) });
}
