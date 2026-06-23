import { test, expect, describe } from "bun:test";
import { CloudflareClient, CloudflareError, deploy, provisionD1, putSecrets, applyMigrations, assetHash, type AssetFile } from "../src/index";

/** A routing mock fetch: returns the CF `{success,result}` envelope; records every call. */
function mockCf(routes: [RegExp, unknown | ((ctx: { body: BodyInit | null | undefined }) => unknown)][]) {
  const calls: { method: string; path: string; query: Record<string, string>; body: BodyInit | null | undefined; token?: string }[] = [];
  const fetch = (async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    const path = u.pathname.replace("/client/v4", ""); // match the logical path, not the API base prefix
    const method = init?.method ?? "GET";
    const auth = (init?.headers as Record<string, string>)?.authorization;
    calls.push({ method, path, query: Object.fromEntries(u.searchParams), body: init?.body, token: auth?.replace("Bearer ", "") });
    for (const [pat, handler] of routes) {
      if (pat.test(`${method} ${path}`)) {
        const result = typeof handler === "function" ? (handler as (c: { body: BodyInit | null | undefined }) => unknown)({ body: init?.body }) : handler;
        return new Response(JSON.stringify({ success: true, errors: [], result }), { status: 200 });
      }
    }
    return new Response(JSON.stringify({ success: false, errors: [{ code: 404, message: `no route: ${method} ${path}` }] }), { status: 404 });
  }) as unknown as typeof globalThis.fetch;
  return { fetch, calls };
}

