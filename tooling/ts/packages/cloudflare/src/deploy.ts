/**
 * The one-call deploy — provision → migrate → upload assets → deploy worker → push secrets → set cron, in the order
 * that makes each step's output feed the next (D1 id + assets JWT become worker bindings; secrets are set AFTER the
 * script exists and preserved on redeploy via keep_bindings). Pure over an injected CloudflareClient + a resolved
 * PLAN (bytes, not paths), so it's fully unit-testable; a thin disk-reading wrapper lives in the app's deploy script.
 */
import { CloudflareClient, type CloudflareClientOptions } from "./client";
import { provisionD1, provisionKvNamespace, provisionR2Bucket, applyMigrations, putSecrets, type Migration } from "./resources";
import { uploadAssets, extractAssetRuleFiles, type AssetFile } from "./assets";
import { deployWorker, putCronTriggers, type WorkerBinding, type WorkerMigration } from "./worker";

/** A Durable Object class to bind + (for same-script classes) create via an inline script migration. Mirrors
 *  @suluk/deploy's `DurableObjectBinding` so the CLI plan and the no-wrangler REST deploy describe DO agents alike. */
export interface DurableObjectBinding {
  /** the binding name exposed as `env.<binding>`. */
  binding: string;
  /** the exported Agent/DO class name. */
  className: string;
  /** SQLite-backed storage — REQUIRED by the Agents SDK + the free plan. Default true ⇒ `new_sqlite_classes`. */
  sqlite?: boolean;
  /** cross-script DO: the script that DEFINES the class. Omit for a same-script class (the only kind we migrate). */
  scriptName?: string;
}

const ownedDOs = (dos: DurableObjectBinding[]) => dos.filter((d) => !d.scriptName);
const isSqlite = (d: DurableObjectBinding) => d.sqlite !== false;

/** Diff prev→next same-script DO classes by className: ADDED (create), REMOVED (flag — never DROP), BACKEND-FLIPPED (illegal). */
function diffDurableObjects(prev: DurableObjectBinding[], next: DurableObjectBinding[]): { added: DurableObjectBinding[]; removed: string[]; flipped: string[] } {
  const prevByName = new Map(ownedDOs(prev).map((d) => [d.className, d]));
  const nextOwned = ownedDOs(next);
  const nextNames = new Set(nextOwned.map((d) => d.className));
  return {
    added: nextOwned.filter((d) => !prevByName.has(d.className)),
    removed: ownedDOs(prev).filter((d) => !nextNames.has(d.className)).map((d) => d.className),
    flipped: nextOwned.filter((d) => prevByName.has(d.className) && isSqlite(prevByName.get(d.className)!) !== isSqlite(d)).map((d) => d.className),
  };
}

/**
 * Build the inline script-migration for the same-script DO classes (cross-script ones are migrated by their owning
 * script). Uses the API field `new_tag` (NOT wrangler's `tag`). FIRST deploy (no `prev`): create the current set.
 * EVOLUTION (`prev` given): create ONLY the added classes (an `old_tag`→`new_tag` delta) — a backend-flip THROWS, a
 * removed class is left to the caller to flag (never an auto `deleted_classes`, which would drop its state). Returns
 * `{ migration?, removed[] }`; `migration` is undefined when there is nothing new to create.
 */
function durableObjectMigration(next: DurableObjectBinding[], newTag: string, oldTag?: string, prev?: DurableObjectBinding[]): { migration?: WorkerMigration; removed: string[] } {
  const create = prev?.length ? (() => {
    const { added, flipped, removed } = diffDurableObjects(prev, next);
    if (flipped.length) throw new Error(`@suluk/cloudflare: Durable Object class(es) ${flipped.join(", ")} changed storage backend (sqlite↔legacy) between deploys — Cloudflare cannot re-back an existing class; keep the backend or rename the class`);
    return { classes: added, removed };
  })() : { classes: ownedDOs(next), removed: [] as string[] };

  const new_sqlite_classes = create.classes.filter(isSqlite).map((d) => d.className);
  const new_classes = create.classes.filter((d) => !isSqlite(d)).map((d) => d.className);
  if (!new_sqlite_classes.length && !new_classes.length) return { removed: create.removed };
  return {
    migration: {
      new_tag: newTag,
      ...(oldTag ? { old_tag: oldTag } : {}),
      ...(new_sqlite_classes.length ? { new_sqlite_classes } : {}),
      ...(new_classes.length ? { new_classes } : {}),
    },
    removed: create.removed,
  };
}

