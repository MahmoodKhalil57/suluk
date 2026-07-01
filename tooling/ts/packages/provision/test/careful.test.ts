import { test, expect, describe } from "bun:test";
import {
  pull, reconcile, discover, teardown, plan, apply, runCli, defineProvisionApp,
  memoryStore, memorySink, type Broker, type InstanceSpec, type InstanceState, type ProvisionConfig,
} from "../src/index";

/** C047 build #5 — the careful features: `pull` (external-drift introspection), `teardown` (guarded destruction), and
 *  the `protected` rail. */
const st = (ref: string, service: string, outputs: Record<string, string>, extra: Partial<InstanceState> = {}): InstanceState => ({
  ref, service, name: `${ref}-name`, instanceId: `${service}:${ref}`, outputs, fingerprint: "fp", provisionedAt: 1, ...extra,
});

function broker(id: string, impl: Partial<Broker> = {}): Broker {
  return {
    catalog: () => ({ services: [{ id, name: id, description: id, bindable: false, plans: [{ id: "standard", name: "S" }] }] }),
    async provision(req) {
      return { state: "succeeded", instanceId: `${id}:${req.name}`, outputs: {} };
    },
    async deprovision() {
      return { state: "succeeded" };
    },
    ...impl,
  };
}

describe("pull — external drift (journal vs provider)", () => {
  test("classifies live / missing / drifted / unknown, and reconcile folds it back", async () => {
    const state = [st("db", "d1", { database_id: "x" }), st("gone", "d1", { database_id: "y" }), st("moved", "d1", { database_id: "z" }), st("opaque", "mystery", { k: "v" })];
    const brokers = {
      d1: broker("d1", {
        async fetch(req) {
          if (req.ref === "gone") return { exists: false }; // deleted in the dashboard
          if (req.ref === "moved") return { exists: true, outputs: { database_id: "z-NEW" } }; // id changed
          return { exists: true, outputs: { database_id: "x" } }; // db: matches
        },
      }),
      mystery: broker("mystery"), // no fetch → unknown
    };
    const report = await pull(state, brokers);
    expect(report.entries.map((e) => `${e.ref}:${e.status}`)).toEqual(["db:live", "gone:missing", "moved:drifted", "opaque:unknown"]);
    expect(report.clean).toBe(false);
    expect(report.missing).toEqual(["gone"]);
    expect(report.drifted).toEqual(["moved"]);

    const fixed = reconcile(state, report);
    expect(fixed.map((s) => s.ref)).toEqual(["db", "moved", "opaque"]); // "gone" dropped → next apply re-creates
    expect(fixed.find((s) => s.ref === "moved")?.outputs).toEqual({ database_id: "z-NEW" }); // drifted output updated
  });

  test("discover finds live resources the journal doesn't track", async () => {
    const state = [st("db", "d1", { database_id: "known" })];
    const brokers = {
      d1: broker("d1", {
        async list() {
          return [
            { name: "app-db", instanceId: "d1:db", outputs: { database_id: "known" } }, // already tracked
            { name: "stray-db", instanceId: "d1:stray", outputs: { database_id: "stray" } }, // untracked
          ];
        },
      }),
    };
    expect(await discover(state, brokers)).toEqual([{ service: "d1", name: "stray-db", instanceId: "d1:stray", outputs: { database_id: "stray" } }]);
  });
});

