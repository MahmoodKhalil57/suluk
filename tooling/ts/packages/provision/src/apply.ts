/**
 * The executor (C047) — drizzle-kit's `push` for infrastructure. Walks a {@link ProvisionPlan} in binding-DAG order and
 * calls the OSB verbs: `provision` (idempotent), poll `lastOperation` until an async create settles, `bind` for the
 * credentials, land them in the {@link BindingSink}, and accumulate each instance's outputs so a downstream `@ref.key`
 * param resolves to a freshly-provisioned value. Orphans (when pruning) are deprovisioned last. Provider calls live in
 * the brokers; this is the pure orchestration over them — the clock + sleep are injected so it's deterministically
 * testable.
 */
import type { Broker, BindingSink, InstanceState, ProvisionResult, StateStore } from "./types";
import type { ProvisionConfig } from "./config";
import type { PlanStep, StepAction } from "./plan";
import { plan } from "./plan";
import { resolveParams, fingerprint } from "./refs";
import { pollToDone, type PollOptions } from "./poll";

export interface ApplyOptions {
  /** broker id → broker (the catalog of executors). A step whose `service` is absent here is an error. */
  brokers: Record<string, Broker>;
  /** the journal load/save (a JSON file in prod; memory in tests). */
  store: StateStore;
  /** where bound credentials land (the @suluk/env manifest in prod; memory in tests). Optional — omit to skip sinking. */
  sink?: BindingSink;
  /** deprovision orphans (state − config). Defaults to the config's `pruneOrphans`. */
  prune?: boolean;
  /** async-poll tuning + seams (see {@link PollOptions}). */
  poll?: PollOptions;
  log?: (msg: string) => void;
}

export interface AppliedStep {
  ref: string;
  action: StepAction;
  instanceId?: string;
  outputs?: Record<string, string>;
}

export interface ApplyResult {
  steps: AppliedStep[];
  state: InstanceState[];
  /** every instance's resolved outputs after the run (for assertions + downstream tooling). */
  outputsByRef: Record<string, Record<string, string>>;
}

/** Resolve the instance id from a provision result, settling an async op first via polling. */
async function settle(
  broker: Broker,
  spec: { ref: string; name: string },
  result: ProvisionResult,
  poll: PollOptions,
  log: (m: string) => void,
): Promise<{ instanceId: string; outputs: Record<string, string> }> {
  if (result.state === "succeeded") return { instanceId: result.instanceId, outputs: result.outputs ?? {} };
  // async: the ack must carry the id (often known at submit time, like a D1 uuid); poll until the op settles, then
  // thread any outputs the ack already surfaced.
  if (!result.instanceId) throw new Error(`provision: ${spec.ref} async provision must return an instanceId alongside the operation`);
  await pollToDone(broker, { ref: spec.ref, name: spec.name, instanceId: result.instanceId, operation: result.operation }, poll, log);
  return { instanceId: result.instanceId, outputs: result.outputs ?? {} };
}

/** Execute the plan for `config`. Idempotent end-to-end: re-running a settled config is all-noops, touches no provider. */
export async function apply(config: ProvisionConfig, opts: ApplyOptions): Promise<ApplyResult> {
  const log = opts.log ?? (() => {});
  const poll = opts.poll ?? {};
  const now = poll.now ?? Date.now;
  const prune = opts.prune ?? config.pruneOrphans ?? false;

  const prior = await opts.store.load();
  const p = plan(config, prior, prune);
  const specByRef = new Map(config.instances.map((i) => [i.ref, i]));
  const stateByRef = new Map(prior.map((s) => [s.ref, s]));
  // seed downstream-ref resolution with EXISTING outputs (a noop producer still feeds a changed consumer).
  const outputsByRef: Record<string, Record<string, string>> = Object.fromEntries(prior.map((s) => [s.ref, s.outputs]));
  const applied: AppliedStep[] = [];

  for (const step of p.steps) {
    const broker = opts.brokers[step.service];
    if (!broker && step.action !== "noop") throw new Error(`provision: no broker registered for service "${step.service}" (instance ${step.ref})`);

    if (step.action === "noop") {
      applied.push({ ref: step.ref, action: "noop", instanceId: stateByRef.get(step.ref)?.instanceId, outputs: outputsByRef[step.ref] });
      continue;
    }

    if (step.action === "deprovision") {
      const s = stateByRef.get(step.ref)!;
      if (broker.deprovision) {
        const res = await broker.deprovision({ ref: s.ref, name: s.name, instanceId: s.instanceId, operation: "deprovision" });
        if (res.state === "in progress") await pollToDone(broker, { ref: s.ref, name: s.name, instanceId: s.instanceId, operation: res.operation ?? "deprovision" }, poll, log);
      }
      stateByRef.delete(step.ref);
      delete outputsByRef[step.ref];
      applied.push({ ref: step.ref, action: "deprovision" });
      log(`✗ deprovisioned ${step.ref} (${step.name})`);
      continue;
    }

    // create | update
    const spec = specByRef.get(step.ref)!;
    const params = resolveParams(spec, outputsByRef);
    log(`${step.action === "create" ? "+" : "~"} ${step.action} ${step.ref} (${spec.service} · ${spec.name})`);
    const result = await broker.provision({ ref: spec.ref, name: spec.name, plan: spec.plan, params });
    const { instanceId, outputs: provisionOutputs } = await settle(broker, spec, result, poll, log);

    let outputs = { ...provisionOutputs };
    if (broker.bind) {
      const bound = await broker.bind({ ref: spec.ref, name: spec.name, instanceId, params });
      outputs = { ...outputs, ...bound.outputs };
    }
    outputsByRef[spec.ref] = outputs;
    if (opts.sink && spec.bind && Object.keys(spec.bind).length) await opts.sink.write(outputs, spec.bind);

    stateByRef.set(spec.ref, {
      ref: spec.ref, service: spec.service, plan: spec.plan, name: spec.name,
      instanceId, outputs, fingerprint: fingerprint(spec), protected: spec.protected, provisionedAt: now(),
    });
    applied.push({ ref: spec.ref, action: step.action as StepAction, instanceId, outputs });
  }

  const state = [...stateByRef.values()];
  await opts.store.save(state);
  return { steps: applied, state, outputsByRef };
}

export type { PlanStep };
