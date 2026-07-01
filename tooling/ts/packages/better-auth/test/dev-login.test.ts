import { test, expect } from "bun:test";
import { devLoginHandler } from "../src/dev-login";

const req = (body: unknown) => new Request("http://localhost/api/auth/dev-login", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });

function fakeAuth() {
  const calls: any = { signUp: [], signIn: [] };
  const auth = {
    api: {
      async signUpEmail(input: any) { calls.signUp.push(input.body); if (input.body.email === "exists@x.com") throw new Error("User already exists"); return {}; },
      async signInEmail(input: any) { calls.signIn.push(input.body); return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "set-cookie": "better-auth.session_token=abc; Path=/" } }); },
    },
  };
  return { auth, calls };
}

test("FAIL-CLOSED: armed=false → 404 before any input is read", async () => {
  const { auth, calls } = fakeAuth();
  const res = await devLoginHandler({ armed: false, auth, request: req({ email: "a@b.com" }) });
  expect(res.status).toBe(404);
  expect(calls.signUp).toHaveLength(0); // never reached the mint path
});

test("armed + valid email → signs up + signs in, returns the session Response", async () => {
  const { auth, calls } = fakeAuth();
  const res = await devLoginHandler({ armed: true, auth, request: req({ email: "New@B.com" }) });
  expect(res.status).toBe(200);
  expect(res.headers.get("set-cookie")).toContain("session_token");
  expect(calls.signUp[0].email).toBe("new@b.com"); // normalized lower-case
  expect(calls.signIn[0].email).toBe("new@b.com");
});

test("armed + already-existing user → ignores signUp error, still signs in", async () => {
  const { auth, calls } = fakeAuth();
  const res = await devLoginHandler({ armed: true, auth, request: req({ email: "exists@x.com" }) });
  expect(res.status).toBe(200);
  expect(calls.signIn).toHaveLength(1);
});

test("armed + invalid/missing email → 400, no mint", async () => {
  const { auth, calls } = fakeAuth();
  expect((await devLoginHandler({ armed: true, auth, request: req({ email: "not-an-email" }) })).status).toBe(400);
  expect((await devLoginHandler({ armed: true, auth, request: req({}) })).status).toBe(400);
  expect(calls.signIn).toHaveLength(0);
});