export interface DeployPlan {
  scriptName: string;
  /** the bundled worker ES module. */
  module: string;
  mainModule?: string;
  compatibilityDate: string;
  compatibilityFlags?: string[];
  /** provision + bind a D1 database, applying each migration once (ledger-tracked, baseline-safe). */
  d1?: { binding: string; databaseName: string; migrations?: Migration[] };
  /** provision + bind KV namespaces (binding → title). */
  kv?: { binding: string; title: string }[];
  /** provision + bind R2 buckets (binding → bucketName). */
  r2?: { binding: string; bucketName: string }[];
  /** bind Durable Object agents (Cloudflare Agents SDK runtime) + create same-script classes via an inline migration. */
  durableObjects?: DurableObjectBinding[];
  /** the previously-deployed DO class set. When given, the inline migration creates ONLY the classes added since (a true
   *  `old_tag`→`new_tag` delta); a removed class is logged (never auto-dropped), a backend-flip throws. Omit on first deploy. */
  prevDurableObjects?: DurableObjectBinding[];
  /** the DO migration tags — `newTag` defaults to "v1"; pass `oldTag` on a redeploy that ADDS classes (optimistic concurrency). */
  durableObjectMigration?: { newTag?: string; oldTag?: string };
  /** static assets to serve (uploaded; bound as ASSETS by default). */
  assets?: AssetFile[];
  assetsBinding?: string;
  assetsConfig?: Record<string, unknown>;
  /** plain-text vars. */
  vars?: Record<string, string>;
  /** encrypted secrets (empty values skipped). */
  secrets?: Record<string, string | undefined>;
  /** cron triggers. */
  crons?: string[];
  observability?: boolean;
}

export interface DeployResult {
  accountId: string;
  scriptName: string;
  d1?: { binding: string; id: string };
  kv: { binding: string; id: string }[];
  r2: { binding: string; name: string }[];
  durableObjects: { binding: string; className: string }[];
  /** DO classes present in `prevDurableObjects` but gone from this deploy — orphaned (NOT dropped); a manual decision to delete. */
  durableObjectsRemoved: string[];
  assetsUploaded: number;
  secretsSet: string[];
  crons: string[];
}

export type DeployLog = (msg: string) => void;

