import { test, expect, describe } from "bun:test";
import { tmpdir } from "node:os";
import { runScope } from "../src/hatch/runscope";

/**
 * runScope is the parallel-safety primitive (C039): every call yields a UNIQUE test-user identity + an isolated temp DB
 * path, so parallel worktrees / CI shards running the same BDD suite never clash.
 */
describe("runScope — unique-per-call, isolated, parallel-safe", () => {
  test("each call is globally unique (id, scopeId, email, d1Path)", () => {
    const a = runScope();
    const b = runScope();
    expect(a.runId).not.toBe(b.runId);
    expect(a.scopeId).not.toBe(b.scopeId);
    expect(a.email).not.toBe(b.email);
    expect(a.d1Path).not.toBe(b.d1Path);
    // 50 calls → 50 distinct ids
    expect(new Set(Array.from({ length: 50 }, () => runScope().runId)).size).toBe(50);
  });

  test("the DB path is in the OS temp dir (outside any worktree/repo) and the scope ties everything to one test user", () => {
    const s = runScope({ prefix: "tf-bdd" });
    expect(s.d1Path.startsWith(tmpdir())).toBe(true);
    expect(s.d1Path).toContain("tf-bdd-");
    expect(s.scopeId).toBe(`testuser_${s.runId}`);
    expect(s.email).toContain(s.runId);
  });
});
