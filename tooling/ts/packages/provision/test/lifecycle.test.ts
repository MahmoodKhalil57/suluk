import { test, expect, describe } from "bun:test";
import {
  defineProvision, apply, plan, topoOrder, resolveParams, assertNoDrift, checkDrift,
  memoryStore, memorySink, type Broker, type ProvisionConfig, type InstanceState,
} from "../src/index";

/**
 * C047 — the OSB provisioning framework, witnessed with MOCK brokers through the full lifecycle: catalog → provision
 * (sync + async-with-polling) → bind → the BINDING CHAIN (a downstream `@ref.key` param resolving to a freshly
 * provisioned value) → idempotent re-apply → drift-update → orphan deprovision. No real provider; the clock + sleep are
 * injected so polling is deterministic.
 */
type Calls = { provision: string[]; bind: string[]; deprovision: string[]; lastOp: number };
function mockBroker(id: string, opts: { async?: boolean; bindable?: boolean; out?: (name: string) => Record<string, string> } = {}): Broker & { calls: Calls } {
  const calls: Calls = { provision: [], bind: [], deprovision: [], lastOp: 0 };
  let opState = 0;
  return {
    calls,
    catalog: () => ({ services: [{ id, name: id, description: id, bindable: !!opts.bindable, plans: [{ id: "standard", name: "Standard" }] }] }),
    async provision(req) {
      calls.provision.push(req.ref);
      const instanceId = `${id}:${req.name}`;
      if (opts.async) {
        opState = 0;
        return { state: "in progress", operation: `op:${req.name}`, instanceId, outputs: opts.bindable ? {} : (opts.out?.(req.name) ?? {}) };
      }
      return { state: "succeeded", instanceId, outputs: opts.bindable ? {} : (opts.out?.(req.name) ?? {}) };
    },
    lastOperation: opts.async
      ? async () => {
          calls.lastOp++;
          opState++;
          return { state: opState >= 2 ? "succeeded" : "in progress" }; // "in progress" once, then "succeeded"
        }
      : undefined,
    bind: opts.bindable
      ? async (req) => {
          calls.bind.push(req.ref);
          return { outputs: opts.out?.(req.name) ?? { token: `${req.name}-tok` } };
        }
      : undefined,
    async deprovision(req) {
      calls.deprovision.push(req.ref);
      return { state: "succeeded" };
    },
  };
}

/** db (async; its provision emits database_id) → token (sync, bindable; its scope param references @db.database_id). */
function fixture() {
  const d1 = mockBroker("mock-d1", { async: true, out: (name) => ({ database_id: `${name}-uuid` }) });
  const token = mockBroker("mock-token", { bindable: true, out: (name) => ({ token: `${name}-secret` }) });
  const config: ProvisionConfig = {
    instances: [
      { ref: "token", service: "mock-token", name: "d1-token", params: { scope: "@db.database_id" }, bind: { token: "CLOUDFLARE_D1_TOKEN" } },
      { ref: "db", service: "mock-d1", name: "app-db", bind: { database_id: "CLOUDFLARE_D1_ID" } },
    ],
  };
  return { d1, token, config, brokers: { "mock-d1": d1, "mock-token": token } };
}
const fastPoll = { sleep: async () => {}, intervalMs: 0 };

describe("the binding DAG", () => {
  test("topoOrder puts a producer before its consumer regardless of config order", () => {
    const { config } = fixture();
    expect(topoOrder(config.instances).map((i) => i.ref)).toEqual(["db", "token"]); // token declared first, but depends on db
  });

  test("defineProvision rejects a duplicate ref, an unknown ref, and a cycle", () => {
    expect(() => defineProvision({ instances: [{ ref: "a", service: "s", name: "a" }, { ref: "a", service: "s", name: "a2" }] })).toThrow(/duplicate/);
    expect(() => defineProvision({ instances: [{ ref: "a", service: "s", name: "a", params: { x: "@ghost.id" } }] })).toThrow(/no instance "ghost"/);
    expect(() => defineProvision({ instances: [
      { ref: "a", service: "s", name: "a", params: { x: "@b.id" } },
      { ref: "b", service: "s", name: "b", params: { y: "@a.id" } },
    ] })).toThrow(/cycle/);
  });

  test("resolveParams substitutes a ref and fails closed on a missing output", () => {
    const spec = { ref: "c", service: "s", name: "c", params: { scope: "@db.database_id", literal: 7 } };
    expect(resolveParams(spec, { db: { database_id: "abc" } })).toEqual({ scope: "abc", literal: 7 });
    expect(() => resolveParams(spec, { db: {} })).toThrow(/no output "database_id"/);
  });
});

