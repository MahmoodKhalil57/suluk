import { test, expect, describe } from "bun:test";
import { mkdtempSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cloudflareD1, cloudflareKv, cloudflareR2, cloudflareSecrets, envSink, fileStore, type InstanceState } from "../src/index";
import type { CloudflareClient } from "@suluk/cloudflare";

/**
 * C047 build #2 — the Cloudflare brokers (over a MOCK CloudflareClient: we assert each maps its provisioner onto a
 * binding output + hits the right delete), the @suluk/env sink (a temp .env), and the file-backed journal (a temp file).
 */
type Call = { method: string; path: string; opts?: { json?: unknown } };
function mockCf(): CloudflareClient & { calls: Call[] } {
  const calls: Call[] = [];
  const handler = (method: string, path: string): unknown => {
    if (method === "GET" && path.includes("/d1/database")) return [];
    if (method === "POST" && path.includes("/d1/database")) return { uuid: "db-uuid", name: "app-db" };
    if (method === "GET" && path.includes("/storage/kv/namespaces")) return [];
    if (method === "POST" && path.includes("/storage/kv/namespaces")) return { id: "kv-id", title: "sessions" };
    if (method === "GET" && path.includes("/r2/buckets")) return { buckets: [] };
    if (method === "POST" && path.includes("/r2/buckets")) return { name: "media" };
    return {};
  };
  const cf = {
    resolveAccountId: async () => "acct1",
    request: async (method: string, path: string, opts?: { json?: unknown }) => {
      calls.push({ method, path, opts });
      return handler(method, path);
    },
    calls,
  };
  return cf as unknown as CloudflareClient & { calls: Call[] };
}

describe("the Cloudflare brokers", () => {
  test("cloudflare-d1: create-or-get → database_id; deprovision deletes by id", async () => {
    const cf = mockCf();
    const broker = cloudflareD1(cf);
    expect((await broker.catalog()).services[0].id).toBe("cloudflare-d1");
    const res = await broker.provision({ ref: "db", name: "app-db", params: {} });
    expect(res).toEqual({ state: "succeeded", instanceId: "db-uuid", outputs: { database_id: "db-uuid" } });
    await broker.deprovision!({ ref: "db", name: "app-db", instanceId: "db-uuid", operation: "deprovision" });
    expect(cf.calls.at(-1)).toMatchObject({ method: "DELETE", path: "/accounts/acct1/d1/database/db-uuid" });
  });

  test("cloudflare-kv → namespace_id; cloudflare-r2 → bucket_name", async () => {
    const kv = await cloudflareKv(mockCf()).provision({ ref: "kv", name: "sessions", params: {} });
    expect(kv).toEqual({ state: "succeeded", instanceId: "kv-id", outputs: { namespace_id: "kv-id" } });
    const r2 = await cloudflareR2(mockCf()).provision({ ref: "media", name: "media", params: {} });
    expect(r2).toEqual({ state: "succeeded", instanceId: "media", outputs: { bucket_name: "media" } });
  });

  test("cloudflare-secrets: pushes the resolved secret set (skips empty), reports the names; needs a script", async () => {
    const cf = mockCf();
    const broker = cloudflareSecrets(cf);
    const res = await broker.provision({ ref: "secrets", name: "worker-secrets", params: { script: "toolfactory-api", secrets: { A: "1", B: "2", C: undefined } } });
    expect(res.outputs).toEqual({ secrets_set: "A,B" }); // C skipped (empty)
    const puts = cf.calls.filter((c) => c.method === "PUT" && c.path.includes("/secrets"));
    expect(puts.length).toBe(2);
    expect(puts[0].opts?.json).toMatchObject({ name: "A", text: "1", type: "secret_text" });
    await expect(broker.provision({ ref: "secrets", name: "s", params: { secrets: {} } })).rejects.toThrow(/needs a params.script/);
  });
});

describe("the @suluk/env sink", () => {
  test("lands each (output → env var) into a .env (plaintext here for the witness)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "prov-env-"));
    const envPath = join(dir, ".env");
    const sink = envSink({ envPath, plain: () => true });
    await sink.write(
      { database_id: "db-uuid", token: "tok-secret", unused: "x" },
      { database_id: "CLOUDFLARE_D1_ID", token: "CLOUDFLARE_D1_TOKEN" },
    );
    const content = await readFile(envPath, "utf8");
    expect(content).toContain('CLOUDFLARE_D1_ID="db-uuid"');
    expect(content).toContain('CLOUDFLARE_D1_TOKEN="tok-secret"');
    expect(content).not.toContain("unused"); // only mapped outputs are written
  });
});

describe("the file-backed journal", () => {
  test("a missing file reads as empty; save then load round-trips", async () => {
    const dir = mkdtempSync(join(tmpdir(), "prov-store-"));
    const store = fileStore(join(dir, "sub", "provision.json")); // nested → mkdir -p
    expect(await store.load()).toEqual([]);
    const state: InstanceState[] = [
      { ref: "db", service: "cloudflare-d1", name: "app-db", instanceId: "db-uuid", outputs: { database_id: "db-uuid" }, fingerprint: "fp", provisionedAt: 1 },
    ];
    await store.save(state);
    expect(await store.load()).toEqual(state);
  });
});
