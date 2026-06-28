import { test, expect, describe } from "bun:test";
import { localD1 } from "../src/hatch/backends";
import { stateHatch } from "../src/hatch/state";
import { signInAs } from "../src/hatch/auth";
import type { TestUser } from "../src/hatch/types";

/**
 * Durable package witness for the AUTH HATCH contract (C039) — the orchestration + the FAIL-CLOSED guarantee, proven
 * without any real Better Auth (the consumer supplies mintSession/verify; here they are stubs). The end-to-end mint
 * against toolfactory's real Better Auth is witnessed separately by toolfactory's local self-test
 * (scripts/journeys-hatch-selftest.ts). This pins the property that matters most: signInAs NEVER returns a session the
 * app rejected — it can never manufacture a false green — and teardown is test-user-scoped.
 */
async function fixture() {
  const d1 = await localD1(":memory:");
  await d1.run("CREATE TABLE user (id TEXT PRIMARY KEY, email TEXT)");
  await d1.run("CREATE TABLE session (id TEXT PRIMARY KEY, userId TEXT, token TEXT)");
  const state = stateHatch(d1, { write: true, scope: { value: "testuser_1" } });
  return { d1, state };
}
const ensureUser = async (state: Awaited<ReturnType<typeof fixture>>["state"], user: TestUser) => {
  await state.d1.seed("user", "id", [{ email: user.email }], { kind: "auth", because: "OAuth-only; no API seeds a verified user", userPathChecked: true });
  return "testuser_1"; // seed forced user.id = the scope value
};
const mintSession = async (userId: string) => ({ cookie: `better-auth.session_token=${userId}.sig` });

describe("auth hatch — signInAs (fail-closed, never a false green)", () => {
  test("returns the session + seeds the user when the app ACCEPTS the minted cookie", async () => {
    const { state } = await fixture();
    const s = await signInAs({ state, user: { email: "bdd@example.test" }, ensureUser, mintSession, verify: async () => true });
    expect(s.userId).toBe("testuser_1");
    expect(s.cookie).toBe("better-auth.session_token=testuser_1.sig");
    expect(await state.d1.get("SELECT id FROM user WHERE id = ?", ["testuser_1"])).toEqual({ id: "testuser_1" });
  });

  test("THROWS when the app REJECTS the minted session — fails closed, never returns an unverified credential", async () => {
    const { state } = await fixture();
    await expect(
      signInAs({ state, user: { email: "bdd@example.test" }, ensureUser, mintSession, verify: async () => false }),
    ).rejects.toThrow(/REJECTED|fails closed/);
  });

  test("teardown scoped-deletes only the test user's user + session rows", async () => {
    const { d1, state } = await fixture();
    await d1.run("INSERT INTO session (id, userId, token) VALUES (?,?,?)", ["s1", "testuser_1", "t"]);
    await d1.run("INSERT INTO user (id, email) VALUES (?,?)", ["real_1", "real@customer.com"]); // a co-resident real user
    const s = await signInAs({ state, user: { email: "bdd@example.test" }, ensureUser, mintSession, verify: async () => true });
    await s.teardown(); // default targets: session.userId + user.id
    expect(await state.d1.select("SELECT id FROM user WHERE id = ?", ["testuser_1"])).toEqual([]);
    expect(await state.d1.select("SELECT id FROM session WHERE userId = ?", ["testuser_1"])).toEqual([]);
    expect(await state.d1.select("SELECT id FROM user WHERE id = ?", ["real_1"])).toEqual([{ id: "real_1" }]); // untouched
  });
});
