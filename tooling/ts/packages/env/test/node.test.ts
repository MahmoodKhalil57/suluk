import { test, expect, describe, afterAll, beforeEach } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { encryptEnvFile, decryptEnvFileToString, setVar, readPrivateKey, readPublicKey, rawEnvRecord, type FileOpts } from "../src/node";
import { isEncrypted } from "../src/crypto";
import { PRIVATE_KEY_NAME } from "../src/envfile";

const dir = mkdtempSync(join(tmpdir(), "suluk-env-"));
const o: FileOpts = { envPath: join(dir, ".env"), keysPath: join(dir, ".env.keys") };
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("@suluk/env node — fs helpers (the CLI's engine)", () => {
  test("encryptEnvFile encrypts in place + creates the gitignored .env.keys", async () => {
    writeFileSync(o.envPath!, "BASE_URL=http://x\nSTRIPE_SECRET_KEY=sk_live_zzz\n");
    const { publicKey } = await encryptEnvFile({ ...o, skipPlain: ["BASE_URL"] });
    expect(publicKey.startsWith("mlkem768:")).toBe(true);
    expect(existsSync(o.keysPath!)).toBe(true);                         // private key file created
    const raw = rawEnvRecord(o);
    expect(isEncrypted(raw.STRIPE_SECRET_KEY)).toBe(true);              // secret encrypted at rest
    expect(raw.BASE_URL).toBe("http://x");                              // skipped → plaintext
    expect(readFileSync(o.keysPath!, "utf8")).toContain(PRIVATE_KEY_NAME);
  });

  test("setVar adds an encrypted variable, get/decrypt round-trips it", async () => {
    await setVar("RESEND_API_KEY", "re_secret_42", o);
    expect(isEncrypted(rawEnvRecord(o).RESEND_API_KEY)).toBe(true);
    const plain = await decryptEnvFileToString(o);
    expect(plain).toContain('RESEND_API_KEY="re_secret_42"');
    expect(plain).toContain('STRIPE_SECRET_KEY="sk_live_zzz"');
  });

  test("readPrivateKey / readPublicKey resolve from the files", () => {
    expect(readPrivateKey(o)!.startsWith("mlkem768:")).toBe(true);
    expect(readPublicKey(o)!.startsWith("mlkem768:")).toBe(true);
  });

  test("a fresh teammate with ONLY the public key can add a secret (no private key needed)", async () => {
    // simulate: a clone that has .env (with the public key) but NO .env.keys
    const env2 = join(dir, "clone.env");
    writeFileSync(env2, readFileSync(o.envPath!, "utf8"));
    const cloneOpts: FileOpts = { envPath: env2, keysPath: join(dir, "nonexistent.keys") };
    await setVar("NEW_SECRET", "added-by-teammate", cloneOpts); // uses the public key embedded in clone.env
    expect(isEncrypted(rawEnvRecord(cloneOpts).NEW_SECRET)).toBe(true);
    // and the ORIGINAL private key can decrypt what the teammate added
    const plain = await decryptEnvFileToString({ ...cloneOpts, keysPath: o.keysPath });
    expect(plain).toContain('NEW_SECRET="added-by-teammate"');
  });
});

describe("@suluk/env node — centralized ~/.suluk/settings.json key resolution", () => {
  const sdir = mkdtempSync(join(tmpdir(), "suluk-settings-"));
  const settingsFile = join(sdir, "settings.json");
  const projDir = join(sdir, "apps", "my-app");
  const KEY = "mlkem768:from-settings";
  // a FileOpts whose .env / .env.keys do NOT exist → settings.json is the only file source in play
  const noFiles: FileOpts = { envPath: join(sdir, "absent.env"), keysPath: join(sdir, "absent.keys") };
  const saved = {
    settings: process.env.SULUK_SETTINGS_PATH,
    proj: process.env.SULUK_PROJECT_DIR,
    priv: process.env[PRIVATE_KEY_NAME],
  };
  const writeSettings = (obj: unknown) => writeFileSync(settingsFile, JSON.stringify(obj));
  const proj = (over: Record<string, unknown> = {}) => ({ name: "my-app", path: projDir, env: [{ key: PRIVATE_KEY_NAME, value: KEY }], ...over });

  beforeEach(() => {
    process.env.SULUK_SETTINGS_PATH = settingsFile;
    process.env.SULUK_PROJECT_DIR = projDir;
    delete process.env[PRIVATE_KEY_NAME]; // don't let the env-var source pre-empt settings.json
  });
  afterAll(() => {
    // restore the environment so the file-resolution describe block above is unaffected by run order
    saved.settings === undefined ? delete process.env.SULUK_SETTINGS_PATH : (process.env.SULUK_SETTINGS_PATH = saved.settings);
    saved.proj === undefined ? delete process.env.SULUK_PROJECT_DIR : (process.env.SULUK_PROJECT_DIR = saved.proj);
    saved.priv === undefined ? delete process.env[PRIVATE_KEY_NAME] : (process.env[PRIVATE_KEY_NAME] = saved.priv);
    rmSync(sdir, { recursive: true, force: true });
  });

  test("resolves the key by exact + prefix `path` match", () => {
    writeSettings({ projects: [proj()] });
    expect(readPrivateKey(noFiles)).toBe(KEY);                          // exact
    process.env.SULUK_PROJECT_DIR = join(projDir, "tooling", "ts");     // a nested cwd
    expect(readPrivateKey(noFiles)).toBe(KEY);                          // prefix
  });

  test("falls back to project `name` as a path segment when no `path` matches (worktrees)", () => {
    writeSettings({ projects: [proj({ path: "/somewhere/else" })] });  // path can't match, but cwd has a `my-app` segment
    expect(readPrivateKey(noFiles)).toBe(KEY);
  });

  test("the SULUK_PRIVATE_KEY env var wins over settings.json", () => {
    writeSettings({ projects: [proj()] });
    process.env[PRIVATE_KEY_NAME] = "mlkem768:env-wins";
    expect(readPrivateKey(noFiles)).toBe("mlkem768:env-wins");
  });

  test("a malformed settings.json fails safe (no throw, falls through)", () => {
    writeSettings({ projects: "not-an-array" });                       // valid JSON, wrong shape
    expect(() => readPrivateKey(noFiles)).not.toThrow();
    expect(readPrivateKey(noFiles)).toBeUndefined();                   // no .env.keys either → undefined
  });

  test("a missing settings.json is not fatal", () => {
    process.env.SULUK_SETTINGS_PATH = join(sdir, "does-not-exist.json");
    expect(readPrivateKey(noFiles)).toBeUndefined();
  });
});
