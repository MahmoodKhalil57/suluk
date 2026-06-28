import { test, expect, describe, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { localD1, remoteD1, resolveBackend } from "../src/hatch/backends";
import { stateHatch } from "../src/hatch/state";
import { CloudflareClient } from "@suluk/cloudflare";
import type { D1Exec, HatchUse } from "../src/hatch/types";

const WHY: HatchUse = { kind: "state", because: "OAuth-only signup; no API seeds a verified user", userPathChecked: true };

/** A CloudflareClient whose injected fetch records D1 /query bodies and returns canned envelopes (no network). */
function mockRemote() {
  const bodies: { sql: string; params?: unknown[] }[] = [];
  const fetchImpl = (async (_url: unknown, init: { body?: string }) => {
    if (init.body) bodies.push(JSON.parse(init.body));
    return { ok: true, status: 200, statusText: "OK", text: async () => JSON.stringify({ success: true, result: [{ results: [], success: true }] }) } as unknown as Response;
  }) as unknown as typeof fetch;
  const cf = new CloudflareClient({ apiToken: "t", accountId: "acct", fetch: fetchImpl });
  return { d1: remoteD1(cf, "db"), bodies };
}

describe("backends — local (bun:sqlite) is completely local; remote needs an explicit acknowledgement", () => {
  test("resolveBackend(local) opens the sqlite file; no remote needed", async () => {
    const b = await resolveBackend({ mode: "local", d1Path: ":memory:" });
    expect(b.kind).toBe("local");
    b.close?.();
  });

  test("resolveBackend(remote) THROWS without acknowledgeRealDeployment (it is the real deployment)", async () => {
    await expect(resolveBackend({ mode: "remote", cf: {} as never, d1DatabaseId: "db" } as never)).rejects.toThrow(/acknowledgeRealDeployment/);
  });
});

describe("stateHatch over LOCAL (the completely-local path, fully exercised)", () => {
  let d1: D1Exec;
  beforeEach(async () => {
    d1 = await localD1(":memory:");
    await d1.run("CREATE TABLE credits (id TEXT, userId TEXT, balance INTEGER)");
  });

  test("read-only by default — write methods are absent", () => {
    const h = stateHatch(d1);
    expect(typeof h.d1.select).toBe("function");
    expect((h.d1 as unknown as Record<string, unknown>).seed).toBeUndefined();
    expect((h.d1 as unknown as Record<string, unknown>).exec).toBeUndefined();
  });

  test("seed FORCES the owner column to the test-user id, then select reads it back (real round-trip)", async () => {
    const h = stateHatch(d1, { write: true, scope: { value: "testuser_1" } });
    // even if the caller passes a different userId, seed overwrites it to the scope value:
    await h.d1.seed("credits", "userId", [{ id: "c1", userId: "SOMEONE_ELSE", balance: 5 }], WHY);
    const rows = await h.d1.select("SELECT id, userId, balance FROM credits");
    expect(rows).toEqual([{ id: "c1", userId: "testuser_1", balance: 5 }]);
  });

  test("cleanupScope deletes ONLY the test user's rows", async () => {
    const h = stateHatch(d1, { write: true, scope: { value: "testuser_1" } });
    await h.d1.seed("credits", "userId", [{ id: "c1", balance: 5 }], WHY);
    await d1.run("INSERT INTO credits (id, userId, balance) VALUES (?,?,?)", ["c2", "REAL_USER", 99]); // a 'real' row
    await h.d1.cleanupScope([{ table: "credits", column: "userId" }]);
    const left = await h.d1.select("SELECT userId FROM credits");
    expect(left).toEqual([{ userId: "REAL_USER" }]); // the real user's row is untouched
  });

  test("raw exec IS available on local (throwaway sqlite, full capability)", async () => {
    const h = stateHatch(d1, { write: true, scope: { value: "t" } });
    await h.d1.exec("DELETE FROM credits"); // allowed locally
    expect(await h.d1.select("SELECT * FROM credits")).toEqual([]);
  });

  test("seed requires a `because`, validates identifiers, and a scoped write needs a scope", async () => {
    const h = stateHatch(d1, { write: true, scope: { value: "t" } });
    await expect(h.d1.seed("credits", "userId", [{ id: "x" }], { kind: "state", because: "", userPathChecked: true })).rejects.toThrow(/because/);
    await expect(h.d1.seed("credits; DROP TABLE credits", "userId", [{ id: "x" }], WHY)).rejects.toThrow(/identifier/);
    const noScope = stateHatch(d1, { write: true });
    await expect(noScope.d1.cleanupScope([{ table: "credits", column: "userId" }])).rejects.toThrow(/scope/);
  });
});

describe("stateHatch over REMOTE (the real deployment) — writes are bound to params and refuse unscoped exec", () => {
  test("seed sends a parameterized INSERT with the owner forced to the test user", async () => {
    const { d1, bodies } = mockRemote();
    const h = stateHatch(d1, { write: true, scope: { value: "testuser_1" } });
    await h.d1.seed("user", "id", [{ id: "ignored", email: "bdd@example.test" }], WHY);
    expect(bodies[0].sql).toContain("INSERT INTO user");
    expect(bodies[0].params).toEqual(["testuser_1", "bdd@example.test"]); // id forced to the scope value; values bound
  });

  test("raw exec is REFUSED on the real deployment (unscoped write to live data)", async () => {
    const { d1 } = mockRemote();
    const h = stateHatch(d1, { write: true, scope: { value: "t" } });
    await expect(h.d1.exec("DELETE FROM user")).rejects.toThrow(/refused on the REAL deployment/);
  });
});
