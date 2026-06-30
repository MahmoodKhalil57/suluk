import { test, expect, describe } from "bun:test";
import { runCli, defineProvisionApp, memoryStore, memorySink, type Broker, type InstanceSpec, type ProvisionConfig, type StateStore } from "../src/index";

/** C047 build #3 — the drizzle-kit-style CLI (plan / apply / check / status), witnessed via runCli (process-pure). */
function sync(id: string, out: (name: string) => Record<string, string>): Broker {
  return {
    catalog: () => ({ services: [{ id, name: id, description: id, bindable: false, plans: [{ id: "standard", name: "Standard" }] }] }),
    async provision(req) {
      return { state: "succeeded", instanceId: `${id}:${req.name}`, outputs: out(req.name) };
    },
    async deprovision() {
      return { state: "succeeded" };
    },
  };
}
const brokers = {
  "mock-d1": sync("mock-d1", () => ({ database_id: "db-uuid" })),
  "mock-kv": sync("mock-kv", () => ({ namespace_id: "kv-id" })),
};
const baseInstances: InstanceSpec[] = [
  { ref: "db", service: "mock-d1", name: "app-db", bind: { database_id: "DB_ID" } },
  { ref: "kv", service: "mock-kv", name: "sessions", bind: { namespace_id: "KV_ID" } },
];
const appWith = (config: ProvisionConfig, store: StateStore) => defineProvisionApp({ config, brokers, store, sink: memorySink() });

describe("the provision CLI", () => {
  test("plan on a fresh project lists creates", async () => {
    const r = await runCli(appWith({ instances: baseInstances }, memoryStore()), ["plan"]);
    expect(r.exitCode).toBe(0);
    expect(r.output).toContain("+ create");
    expect(r.output).toContain("plan: 2 create");
  });

  test("apply → check is clean → plan is in sync (the drizzle-kit loop)", async () => {
    const store = memoryStore();
    const apply = await runCli(appWith({ instances: baseInstances }, store), ["apply"]);
    expect(apply.exitCode).toBe(0);
    expect(apply.output).toContain("✓ applied:");

    const check = await runCli(appWith({ instances: baseInstances }, store), ["check"]);
    expect(check.exitCode).toBe(0);
    expect(check.output).toContain("no drift");

    const plan = await runCli(appWith({ instances: baseInstances }, store), ["plan"]);
    expect(plan.output).toContain("✓ in sync");
  });

  test("check FAILS (exit 1) when the config drifts from the journal — the CI gate", async () => {
    const store = memoryStore();
    await runCli(appWith({ instances: baseInstances }, store), ["apply"]);
    const drifted = baseInstances.map((i) => (i.ref === "kv" ? { ...i, name: "sessions-v2" } : i));
    const r = await runCli(appWith({ instances: drifted }, store), ["check"]);
    expect(r.exitCode).toBe(1);
    expect(r.output).toContain("drift detected");
    expect(r.output).toContain("kv");
  });

  test("status lists the provisioned instances + their bound outputs", async () => {
    const store = memoryStore();
    await runCli(appWith({ instances: baseInstances }, store), ["apply"]);
    const r = await runCli(appWith({ instances: baseInstances }, store), ["status"]);
    expect(r.output).toContain("db (mock-d1 · app-db) → database_id=db-uuid");
    expect(r.output).toContain("kv (mock-kv · sessions) → namespace_id=kv-id");
  });

  test("apply --prune deprovisions an orphan; an unknown command exits 2", async () => {
    const store = memoryStore();
    await runCli(appWith({ instances: baseInstances }, store), ["apply"]);
    const pruned = await runCli(appWith({ instances: baseInstances.filter((i) => i.ref === "db") }, store), ["apply", "--prune"]);
    expect(pruned.output).toContain("-kv");

    const bad = await runCli(appWith({ instances: baseInstances }, store), ["frobnicate"]);
    expect(bad.exitCode).toBe(2);
  });
});
