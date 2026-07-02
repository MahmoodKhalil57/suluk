import { test, expect, describe } from "bun:test";
import { planPlatform, definePlatform } from "../src/index";
import { buildCiStages } from "../src/ci";

/**
 * The LOCAL on-push CI/CD (Arc 5 / C060) — the platform manifest scaffolds an async, worktree-isolated pipeline that runs
 * idempotent stages and deploys ONLY on the default branch. These tests pin the load-bearing invariants of that wiring:
 * (1) the stage ORDER is cheap→expensive fail-fast; (2) the suluk gate is present iff `audit`+`contract` are installed;
 * (3) the hook detaches + deploys only on refs/heads/main|master (never gates the push); (4) the runner deploys only when
 * the deploy flag is set AND all stages pass; (5) the package.json carries the CI scripts + the lint/format toolchain.
 */

const FULL = definePlatform({
  name: "citest",
  registry: "MahmoodKhalil57/suluk",
  services: ["auth", "contract", "audit"],
  vars: { BASE_URL: "https://citest.example", ENVIRONMENT: "production" },
});

describe("CI stage list — ci-stages.ts", () => {
  test("ordered cheap→expensive, fail-fast: format → lint → typecheck → [suluk-gate] → bundle → test", () => {
    const stages = buildCiStages(["auth", "contract", "audit"]);
    const order = [...stages.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
    expect(order).toEqual(["format", "lint", "typecheck", "suluk-gate", "bundle", "test"]);
  });

  test("the suluk gate is present IFF both `audit` and `contract` are installed", () => {
    expect(buildCiStages(["audit", "contract"])).toContain('label: "suluk-gate"');
    expect(buildCiStages(["contract"])).not.toContain("suluk-gate"); // audit missing
    expect(buildCiStages(["audit"])).not.toContain("suluk-gate"); // contract missing (no doc to derive)
    expect(buildCiStages([])).not.toContain("suluk-gate");
  });

  test("every stage is a read-only/idempotent check (format:check, not format --write)", () => {
    const stages = buildCiStages(["audit", "contract"]);
    expect(stages).toContain('cmd: ["bun", "run", "format:check"]');
    expect(stages).not.toContain('"format"]'); // never the writing variant in CI
  });
});

describe("pre-push hook — githooks/pre-push", () => {
  const hook = planPlatform(FULL).prePushHook;

  test("returns instantly + detaches (never gates the push)", () => {
    expect(hook).toContain("setsid"); // fully detached background session
    expect(hook).toMatch(/exit 0\s*$/); // the hook itself always succeeds → push proceeds
  });

  test("deploys ONLY on the default branch (refs/heads/main|master)", () => {
    expect(hook).toContain("refs/heads/main | refs/heads/master) DEPLOY=1");
    // no other ref sets DEPLOY=1
    expect([...hook.matchAll(/DEPLOY=1/g)]).toHaveLength(1);
  });

  test("guards against recursion when a background deploy pushes", () => {
    expect(hook).toContain('[ -n "${SULUK_CI:-}" ] && exit 0');
  });
});

describe("ci-run.ts — the detached worktree runner", () => {
  const run = planPlatform(FULL).ciRun;

  test("isolates in a git worktree at the pushed sha + cleans up on exit", () => {
    expect(run).toContain('"worktree", "add", "--detach"');
    expect(run).toContain('process.on("exit", cleanup)');
    expect(run).toContain('"worktree", "remove", "--force"');
  });

  test("deploys only when the deploy flag is set AND all stages passed", () => {
    expect(run).toContain("if (ok && deploy) {");
    expect(run).toContain('run("bun", ["run", "deploy"]'); // the C059 @suluk/deploy API deploy, not wrangler
    expect(run).not.toContain("wrangler");
  });

  test("records verdicts as local git tags (started/ok-/failed-/deployed/passed|failed)", () => {
    expect(run).toContain('tag("started")');
    expect(run).toContain("tag(`ok-${label}`)");
    expect(run).toContain("tag(`failed-${label}`)");
    expect(run).toContain('tag("deployed")');
    expect(run).toContain('tag(ok ? "passed" : "failed")');
  });
});

describe("package.json — CI scripts + toolchain", () => {
  const pkg = JSON.parse(planPlatform(FULL).packageJson);

  test("installs the hook via `prepare` (core.hooksPath, no husky)", () => {
    expect(pkg.scripts.prepare).toBe("git config core.hooksPath .githooks || true");
  });

  test("exposes the in-place + manual variants and the lint/format scripts", () => {
    expect(pkg.scripts["ci:local"]).toBe("bun run scripts/ci-local.ts");
    expect(pkg.scripts["ci:worktree"]).toBe("bun run scripts/ci-worktree.ts");
    expect(pkg.scripts.lint).toBe("eslint .");
    expect(pkg.scripts.format).toBe("prettier --write .");
    expect(pkg.scripts["format:check"]).toBe("prettier --check .");
  });

  test("the suluk:gate script is present (audit+contract) and derives the doc first", () => {
    expect(pkg.scripts["suluk:gate"]).toBe("bun run scripts/emit-contract.ts && bun run src/scripts/conformance.ts");
  });

  test("carries the lint/format devDeps", () => {
    for (const dep of ["eslint", "@eslint/js", "typescript-eslint", "prettier", "globals", "@suluk/eslint"]) {
      expect(pkg.devDependencies[dep]).toBeDefined();
    }
  });

  test("an app WITHOUT audit still gets format/lint/type/test CI, minus the suluk gate", () => {
    const noAudit = JSON.parse(planPlatform(definePlatform({ name: "x", registry: "MahmoodKhalil57/suluk", services: ["auth"] })).packageJson);
    expect(noAudit.scripts["ci:local"]).toBeDefined();
    expect(noAudit.scripts.lint).toBeDefined();
    expect(noAudit.scripts["suluk:gate"]).toBeUndefined();
  });
});

describe("gitignore — CI artifacts", () => {
  test("ignores the .ci/ log+bundle dir and the emitted openapi.v4.json", () => {
    const gi = planPlatform(FULL).gitignore;
    expect(gi.split("\n")).toContain(".ci/");
    expect(gi.split("\n")).toContain("openapi.v4.json");
  });
});
