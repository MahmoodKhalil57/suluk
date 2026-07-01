import { test, expect, describe } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  diffSnapshots, generate, migrate, EMPTY_SNAPSHOT,
  memoryMigrationStore, fileMigrationStore, memoryStore, memorySink, runCli, defineProvisionApp,
  type Broker, type InstanceSpec,
} from "../src/index";

/**
 * C047 build #6 — the snapshot + migration model (repeatable, documentable steps like drizzle-kit). `generate` records a
 * migration + snapshot from the config delta; `migrate` replays PENDING migrations in order via the engine.
 */
const DB: InstanceSpec = { ref: "db", service: "d1", name: "app-db" };
const KV: InstanceSpec = { ref: "kv", service: "kv", name: "sessions", params: { db: "@db.database_id" } }; // depends on db

function mkBroker(id: string): Broker & { provisioned: string[]; deprovisioned: string[] } {
  const provisioned: string[] = [];
  const deprovisioned: string[] = [];
  return {
    provisioned,
    deprovisioned,
    catalog: () => ({ services: [{ id, name: id, description: id, bindable: false, plans: [{ id: "standard", name: "S" }] }] }),
    async provision(req) {
      provisioned.push(req.ref);
      return { state: "succeeded", instanceId: `${id}:${req.name}`, outputs: { database_id: `${req.name}-uuid` } };
    },
    async deprovision(req) {
      deprovisioned.push(req.ref);
      return { state: "succeeded" };
    },
  };
}
const mk = () => {
  const d1 = mkBroker("d1");
  const kv = mkBroker("kv");
  return { d1, kv, brokers: { d1, kv } };
};

describe("diffSnapshots — the delta between snapshots", () => {
  test("empty → creates in DAG order; a changed instance → update; a dropped one → deprovision; unchanged → nothing", () => {
    const creates = diffSnapshots(EMPTY_SNAPSHOT, { instances: [KV, DB] }); // KV declared first but depends on DB
    expect(creates.map((s) => `${s.action}:${s.ref}`)).toEqual(["create:db", "create:kv"]);

    const prev = { version: "1", idx: 0, instances: [DB, KV] };
    expect(diffSnapshots(prev, { instances: [DB, KV] })).toEqual([]); // unchanged
    expect(diffSnapshots(prev, { instances: [{ ...DB, name: "app-db-2" }, KV] }).map((s) => s.action)).toEqual(["update"]);
    expect(diffSnapshots(prev, { instances: [DB] }).map((s) => `${s.action}:${s.ref}`)).toEqual(["deprovision:kv"]); // dropped
  });
});

describe("generate — record the delta as a migration + snapshot", () => {
  test("first generate writes 0000; a no-op generate returns null; a change writes the next delta only", async () => {
    const m = memoryMigrationStore();
    const m0 = await generate({ instances: [DB] }, m);
    expect(m0?.tag).toBe("0000_migration");
    expect(m0?.steps.map((s) => s.action)).toEqual(["create"]);

    expect(await generate({ instances: [DB] }, m)).toBeNull(); // config == last snapshot

    const m1 = await generate({ instances: [DB, KV] }, m, "add-kv");
    expect(m1?.tag).toBe("0001_add-kv");
    expect(m1?.steps.map((s) => `${s.action}:${s.ref}`)).toEqual(["create:kv"]); // ONLY the delta
    expect((await m.lastSnapshot()).instances.map((i) => i.ref)).toEqual(["db", "kv"]);
  });
});

describe("migrate — replay pending migrations in order", () => {
  test("applies pending via the engine, marks them applied, and is idempotent on re-run", async () => {
    const { d1, kv, brokers } = mk();
    const m = memoryMigrationStore();
    const store = memoryStore();
    await generate({ instances: [DB] }, m);

    const r0 = await migrate({ brokers, store, migrations: m, sink: memorySink() });
    expect(r0.applied).toEqual([0]);
    expect(d1.provisioned).toEqual(["db"]);
    expect(store.snapshot().map((s) => s.ref)).toEqual(["db"]);

    const again = await migrate({ brokers, store, migrations: m });
    expect(again.upToDate).toBe(true);
    expect(d1.provisioned).toEqual(["db"]); // NOT re-provisioned — already applied

    // add kv → generate 0001 → migrate provisions only kv (the binding chain resolves @db.database_id from the journal).
    await generate({ instances: [DB, KV] }, m, "add-kv");
    const r1 = await migrate({ brokers, store, migrations: m, sink: memorySink() });
    expect(r1.applied).toEqual([1]);
    expect(kv.provisioned).toEqual(["kv"]);

    // drop kv → generate 0002 → migrate deprovisions it (the snapshot prunes).
    await generate({ instances: [DB] }, m, "drop-kv");
    await migrate({ brokers, store, migrations: m });
    expect(kv.deprovisioned).toEqual(["kv"]);
    expect(store.snapshot().map((s) => s.ref)).toEqual(["db"]);
  });
});

describe("fileMigrationStore — committed + repeatable across processes", () => {
  test("writes the migration/snapshot/journal; a fresh store over the same dir sees them", async () => {
    const dir = mkdtempSync(join(tmpdir(), "prov-mig-"));
    const store = fileMigrationStore(dir);
    await generate({ instances: [DB] }, store);
    await generate({ instances: [DB, KV] }, store, "add-kv");
    await store.markApplied(0);

    const fresh = fileMigrationStore(dir); // a new process, same committed dir
    const list = await fresh.listMigrations();
    expect(list.map((mm) => mm.tag)).toEqual(["0000_migration", "0001_add-kv"]);
    expect((await fresh.lastSnapshot()).instances.map((i) => i.ref)).toEqual(["db", "kv"]);
    expect(await fresh.applied()).toEqual([0]); // env-local applied-ledger persisted
  });
});

describe("the CLI — generate + migrate", () => {
  test("generate → migrate → migrate (up to date); no store → exit 2", async () => {
    const { brokers } = mk();
    const migrations = memoryMigrationStore();
    const app = defineProvisionApp({ config: { instances: [DB] }, brokers, store: memoryStore(), sink: memorySink(), migrations });

    const g = await runCli(app, ["generate", "--name", "init"]);
    expect(g.output).toContain("0000_init");

    expect((await runCli(app, ["migrate"])).output).toContain("applied 1 migration");
    expect((await runCli(app, ["migrate"])).output).toContain("up to date");

    const noMig = defineProvisionApp({ config: { instances: [DB] }, brokers, store: memoryStore() });
    expect((await runCli(noMig, ["generate"])).exitCode).toBe(2);
  });
});