describe("teardown — guarded destruction", () => {
  const twoInstances = [st("db", "d1", {}), st("token", "tok", {})]; // journal order = provision order
  const recording = () => {
    const order: string[] = [];
    const rec = (req: { ref: string }) => {
      order.push(req.ref);
      return Promise.resolve({ state: "succeeded" as const });
    };
    return { order, brokers: { d1: broker("d1", { deprovision: rec }), tok: broker("tok", { deprovision: rec }) } };
  };

  test("tears down CONSUMERS-FIRST (reverse journal order) and empties the journal", async () => {
    const { order, brokers } = recording();
    const store = memoryStore(twoInstances);
    const res = await teardown({ brokers, store });
    expect(order).toEqual(["token", "db"]); // reverse of [db, token]
    expect(res.torn).toEqual(["token", "db"]);
    expect(store.snapshot()).toEqual([]);
  });

  test("dry run previews without calling any provider or saving", async () => {
    const { order, brokers } = recording();
    const store = memoryStore(twoInstances);
    const res = await teardown({ brokers, store, dryRun: true });
    expect(order).toEqual([]); // no provider touched
    expect(res.torn).toEqual(["token", "db"]); // what WOULD go
    expect(store.snapshot().length).toBe(2); // journal untouched
  });

  test("a PROTECTED instance is kept unless --force", async () => {
    const withProtected = [st("db", "d1", {}, { protected: true }), st("token", "tok", {})];
    const r1 = recording();
    const store1 = memoryStore(withProtected);
    const kept = await teardown({ brokers: r1.brokers, store: store1 });
    expect(r1.order).toEqual(["token"]); // db (protected) skipped
    expect(kept.kept).toEqual([{ ref: "db", reason: "protected" }]);
    expect(store1.snapshot().map((s) => s.ref)).toEqual(["db"]); // protected survives

    const r2 = recording();
    const store2 = memoryStore(withProtected);
    await teardown({ brokers: r2.brokers, store: store2, force: true });
    expect(r2.order).toEqual(["token", "db"]); // force destroys the protected one too
    expect(store2.snapshot()).toEqual([]);
  });
});

describe("protected in plan/prune", () => {
  test("a protected orphan is kept (not deprovisioned) under --prune, and doesn't count as drift", () => {
    const config: ProvisionConfig = { instances: [] }; // everything is an orphan
    const state = [st("db", "d1", {}, { protected: true }), st("cache", "kv", {})];
    const p = plan(config, state, true);
    expect(p.steps.find((s) => s.ref === "db")?.action).toBe("noop"); // protected → kept
    expect(p.steps.find((s) => s.ref === "cache")?.action).toBe("deprovision"); // unprotected orphan → gone
    expect(p.clean).toBe(false); // the unprotected orphan is still pending work
  });
});

describe("the CLI — pull + teardown gates", () => {
  const instances: InstanceSpec[] = [{ ref: "db", service: "mock", name: "app-db", protected: true }, { ref: "kv", service: "mock", name: "sessions" }];
  const mkBrokers = () => ({ mock: broker("mock", { async provision(req) { return { state: "succeeded", instanceId: `mock:${req.name}`, outputs: { id: req.name } }; } }) });
  const appWith = (store: ReturnType<typeof memoryStore>) => defineProvisionApp({ config: { instances }, brokers: mkBrokers(), store, sink: memorySink() });

  test("`teardown` without --yes is a DRY RUN; `teardown --yes` destroys (protected needs --force)", async () => {
    const store = memoryStore();
    await runCli(appWith(store), ["apply"]); // seed the journal (db is protected)

    const dry = await runCli(appWith(store), ["teardown"]);
    expect(dry.output).toContain("DRY RUN");
    expect(store.snapshot().length).toBe(2); // nothing destroyed

    const yes = await runCli(appWith(store), ["teardown", "--yes"]);
    expect(yes.output).toContain("torn down");
    expect(store.snapshot().map((s) => s.ref)).toEqual(["db"]); // kv gone, db (protected) survives

    await runCli(appWith(store), ["teardown", "--yes", "--force"]);
    expect(store.snapshot()).toEqual([]); // --force destroys the protected db too
  });

  test("`pull` reports a clean journal after apply", async () => {
    const store = memoryStore();
    const brokers = { mock: broker("mock", { async provision(req) { return { state: "succeeded", instanceId: `mock:${req.name}`, outputs: {} }; }, async fetch() { return { exists: true }; } }) };
    const app = defineProvisionApp({ config: { instances }, brokers, store, sink: memorySink() });
    await runCli(app, ["apply"]);
    const r = await runCli(app, ["pull"]);
    expect(r.output).toContain("journal matches the provider");
  });
});
