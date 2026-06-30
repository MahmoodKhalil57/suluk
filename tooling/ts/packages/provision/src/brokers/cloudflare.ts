/**
 * The Cloudflare brokers (C047) — D1, KV, R2, and Worker secrets, each an OSB {@link Broker} that WRAPS @suluk/cloudflare's
 * already-witnessed idempotent provisioners. The broker is thin on purpose: it advertises a catalog, maps a provision
 * request onto the provisioner, and surfaces the resource id as a binding output (a D1 `database_id`, a KV `namespace_id`,
 * an R2 `bucket_name`) for the binding chain. The provider calls all live in @suluk/cloudflare; these never re-implement
 * them. Construct each with a configured `CloudflareClient` (the credentials seam).
 */
import type { CloudflareClient } from "@suluk/cloudflare";
import { provisionD1, provisionKvNamespace, provisionR2Bucket, applyMigrations, putSecrets, type Migration } from "@suluk/cloudflare";
import type { Broker, Catalog, OperationState } from "../types";

const onePlan = (id: string, name: string, description: string, bindable: boolean): Catalog => ({
  services: [{ id, name, description, bindable, plans: [{ id: "standard", name: "Standard", free: true }] }],
});

/** Best-effort delete via the Cloudflare REST API; maps to an OSB sync deprovision. */
async function del(cf: CloudflareClient, path: string): Promise<{ state: OperationState }> {
  const acct = await cf.resolveAccountId();
  await cf.request("DELETE", `/accounts/${acct}${path}`);
  return { state: "succeeded" };
}

/** D1 database. Provision is create-or-get; when `params.migrations` (a `Migration[]`) is present they're applied through
 *  the @suluk/cloudflare ledger (each runs at most once). Output: `database_id`. */
export function cloudflareD1(cf: CloudflareClient): Broker {
  return {
    catalog: () => onePlan("cloudflare-d1", "Cloudflare D1", "A serverless SQLite database", false),
    async provision(req) {
      const db = await provisionD1(cf, req.name);
      const migrations = req.params.migrations as Migration[] | undefined;
      if (migrations?.length) await applyMigrations(cf, db.uuid, migrations);
      return { state: "succeeded", instanceId: db.uuid, outputs: { database_id: db.uuid } };
    },
    deprovision: (req) => del(cf, `/d1/database/${req.instanceId}`),
  };
}

/** Workers KV namespace. Provision is create-or-get. Output: `namespace_id`. */
export function cloudflareKv(cf: CloudflareClient): Broker {
  return {
    catalog: () => onePlan("cloudflare-kv", "Cloudflare KV", "A Workers KV namespace", false),
    async provision(req) {
      const ns = await provisionKvNamespace(cf, req.name);
      return { state: "succeeded", instanceId: ns.id, outputs: { namespace_id: ns.id } };
    },
    deprovision: (req) => del(cf, `/storage/kv/namespaces/${req.instanceId}`),
  };
}

/** R2 bucket. Provision is create-or-get. Output: `bucket_name` (R2's id IS its name). */
export function cloudflareR2(cf: CloudflareClient): Broker {
  return {
    catalog: () => onePlan("cloudflare-r2", "Cloudflare R2", "An R2 object-storage bucket", false),
    async provision(req) {
      const bucket = await provisionR2Bucket(cf, req.name);
      return { state: "succeeded", instanceId: bucket.name, outputs: { bucket_name: bucket.name } };
    },
    deprovision: (req) => del(cf, `/r2/buckets/${req.instanceId}`),
  };
}

/** Worker secrets — the runtime-secret SINK as a broker (this is `sync-secrets.ts`). `params.script` is the Worker name;
 *  `params.secrets` is a `Record<string,string>` of secret name → value (resolved from upstream `@ref.key` bindings).
 *  Provision is an idempotent `wrangler secret put` for the whole set. Output: `secrets_set` (the names pushed). */
export function cloudflareSecrets(cf: CloudflareClient): Broker {
  return {
    catalog: () => onePlan("cloudflare-secrets", "Cloudflare Worker Secrets", "Encrypted Worker runtime secrets", false),
    async provision(req) {
      const script = req.params.script as string | undefined;
      const secrets = (req.params.secrets ?? {}) as Record<string, string | undefined>;
      if (!script) throw new Error(`provision: cloudflare-secrets ${req.ref} needs a params.script (the Worker name)`);
      const set = await putSecrets(cf, script, secrets);
      return { state: "succeeded", instanceId: `${script}:secrets`, outputs: { secrets_set: set.join(",") } };
    },
  };
}
