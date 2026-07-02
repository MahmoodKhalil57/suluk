import { test, expect } from "bun:test";
import { CloudflareClient } from "../src/client";
import { resolveZoneId, ensureWwwRedirect, removeWwwRedirect } from "../src/resources";

function fakeCf() {
  const state: { rules: any[] | null } = { rules: null };
  const calls: any[] = [];
  const cf = new CloudflareClient({ apiToken: "t", accountId: "acc" });
  (cf as any).request = async (method: string, path: string, opts: any = {}) => {
    calls.push({ method, path, json: opts.json, query: opts.query });
    if (path === "/zones") return [{ id: "zone1", name: opts.query?.name }];
    if (path.includes("/rulesets/phases/") && path.endsWith("/entrypoint")) {
      if (method === "GET") { if (state.rules === null) throw new Error("404"); return { rules: state.rules }; }
      if (method === "PUT") { state.rules = opts.json.rules; return { rules: state.rules }; }
    }
    return null;
  };
  return { cf, state, calls };
}

test("resolveZoneId looks up the zone by apex host", async () => {
  const { cf } = fakeCf();
  expect(await resolveZoneId(cf, "example.com")).toBe("zone1");
});

test("ensureWwwRedirect creates the www→apex rule; second call is idempotent", async () => {
  const { cf, state } = fakeCf();
  const r1 = await ensureWwwRedirect(cf, "zone1", "example.com");
  expect(r1.added).toBe(true);
  expect(state.rules).toHaveLength(1);
  expect(state.rules![0].expression).toBe('(http.host eq "www.example.com")');
  expect(state.rules![0].action_parameters.from_value.target_url.expression).toContain('concat("https://example.com"');
  expect(state.rules![0].action_parameters.from_value.status_code).toBe(301);
  const r2 = await ensureWwwRedirect(cf, "zone1", "example.com");
  expect(r2.added).toBe(false); // dedup by description
  expect(state.rules).toHaveLength(1);
});

test("ensureWwwRedirect preserves other redirect rules; removeWwwRedirect removes only ours", async () => {
  const { cf, state } = fakeCf();
  state.rules = [{ description: "someone else's rule", expression: "x" }];
  await ensureWwwRedirect(cf, "zone1", "example.com");
  expect(state.rules).toHaveLength(2);
  await removeWwwRedirect(cf, "zone1", "example.com");
  expect(state.rules).toHaveLength(1);
  expect(state.rules[0].description).toBe("someone else's rule");
});
