/**
 * The CLI (C047) — drizzle-kit's command surface for infrastructure: `plan` (diff desired vs live), `apply`/`push`
 * (provision + bind + sink), `check` (the drift CI gate, non-zero on drift), `status`/`studio` (the live inventory).
 * `runCli` is PURE of the process — it returns `{ output, exitCode }` (no `process.exit`, no direct console), so it's
 * unit-testable; `bin/provision.ts` is the thin shell that loads the config file, prints, and exits.
 */
import type { ProvisionApp } from "./app";
import { plan, type ProvisionPlan, type PlanStep } from "./plan";
import { apply, type AppliedStep } from "./apply";
import { checkDrift } from "./check";
import type { InstanceState } from "./types";

export interface CliResult {
  output: string;
  exitCode: number;
}

const SYM: Record<PlanStep["action"], string> = { create: "+", update: "~", noop: "=", deprovision: "-" };
const APPLIED_SYM: Record<AppliedStep["action"], string> = { create: "+", update: "~", noop: "=", deprovision: "-" };

function renderPlan(p: ProvisionPlan, out: (s: string) => void): void {
  if (!p.steps.length) return out("No instances declared.");
  for (const s of p.steps) out(`  ${SYM[s.action]} ${s.action.padEnd(11)} ${s.ref} (${s.service} · ${s.name}) — ${s.reason}`);
  const counts = p.steps.reduce<Record<string, number>>((a, s) => ({ ...a, [s.action]: (a[s.action] ?? 0) + 1 }), {});
  const summary = (["create", "update", "noop", "deprovision"] as const).filter((k) => counts[k]).map((k) => `${counts[k]} ${k}`).join(", ");
  out(`\n${p.clean ? "✓ in sync" : `plan: ${summary}`}${!p.orphans.length ? "" : `  ·  orphans: ${p.orphans.join(", ")}`}`);
}

export async function runCli(app: ProvisionApp, argv: string[]): Promise<CliResult> {
  const cmd = argv[0] ?? "plan";
  const prune = argv.includes("--prune");
  const lines: string[] = [];
  const out = (s: string) => lines.push(s);
  const done = (exitCode = 0): CliResult => ({ output: lines.join("\n"), exitCode });

  switch (cmd) {
    case "plan": {
      const state = await app.store.load();
      out(`── provision plan ${prune ? "(--prune)" : ""}──`);
      renderPlan(plan(app.config, state, prune), out);
      return done();
    }
    case "apply":
    case "push": {
      out(`── provision apply ${prune ? "(--prune)" : ""}──`);
      const res = await apply(app.config, { brokers: app.brokers, store: app.store, sink: app.sink, prune, log: out });
      const changed = res.steps.filter((s) => s.action !== "noop");
      out(`\n✓ applied: ${changed.length ? changed.map((s) => `${APPLIED_SYM[s.action]}${s.ref}`).join(" ") : "nothing (all in sync)"}`);
      return done();
    }
    case "check": {
      const state = await app.store.load();
      const r = checkDrift(app.config, state);
      if (r.clean) {
        out("✓ infrastructure in sync — no drift");
        return done(0);
      }
      out("✗ infrastructure drift detected:");
      for (const s of r.drift) out(`  ${SYM[s.action]} ${s.ref} (${s.reason})`);
      if (r.orphans.length) out(`  orphans: ${r.orphans.join(", ")}`);
      return done(1); // the CI gate
    }
    case "status":
    case "studio": {
      const state = (await app.store.load()) as InstanceState[];
      if (!state.length) {
        out("(nothing provisioned yet)");
        return done();
      }
      out("── provisioned ──");
      for (const s of state) {
        const outs = Object.keys(s.outputs).length ? ` → ${Object.entries(s.outputs).map(([k, v]) => `${k}=${v}`).join(", ")}` : "";
        out(`  ${s.ref} (${s.service} · ${s.name})${outs}`);
      }
      return done();
    }
    default:
      out(`unknown command "${cmd}". Commands: plan | apply (push) | check | status (studio). Flags: --prune`);
      return done(2);
  }
}