describe("CloudflareClient", () => {
  test("unwraps the result envelope + resolves the account id", async () => {
    const { fetch } = mockCf([[/GET \/accounts$/, [{ id: "acct_1", name: "Acme" }]]]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    expect(await cf.resolveAccountId()).toBe("acct_1");
    expect(await cf.resolveAccountId()).toBe("acct_1"); // cached (no second call needed)
  });
  test("throws CloudflareError carrying the API's error codes on success:false", async () => {
    const fetch = (async () => new Response(JSON.stringify({ success: false, errors: [{ code: 10000, message: "Authentication error" }] }), { status: 403 })) as unknown as typeof globalThis.fetch;
    const cf = new CloudflareClient({ apiToken: "t", accountId: "a", fetch });
    await expect(cf.request("GET", "/x")).rejects.toThrow(CloudflareError);
    await expect(cf.request("GET", "/x")).rejects.toThrow("10000");
  });
});

describe("provisioners — idempotent create-or-get", () => {
  test("provisionD1 returns the existing DB (no create) when one matches", async () => {
    const { fetch, calls } = mockCf([[/GET .*\/d1\/database$/, [{ uuid: "db_existing", name: "saasuluk-db" }]]]);
    const cf = new CloudflareClient({ apiToken: "t", accountId: "a", fetch });
    const db = await provisionD1(cf, "saasuluk-db");
    expect(db.uuid).toBe("db_existing");
    expect(calls.some((c) => c.method === "POST" && /d1\/database$/.test(c.path))).toBe(false); // never created
  });
  test("provisionD1 creates when none matches", async () => {
    const { fetch } = mockCf([[/GET .*\/d1\/database$/, []], [/POST .*\/d1\/database$/, { uuid: "db_new", name: "saasuluk-db" }]]);
    const cf = new CloudflareClient({ apiToken: "t", accountId: "a", fetch });
    expect((await provisionD1(cf, "saasuluk-db")).uuid).toBe("db_new");
  });
  test("assetHash is a 32-char (16-byte) truncated SHA-256 — the API rejects the full 64", async () => {
    const h = await assetHash(new TextEncoder().encode("hello"));
    expect(h).toMatch(/^[0-9a-f]{32}$/);
  });

  test("applyMigrations runs only un-recorded migrations + baselines an 'already exists' error", async () => {
    const ran: string[] = [];
    const ok = (result: unknown) => new Response(JSON.stringify({ success: true, errors: [], result }), { status: 200 });
    const fetch = (async (_url: string, init?: RequestInit) => {
      const sql = JSON.parse(init!.body as string).sql as string;
      ran.push(sql);
      if (/SELECT name FROM _suluk_migrations/.test(sql)) return ok([{ results: [{ name: "0001_done.sql" }] }]);
      if (/__dup__/.test(sql)) return new Response(JSON.stringify({ success: false, errors: [{ code: 7500, message: "duplicate column name: x: SQLITE_ERROR" }] }), { status: 400 });
      return ok([{ results: [] }]);
    }) as unknown as typeof globalThis.fetch;
    const cf = new CloudflareClient({ apiToken: "t", accountId: "a", fetch });
    const newly = await applyMigrations(cf, "db", [
      { name: "0001_done.sql", sql: "SHOULD_NOT_RUN" },     // already in the ledger → skipped
      { name: "0002_new.sql", sql: "CREATE TABLE n(id)" },  // runs
      { name: "0003_dup.sql", sql: "ALTER __dup__" },       // idempotency error → baselined, not fatal
    ], () => 1700000000000);
    expect(newly).toEqual(["0002_new.sql", "0003_dup.sql"]);
    expect(ran).not.toContain("SHOULD_NOT_RUN");
  });

  test("putSecrets sets the non-empty secrets only", async () => {
    const { fetch, calls } = mockCf([[/PUT .*\/secrets$/, {}]]);
    const cf = new CloudflareClient({ apiToken: "t", accountId: "a", fetch });
    const set = await putSecrets(cf, "saasuluk", { A: "1", B: "", C: undefined, D: "4" });
    expect(set).toEqual(["A", "D"]);
    expect(calls.filter((c) => /\/secrets$/.test(c.path)).length).toBe(2);
  });
});

describe("deploy() — full orchestration in dependency order", () => {
  test("provisions D1, migrates, uploads assets, deploys the worker (correct metadata), sets secrets + crons", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/GET .*\/d1\/database$/, []],
      [/POST .*\/d1\/database$/, { uuid: "db_1", name: "saasuluk-db" }],
      [/POST .*\/d1\/database\/db_1\/query$/, [{ results: [] }]], // ledger empty → migration runs
      [/POST .*\/assets-upload-session$/, { jwt: "session_jwt", buckets: [] }], // all cached → completion = session jwt
      [/PUT .*\/workers\/scripts\/saasuluk$/, { id: "saasuluk" }],
      [/PUT .*\/workers\/scripts\/saasuluk\/secrets$/, {}],
      [/PUT .*\/workers\/scripts\/saasuluk\/schedules$/, []],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    const assets: AssetFile[] = [{ path: "/index.html", bytes: new TextEncoder().encode("<!doctype html>"), contentType: "text/html" }];
    const res = await deploy(cf, {
      scriptName: "saasuluk",
      module: "export default { fetch(){ return new Response('ok') } }",
      compatibilityDate: "2026-06-01",
      compatibilityFlags: ["nodejs_compat"],
      d1: { binding: "DB", databaseName: "saasuluk-db", migrations: [{ name: "0000_domain.sql", sql: "CREATE TABLE t (id INTEGER);" }] },
      assets,
      vars: { STRIPE_METER_EVENT_NAME: "saasuluk_cost" },
      secrets: { BETTER_AUTH_SECRET: "shh", MISSING: "" },
      crons: ["0 * * * *"],
      observability: true,
    });

    expect(res.d1).toEqual({ binding: "DB", id: "db_1" });
    expect(res.assetsUploaded).toBe(1);
    expect(res.secretsSet).toEqual(["BETTER_AUTH_SECRET"]);
    expect(res.crons).toEqual(["0 * * * *"]);

    // the worker PUT carried the right metadata (parse the multipart)
    const put = calls.find((c) => c.method === "PUT" && /\/workers\/scripts\/saasuluk$/.test(c.path))!;
    const meta = JSON.parse(await ((put.body as FormData).get("metadata") as Blob).text());
    expect(meta.main_module).toBe("worker.js");
    expect(meta.compatibility_flags).toEqual(["nodejs_compat"]);
    expect(meta.bindings).toContainEqual({ type: "d1", name: "DB", id: "db_1" });
    expect(meta.bindings).toContainEqual({ type: "plain_text", name: "STRIPE_METER_EVENT_NAME", text: "saasuluk_cost" });
    expect(meta.bindings).toContainEqual({ type: "assets", name: "ASSETS" });
    expect(meta.assets.jwt).toBe("session_jwt");
    expect(meta.keep_bindings).toContain("secret_text"); // secrets survive redeploys
    expect(meta.observability).toEqual({ enabled: true });

    // ordering: D1 provisioned + migrated BEFORE the worker deploy; secrets AFTER
    const idx = (re: RegExp) => calls.findIndex((c) => re.test(`${c.method} ${c.path}`));
    expect(idx(/POST .*\/d1\/database\/db_1\/query/)).toBeLessThan(idx(/PUT .*\/workers\/scripts\/saasuluk$/));
    expect(idx(/PUT .*\/workers\/scripts\/saasuluk$/)).toBeLessThan(idx(/\/secrets$/));
  });

  test("Durable Object agents: binds each class + an inline new_sqlite_classes migration (new_tag), reported in the result", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/weather$/, { id: "weather" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    const res = await deploy(cf, {
      scriptName: "weather",
      module: "export class WeatherAssistant {}; export default {}",
      compatibilityDate: "2026-06-22",
      compatibilityFlags: ["nodejs_compat"],
      durableObjects: [
        { binding: "WeatherAssistant", className: "WeatherAssistant" },             // same-script, sqlite default
        { binding: "Shared", className: "SharedAgent", scriptName: "other-worker" }, // cross-script: bound, NOT migrated
      ],
    });

    expect(res.durableObjects).toEqual([
      { binding: "WeatherAssistant", className: "WeatherAssistant" },
      { binding: "Shared", className: "SharedAgent" },
    ]);

    const put = calls.find((c) => c.method === "PUT" && /\/workers\/scripts\/weather$/.test(c.path))!;
    const meta = JSON.parse(await ((put.body as FormData).get("metadata") as Blob).text());
    // both DO bindings are present; the cross-script one carries script_name
    expect(meta.bindings).toContainEqual({ type: "durable_object_namespace", name: "WeatherAssistant", class_name: "WeatherAssistant" });
    expect(meta.bindings).toContainEqual({ type: "durable_object_namespace", name: "Shared", class_name: "SharedAgent", script_name: "other-worker" });
    // the inline migration uses new_tag (NOT wrangler's "tag") and creates ONLY the same-script class as SQLite-backed
    expect(meta.migrations).toEqual([{ new_tag: "v1", new_sqlite_classes: ["WeatherAssistant"] }]);
  });

  test("a DO deploy injects nodejs_compat even when the caller omits compatibilityFlags (REST path is not weaker than wrangler)", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/agent$/, { id: "agent" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    await deploy(cf, {
      scriptName: "agent",
      module: "export class A {}; export default {}",
      compatibilityDate: "2026-06-22",
      // compatibilityFlags deliberately OMITTED — the Agents SDK still needs nodejs_compat
      durableObjects: [{ binding: "A", className: "A" }],
    });
    const put = calls.find((c) => c.method === "PUT" && /\/workers\/scripts\/agent$/.test(c.path))!;
    const meta = JSON.parse(await ((put.body as FormData).get("metadata") as Blob).text());
    expect(meta.compatibility_flags).toContain("nodejs_compat");
    // DO bindings are NOT in keep_bindings → they are re-declared in full on every deploy (must not be auto-preserved)
    expect(meta.keep_bindings).not.toContain("durable_object_namespace");
  });

  test("nodejs_compat injection dedupes (a caller who already passed it gets no duplicate); a non-DO deploy is untouched", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/(agent|plain2)$/, { id: "ok" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    await deploy(cf, { scriptName: "agent", module: "m", compatibilityDate: "2026-06-22", compatibilityFlags: ["nodejs_compat"], durableObjects: [{ binding: "A", className: "A" }] });
    const meta = JSON.parse(await ((calls.find((c) => /\/workers\/scripts\/agent$/.test(c.path))!.body as FormData).get("metadata") as Blob).text());
    expect(meta.compatibility_flags).toEqual(["nodejs_compat"]); // no duplicate

    // a non-DO deploy must NOT have nodejs_compat injected (we only force it for the Agents-SDK DO case)
    await deploy(cf, { scriptName: "plain2", module: "m", compatibilityDate: "2026-06-22" });
    const meta2 = JSON.parse(await ((calls.find((c) => /\/workers\/scripts\/plain2$/.test(c.path))!.body as FormData).get("metadata") as Blob).text());
    expect(meta2.compatibility_flags).toBeUndefined();
  });

  test("DO EVOLUTION: with prevDurableObjects, the inline migration creates ONLY the added class (old_tag→new_tag delta); both stay bound", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/agent$/, { id: "agent" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    await deploy(cf, {
      scriptName: "agent", module: "m", compatibilityDate: "2026-06-22", compatibilityFlags: ["nodejs_compat"],
      prevDurableObjects: [{ binding: "A", className: "A" }],
      durableObjects: [{ binding: "A", className: "A" }, { binding: "B", className: "B" }],
      durableObjectMigration: { oldTag: "v1", newTag: "v2" },
    });
    const meta = JSON.parse(await ((calls.find((c) => /\/workers\/scripts\/agent$/.test(c.path))!.body as FormData).get("metadata") as Blob).text());
    // BOTH classes are bound (the current set); only the ADDED one is created (A already exists at v1)
    expect(meta.bindings.filter((b: { type: string }) => b.type === "durable_object_namespace").map((b: { class_name: string }) => b.class_name)).toEqual(["A", "B"]);
    expect(meta.migrations).toEqual([{ new_tag: "v2", old_tag: "v1", new_sqlite_classes: ["B"] }]);
  });

  test("DO EVOLUTION: a REMOVED class emits NO migration (nothing added) and is logged, never auto-dropped", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/agent$/, { id: "agent" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    const logs: string[] = [];
    await deploy(cf, {
      scriptName: "agent", module: "m", compatibilityDate: "2026-06-22",
      prevDurableObjects: [{ binding: "A", className: "A" }, { binding: "B", className: "B" }],
      durableObjects: [{ binding: "A", className: "A" }],
      durableObjectMigration: { oldTag: "v1", newTag: "v2" },
    }, (m) => logs.push(m));
    const meta = JSON.parse(await ((calls.find((c) => /\/workers\/scripts\/agent$/.test(c.path))!.body as FormData).get("metadata") as Blob).text());
    expect(meta.migrations).toBeUndefined();         // nothing added → no migration block (B is NOT deleted)
    expect(logs.join(" ")).toMatch(/REMOVED.*B/);     // the orphan is surfaced, not silently dropped
  });

  test("DO EVOLUTION: with prev but NO explicit tags, new_tag defaults to v2 + old_tag v1 (not a no-op re-assert of v1)", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/agent$/, { id: "agent" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    await deploy(cf, {
      scriptName: "agent", module: "m", compatibilityDate: "2026-06-22",
      prevDurableObjects: [{ binding: "A", className: "A" }],
      durableObjects: [{ binding: "A", className: "A" }, { binding: "B", className: "B" }],
      // NOTE: no durableObjectMigration — defaults must be evolution-aware
    });
    const meta = JSON.parse(await ((calls.find((c) => /\/workers\/scripts\/agent$/.test(c.path))!.body as FormData).get("metadata") as Blob).text());
    expect(meta.migrations).toEqual([{ new_tag: "v2", old_tag: "v1", new_sqlite_classes: ["B"] }]);
  });

  test("DO EVOLUTION: removing ALL classes (durableObjects: []) surfaces the orphans structurally + in the log (no silent gap)", async () => {
    const { fetch } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/agent$/, { id: "agent" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    const logs: string[] = [];
    const res = await deploy(cf, {
      scriptName: "agent", module: "m", compatibilityDate: "2026-06-22",
      prevDurableObjects: [{ binding: "A", className: "A" }, { binding: "B", className: "B" }],
      durableObjects: [],
      durableObjectMigration: { oldTag: "v1", newTag: "v2" },
    }, (m) => logs.push(m));
    expect(res.durableObjects).toEqual([]);              // nothing bound
    expect(res.durableObjectsRemoved).toEqual(["A", "B"]); // orphans surfaced as a structured return
    expect(logs.join(" ")).toMatch(/REMOVED.*A, B/);
  });

  test("DO EVOLUTION: a backend-flip (sqlite ↔ legacy) THROWS", async () => {
    const { fetch } = mockCf([[/GET \/accounts$/, [{ id: "acct_1" }]], [/PUT .*\/workers\/scripts\/agent$/, { id: "agent" }]]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    await expect(deploy(cf, {
      scriptName: "agent", module: "m", compatibilityDate: "2026-06-22",
      prevDurableObjects: [{ binding: "A", className: "A" }],
      durableObjects: [{ binding: "A", className: "A", sqlite: false }],
      durableObjectMigration: { oldTag: "v1", newTag: "v2" },
    })).rejects.toThrow(/changed storage backend/);
  });

  test("no durableObjects ⇒ no migrations key in the metadata (unchanged upload)", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/PUT .*\/workers\/scripts\/plain$/, { id: "plain" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    const res = await deploy(cf, { scriptName: "plain", module: "export default {}", compatibilityDate: "2026-06-22" });
    expect(res.durableObjects).toEqual([]);
    const put = calls.find((c) => c.method === "PUT" && /\/workers\/scripts\/plain$/.test(c.path))!;
    const meta = JSON.parse(await ((put.body as FormData).get("metadata") as Blob).text());
    expect(meta.migrations).toBeUndefined();
  });

  test("routes _headers/_redirects into assets.config and EXCLUDES them from the upload manifest", async () => {
    const { fetch, calls } = mockCf([
      [/GET \/accounts$/, [{ id: "acct_1" }]],
      [/POST .*\/assets-upload-session$/, { jwt: "session_jwt", buckets: [] }],
      [/PUT .*\/workers\/scripts\/saasuluk$/, { id: "saasuluk" }],
    ]);
    const cf = new CloudflareClient({ apiToken: "t", fetch });
    const assets: AssetFile[] = [
      { path: "/_headers", bytes: new TextEncoder().encode("/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n"), contentType: "application/octet-stream" },
      { path: "/_redirects", bytes: new TextEncoder().encode("/old /new 301\n"), contentType: "application/octet-stream" },
      { path: "/index.html", bytes: new TextEncoder().encode("<!doctype html>"), contentType: "text/html" },
    ];
    const res = await deploy(cf, { scriptName: "saasuluk", module: "m", compatibilityDate: "2026-06-01", assets, assetsConfig: { html_handling: "auto-trailing-slash" } });

    expect(res.assetsUploaded).toBe(1); // only /index.html — the two rule files are NOT uploaded

    // the upload-session manifest must contain ONLY /index.html (rule files excluded so they never serve as blobs)
    const session = calls.find((c) => /assets-upload-session$/.test(c.path))!;
    const manifest = JSON.parse(session.body as string).manifest;
    expect(Object.keys(manifest)).toEqual(["/index.html"]);

    // the worker metadata carried the raw rule-file contents in assets.config, alongside html_handling
    const put = calls.find((c) => c.method === "PUT" && /\/workers\/scripts\/saasuluk$/.test(c.path))!;
    const meta = JSON.parse(await ((put.body as FormData).get("metadata") as Blob).text());
    expect(meta.assets.config.html_handling).toBe("auto-trailing-slash");
    expect(meta.assets.config._headers).toContain("immutable");
    expect(meta.assets.config._redirects).toContain("/old /new 301");
  });
});