describe("apply — the full OSB lifecycle", () => {
  test("provisions in DAG order, polls the async op, resolves the binding chain, lands credentials in the sink", async () => {
    const { config, brokers, d1, token } = fixture();
    const store = memoryStore();
    const sink = memorySink();
    const res = await apply(config, { brokers, store, sink, poll: fastPoll });

    // order: db before token; db was async (polled twice: "in progress" → "succeeded").
    expect(res.steps.map((s) => `${s.action}:${s.ref}`)).toEqual(["create:db", "create:token"]);
    expect(d1.calls.lastOp).toBe(2);
    // the binding chain: token's scope param resolved to db's freshly provisioned database_id.
    expect(token.calls.provision).toEqual(["token"]);
    expect(res.outputsByRef.db).toEqual({ database_id: "app-db-uuid" });
    // the sink got both mapped env vars.
    expect(sink.values).toEqual({ CLOUDFLARE_D1_ID: "app-db-uuid", CLOUDFLARE_D1_TOKEN: "d1-token-secret" });
    // state persisted for both.
    expect(store.snapshot().map((s) => s.ref).sort()).toEqual(["db", "token"]);
  });

  test("re-applying a settled config is ALL noops — touches no provider", async () => {
    const { config, brokers, d1, token } = fixture();
    const store = memoryStore();
    await apply(config, { brokers, store, poll: fastPoll });
    d1.calls.provision.length = 0;
    token.calls.provision.length = 0;
    const again = await apply(config, { brokers, store, poll: fastPoll });
    expect(again.steps.every((s) => s.action === "noop")).toBe(true);
    expect(d1.calls.provision).toEqual([]); // idempotent — no provider call on a clean re-apply
    expect(token.calls.provision).toEqual([]);
  });

  test("a param change re-provisions ONLY the drifted instance (the producer stays noop)", async () => {
    const { config, brokers, d1, token } = fixture();
    const store = memoryStore();
    await apply(config, { brokers, store, poll: fastPoll });
    d1.calls.provision.length = 0;
    token.calls.provision.length = 0;
    // drift the token's params.
    const drifted: ProvisionConfig = { instances: config.instances.map((i) => (i.ref === "token" ? { ...i, params: { scope: "@db.database_id", ttl: 3600 } } : i)) };
    const res = await apply(drifted, { brokers, store, poll: fastPoll });
    expect(res.steps.map((s) => `${s.action}:${s.ref}`)).toEqual(["noop:db", "update:token"]);
    expect(d1.calls.provision).toEqual([]); // db unchanged
    expect(token.calls.provision).toEqual(["token"]); // only the drifted one re-provisioned
  });

  test("orphan mitigation: an instance dropped from config is deprovisioned under --prune", async () => {
    const { config, brokers, token } = fixture();
    const store = memoryStore();
    await apply(config, { brokers, store, poll: fastPoll });
    const dbOnly: ProvisionConfig = { instances: config.instances.filter((i) => i.ref === "db") };
    const res = await apply(dbOnly, { brokers, store, prune: true, poll: fastPoll });
    expect(res.steps.find((s) => s.ref === "token")?.action).toBe("deprovision");
    expect(token.calls.deprovision).toEqual(["token"]);
    expect(store.snapshot().map((s) => s.ref)).toEqual(["db"]);
  });

  test("WITHOUT --prune an orphan is surfaced but NOT torn down", async () => {
    const { config, brokers, token } = fixture();
    const store = memoryStore();
    await apply(config, { brokers, store, poll: fastPoll });
    const dbOnly: ProvisionConfig = { instances: config.instances.filter((i) => i.ref === "db") };
    const res = await apply(dbOnly, { brokers, store, poll: fastPoll }); // prune off
    expect(token.calls.deprovision).toEqual([]); // destructive op never fires by default
    expect(res.state.map((s) => s.ref).sort()).toEqual(["db", "token"]); // token state kept
  });
});

describe("plan + the drift gate", () => {
  test("plan marks new instances create; checkDrift/assertNoDrift gate on pending work", () => {
    const { config } = fixture();
    const empty: InstanceState[] = [];
    const p = plan(config, empty);
    expect(p.clean).toBe(false);
    expect(p.steps.map((s) => `${s.action}:${s.ref}`)).toEqual(["create:db", "create:token"]);
    expect(checkDrift(config, empty).drift.length).toBe(2);
    expect(() => assertNoDrift(config, empty)).toThrow(/drift detected/);
  });

  test("assertNoDrift passes once everything is provisioned", async () => {
    const { config, brokers } = fixture();
    const store = memoryStore();
    await apply(config, { brokers, store, poll: fastPoll });
    expect(() => assertNoDrift(config, store.snapshot())).not.toThrow();
  });
});
