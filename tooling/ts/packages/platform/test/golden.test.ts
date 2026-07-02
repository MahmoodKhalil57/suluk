import { test, expect, describe } from "bun:test";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { definePlatform, planPlatform } from "../src/index";

/**
 * PHASE 0 — the C053 byte-identity GOLDEN LOCK. The single hardest guarantee of the C053 refactor: one `definePlatform`
 * manifest → the *published* generator → the SAME bytes it produces today. Every C053 phase (dogfood the catalog, typed
 * opts, the composition engine, multi-registry) runs against this. Because `@suluk/platform` ships `src/` directly (no
 * build step), the in-repo source IS the published tarball — so pinning `planPlatform` over the REAL autotoolfactory
 * manifest below IS the C051 "one-shot from the installed generator" invariant, frozen.
 *
 * The fixtures under `test/__golden__/autotoolfactory/` are the ORACLE. To (re)generate them after an INTENTIONAL output
 * change, run `UPDATE_GOLDEN=1 bun test golden` and review the fixture diff before committing.
 */

// A byte-for-byte copy of ~/apps/autotoolfactory/platform.config.ts (the 18-service parity manifest). Keep in lockstep.
export const AUTOTOOLFACTORY = definePlatform({
  name: "autotoolfactory",
  registry: "MahmoodKhalil57/suluk",
  services: ["auth", "contract", "mcp", "rate-limit", "rate-credit", "i18n", "credits", "keys", "billing", "cost", "erasure", "email", "webhooks", "logs", "reference", "admin", "journeys", "audit"],
  vars: {
    BASE_URL: "https://autotoolfactory.example",
    BETTER_AUTH_URL: "https://autotoolfactory.example",
    TRUSTED_ORIGINS: "https://autotoolfactory.example",
    EMAIL_FROM: "noreply@autotoolfactory.example",
    BRAND_NAME: "autotoolfactory",
    ENVIRONMENT: "production",
  },
  opts: {
    auth: {
      mcp: {
        loginPage: "https://autotoolfactory.example/oauth/sign-in",
        consentPage: "https://autotoolfactory.example/oauth/consent",
        resource: "https://autotoolfactory.example/api/mcp",
        scopes: ["credits:read", "credits:write", "keys:read", "keys:write", "billing:read", "billing:write", "cost:read", "logs:read"],
      },
    },
  },
});

const DIR = join(import.meta.dir, "__golden__", "autotoolfactory");
const UPDATE = process.env.UPDATE_GOLDEN === "1";

// each PlatformPlan string output → its on-disk fixture filename.
const OUTPUTS: Record<string, string> = {
  entry: "src_index.ts",
  provisionConfig: "provision.config.ts",
  contractOps: "src_contract.ops.ts",
  packageJson: "package.json",
  tsconfig: "tsconfig.json",
  componentsJson: "components.json",
  envExample: "env.example",
  wranglerToml: "wrangler.toml",
  gitignore: "gitignore",
  envCheck: "env-check.ts",
  envTs: "src_env.ts",
  syncSecrets: "sync-secrets.ts",
  linkKey: "link-key.ts",
  envTemp: "env.temp",
  provisionScript: "provision.ts",
  mintTokens: "mint-tokens.ts",
  envScaffold: "env.scaffold",
};

describe("GOLDEN — autotoolfactory byte-identity lock (the C053 guardrail)", () => {
  const plan = planPlatform(AUTOTOOLFACTORY) as unknown as Record<string, string>;

  if (UPDATE) {
    mkdirSync(DIR, { recursive: true });
    for (const [key, file] of Object.entries(OUTPUTS)) writeFileSync(join(DIR, file), plan[key]);
  }

  for (const [key, file] of Object.entries(OUTPUTS)) {
    test(`${key} is byte-identical to its golden fixture`, () => {
      const path = join(DIR, file);
      expect(existsSync(path)).toBe(true);
      expect(plan[key]).toBe(readFileSync(path, "utf8"));
    });
  }

  test("the shadcn adds are the 18 services (+ app implied) as registry refs, in order", () => {
    const p = planPlatform(AUTOTOOLFACTORY);
    expect(p.adds).toEqual(
      ["app", "auth", "contract", "mcp", "rate-limit", "rate-credit", "i18n", "credits", "keys", "billing", "cost", "erasure", "email", "webhooks", "logs", "reference", "admin", "journeys", "audit"].map(
        (s) => `MahmoodKhalil57/suluk/${s}`,
      ),
    );
  });
});

// The `local: true` mock-provider variant — the outputs that DIFFER from the golden above are locked here (the rest are
// byte-identical to non-local). Freezes the bun dev entry + the `export const app` entry + the `dev`-script package.json.
const LOCAL = definePlatform({ ...AUTOTOOLFACTORY, local: true });
const LOCAL_DIR = join(import.meta.dir, "__golden__", "autotoolfactory-local");
const LOCAL_OUTPUTS: Record<string, string> = { entry: "src_index.ts", devEntry: "src_dev.ts", purgeScript: "scripts_purge-state.ts", packageJson: "package.json", gitignore: "gitignore", tsconfig: "tsconfig.json" };

describe("GOLDEN — autotoolfactory `local: true` mock-provider variant", () => {
  const plan = planPlatform(LOCAL) as unknown as Record<string, string>;

  if (UPDATE) {
    mkdirSync(LOCAL_DIR, { recursive: true });
    for (const [key, file] of Object.entries(LOCAL_OUTPUTS)) writeFileSync(join(LOCAL_DIR, file), plan[key]);
  }

  for (const [key, file] of Object.entries(LOCAL_OUTPUTS)) {
    test(`local ${key} is byte-identical to its golden fixture`, () => {
      const path = join(LOCAL_DIR, file);
      expect(existsSync(path)).toBe(true);
      expect(plan[key]).toBe(readFileSync(path, "utf8"));
    });
  }

  test("local mode exports the wired app + emits src/dev.ts; non-local emits neither", () => {
    expect(plan.entry).toContain("export const app = createApp();");
    expect(plan.devEntry).toContain('import { app } from "./index";');
    expect(plan.devEntry).toContain("d1FromSqlite");
    expect(JSON.parse(plan.packageJson).scripts.dev).toBe("bun run --hot src/dev.ts");
    expect(JSON.parse(plan.packageJson).scripts.predev).toBeUndefined();
    const nonLocal = planPlatform(AUTOTOOLFACTORY) as unknown as Record<string, string>;
    expect(nonLocal.entry).toContain("const app = createApp();");
    expect(nonLocal.entry).not.toContain("export const app");
    expect(nonLocal.devEntry).toBeUndefined();
  });
});
