/**
 * runScope (C039) — a per-process RUN SCOPE so parallel git worktrees / CI shards / agents can run the SAME BDD suite
 * without clashing. The only things that clash are SHARED mutable state with a FIXED name; this makes both unique:
 *
 *  - `d1Path` is a unique file in the OS temp dir (NOT in the repo), so git/worktrees/.wrangler never see or contend
 *    on it — each run opens its own local sqlite.
 *  - `scopeId`/`email` are unique, so even against a SHARED backend (prod-as-test-users) the hatch's test-user scoping
 *    means a run only ever seeds/cleans ITS OWN rows.
 *
 * `runId = <pid>_<uuid8>` is globally unique across processes and worktrees. Pair it with a hatch `scope: { value:
 * scopeId }` (state hatch) and the `email` (auth hatch) for a fully isolated, parallel-safe run.
 */
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface RunScope {
  runId: string;
  /** the test-user id — the state hatch forces every seeded row's owner to this; cleanup deletes only these rows. */
  scopeId: string;
  email: string;
  /** an isolated local sqlite path in the OS temp dir (outside any worktree). */
  d1Path: string;
}

export interface RunScopeOptions {
  /** filename prefix for the temp DB (default "suluk-bdd"). */
  prefix?: string;
  /** email domain for the synthetic test user (default "example.test"). */
  emailDomain?: string;
}

export function runScope(opts: RunScopeOptions = {}): RunScope {
  const runId = `${process.pid}_${crypto.randomUUID().slice(0, 8)}`;
  return {
    runId,
    scopeId: `testuser_${runId}`,
    email: `bdd+${runId}@${opts.emailDomain ?? "example.test"}`,
    d1Path: join(tmpdir(), `${opts.prefix ?? "suluk-bdd"}-${runId}.sqlite`),
  };
}