/** Orchestrate a full deploy over a client + plan. `log` narrates each step. */
export async function deploy(cf: CloudflareClient, plan: DeployPlan, log: DeployLog = () => {}): Promise<DeployResult> {
  const accountId = await cf.resolveAccountId();
  log(`account ${accountId} · script "${plan.scriptName}"`);
  const bindings: WorkerBinding[] = [];

  let d1: DeployResult["d1"];
  if (plan.d1) {
    const db = await provisionD1(cf, plan.d1.databaseName);
    log(`D1 "${plan.d1.databaseName}" → ${db.uuid}`);
    bindings.push({ type: "d1", name: plan.d1.binding, id: db.uuid });
    d1 = { binding: plan.d1.binding, id: db.uuid };
    if (plan.d1.migrations?.length) {
      const newly = await applyMigrations(cf, db.uuid, plan.d1.migrations);
      log(newly.length ? `  migrations applied/baselined: ${newly.join(", ")}` : `  migrations: all up to date`);
    }
  }

  const kv: DeployResult["kv"] = [];
  for (const k of plan.kv ?? []) { const ns = await provisionKvNamespace(cf, k.title); bindings.push({ type: "kv_namespace", name: k.binding, namespace_id: ns.id }); kv.push({ binding: k.binding, id: ns.id }); log(`KV "${k.title}" → ${ns.id}`); }

  const r2: DeployResult["r2"] = [];
  for (const b of plan.r2 ?? []) { const bk = await provisionR2Bucket(cf, b.bucketName); bindings.push({ type: "r2_bucket", name: b.binding, bucket_name: bk.name }); r2.push({ binding: b.binding, name: bk.name }); log(`R2 "${bk.name}" bound`); }

  // Durable Object agents (Cloudflare Agents SDK runtime). A DO needs no provision call — the class is defined in the
  // uploaded module; we only (a) bind it and (b) create same-script classes via the inline script migration below.
  const durableObjects: DeployResult["durableObjects"] = [];
  let migrations: WorkerMigration[] | undefined;
  let durableObjectsRemoved: string[] = [];
  // run when there are DOs to deploy OR we are EVOLVING (so an all-removed deploy still surfaces the orphaned classes).
  const evolvingDO = !!plan.prevDurableObjects?.length;
  if (plan.durableObjects?.length || evolvingDO) {
    for (const d of plan.durableObjects ?? []) {
      bindings.push({ type: "durable_object_namespace", name: d.binding, class_name: d.className, ...(d.scriptName ? { script_name: d.scriptName } : {}) });
      durableObjects.push({ binding: d.binding, className: d.className });
    }
    // evolution-aware tag defaults — mirror the wrangler path: bump new_tag to v2 + carry old_tag v1 (optimistic
    // concurrency) so the delta targets a NEW tag, not the one prev was created under (a no-op/invalid re-assert).
    const newTag = plan.durableObjectMigration?.newTag ?? (evolvingDO ? "v2" : "v1");
    const oldTag = plan.durableObjectMigration?.oldTag ?? (evolvingDO ? "v1" : undefined);
    const { migration: mig, removed } = durableObjectMigration(plan.durableObjects ?? [], newTag, oldTag, plan.prevDurableObjects);
    durableObjectsRemoved = removed;
    if (mig) { migrations = [mig]; log(`durable objects: ${(mig.new_sqlite_classes ?? []).concat(mig.new_classes ?? []).join(", ")} (migration ${mig.new_tag}${mig.old_tag ? ` from ${mig.old_tag}` : ""})`); }
    if (removed.length) log(`  durable objects REMOVED (not dropped — state orphaned): ${removed.join(", ")}`);
  }

  let assetsJwt: string | null = null;
  let assetsConfig = plan.assetsConfig;
  let assetsUploaded = 0;
  if (plan.assets?.length) {
    // `_headers`/`_redirects` are NOT uploaded as files — their raw text rides in assets.config and Cloudflare parses
    // them server-side into header/redirect rules (the asset runtime then applies them). Excluding them from the
    // manifest is load-bearing: an uploaded /_headers would serve as a public 200 blob AND never activate as rules.
    const { assets, _headers, _redirects } = extractAssetRuleFiles(plan.assets);
    if (_headers != null || _redirects != null) {
      assetsConfig = { ...assetsConfig, ...(_headers != null ? { _headers } : {}), ...(_redirects != null ? { _redirects } : {}) };
    }
    assetsUploaded = assets.length;
    if (assets.length) {
      assetsJwt = await uploadAssets(cf, plan.scriptName, assets);
      const rules = [_headers != null ? "_headers" : "", _redirects != null ? "_redirects" : ""].filter(Boolean).join("+");
      log(`assets: ${assets.length} files uploaded${rules ? ` (${rules} → config rules)` : ""}`);
    }
  }

  // Agents-SDK Durable Objects REQUIRE `nodejs_compat`. The wrangler path hardcodes it; the REST path must not ship a
  // weaker worker, so dedupe-inject it whenever this deploy carries DOs (a caller that forgot it still gets a working agent).
  const compatibilityFlags = plan.durableObjects?.length
    ? Array.from(new Set([...(plan.compatibilityFlags ?? []), "nodejs_compat"]))
    : plan.compatibilityFlags;

  await deployWorker(cf, {
    name: plan.scriptName, module: plan.module, mainModule: plan.mainModule,
    compatibilityDate: plan.compatibilityDate, compatibilityFlags,
    bindings, migrations, vars: plan.vars,
    assets: { jwt: assetsJwt, binding: plan.assetsBinding, config: assetsConfig },
    observability: plan.observability,
  });
  log(`worker "${plan.scriptName}" deployed`);

  const secretsSet = plan.secrets ? await putSecrets(cf, plan.scriptName, plan.secrets) : [];
  if (secretsSet.length) log(`secrets set: ${secretsSet.join(", ")}`);

  if (plan.crons?.length) { await putCronTriggers(cf, plan.scriptName, plan.crons); log(`crons: ${plan.crons.join(" · ")}`); }

  return { accountId, scriptName: plan.scriptName, d1, kv, r2, durableObjects, durableObjectsRemoved, assetsUploaded, secretsSet, crons: plan.crons ?? [] };
}

/** Convenience: build a client from token/account options and run a deploy. */
export async function deployWith(opts: CloudflareClientOptions, plan: DeployPlan, log?: DeployLog): Promise<DeployResult> {
  return deploy(new CloudflareClient(opts), plan, log);
}
