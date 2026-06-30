import { test, expect, describe } from "bun:test";
import { cloudflareToken, cloudflarePagesDomain, apply, memoryStore, memorySink, type ProvisionConfig } from "../src/index";
import type { CloudflareClient } from "@suluk/cloudflare";

/** C047 build #4 — the scoped-token broker + the ASYNC Pages-domain broker (the OSB last-operation showcase). */
type Call = { method: string; path: string; opts?: { json?: unknown } };

/** A mock CF whose GET .../domains returns "not attached" on the FIRST call (provision's check) then the domain with a
 *  status that flips pending → active across polls — so an `apply` actually polls the cert to "active". */
function mockCfDomains(host: string): CloudflareClient & { calls: Call[] } {
  const calls: Call[] = [];
  let getDomains = 0;
  const cf = {
    resolveAccountId: async () => "acct1",
    request: async (method: string, path: string, opts?: { json?: unknown }) => {
      calls.push({ method, path, opts });
      if (method === "GET" && path.endsWith("/domains")) {
        getDomains++;
        if (getDomains === 1) return []; // provision attach-check: not yet attached
        return [{ name: host, status: getDomains >= 3 ? "active" : "pending" }]; // poll #1 pending, poll #2 active
      }
      return {};
    },
    calls,
  };
  return cf as unknown as CloudflareClient & { calls: Call[] };
}

function mockCfToken(): CloudflareClient & { calls: Call[] } {
  const calls: Call[] = [];
  const cf = {
    resolveAccountId: async () => "acct1",
    request: async (method: string, path: string, opts?: { json?: unknown }) => {
      calls.push({ method, path, opts });
      if (method === "POST" && path.endsWith("/tokens")) return { id: "tok-id", value: "tok-secret" };
      return {};
    },
    calls,
  };
  return cf as unknown as CloudflareClient & { calls: Call[] };
}

describe("cloudflare-token (least-privilege binding)", () => {
  test("mints a scoped token; the value rides out as the binding; deprovision revokes by id", async () => {
    const cf = mockCfToken();
    const broker = cloudflareToken(cf);
    const res = await broker.provision({ ref: "d1tok", name: "app-d1-token", params: { permissionGroups: ["pg-d1-write"] } });
    expect(res).toEqual({ state: "succeeded", instanceId: "tok-id", outputs: { token: "tok-secret", token_id: "tok-id" } });
    const post = cf.calls.find((c) => c.method === "POST" && c.path.endsWith("/tokens"))!;
    expect(post.opts?.json).toMatchObject({ name: "app-d1-token", policies: [{ effect: "allow", permission_groups: [{ id: "pg-d1-write" }] }] });
    await broker.deprovision!({ ref: "d1tok", name: "app-d1-token", instanceId: "tok-id", operation: "deprovision" });
    expect(cf.calls.at(-1)).toMatchObject({ method: "DELETE", path: "/accounts/acct1/tokens/tok-id" });
  });
});

describe("cloudflare-pages-domain (async last-operation)", () => {
  test("provision attaches + returns in-progress; lastOperation settles pending → active", async () => {
    const cf = mockCfDomains("app.example.com");
    const broker = cloudflarePagesDomain(cf);
    const res = await broker.provision({ ref: "domain", name: "app.example.com", params: { project: "site" } });
    expect(res).toEqual({ state: "in progress", operation: "site::app.example.com", instanceId: "site::app.example.com", outputs: { hostname: "app.example.com", url: "https://app.example.com" } });
    expect(cf.calls.some((c) => c.method === "POST" && c.path.endsWith("/domains"))).toBe(true); // attached
    const req = { ref: "domain", name: "app.example.com", instanceId: "site::app.example.com", operation: "site::app.example.com" };
    expect((await broker.lastOperation!(req)).state).toBe("in progress"); // poll #1 → pending
    expect((await broker.lastOperation!(req)).state).toBe("succeeded"); // poll #2 → active
  });

  test("apply drives the async create to done (the framework polls the cert to active)", async () => {
    const cf = mockCfDomains("app.example.com");
    const config: ProvisionConfig = { instances: [{ ref: "domain", service: "cloudflare-pages-domain", name: "app.example.com", params: { project: "site" }, bind: { url: "BASE_URL" } }] };
    const store = memoryStore();
    const sink = memorySink();
    const res = await apply(config, { brokers: { "cloudflare-pages-domain": cloudflarePagesDomain(cf) }, store, sink, poll: { sleep: async () => {}, intervalMs: 0 } });
    expect(res.steps[0]).toMatchObject({ ref: "domain", action: "create" });
    expect(res.outputsByRef.domain).toEqual({ hostname: "app.example.com", url: "https://app.example.com" });
    expect(sink.values).toEqual({ BASE_URL: "https://app.example.com" }); // the binding landed after the poll settled
    expect(store.snapshot()[0].instanceId).toBe("site::app.example.com");
  });

  test("provision needs a params.project", async () => {
    await expect(cloudflarePagesDomain(mockCfDomains("h")).provision({ ref: "d", name: "h", params: {} })).rejects.toThrow(/needs a params.project/);
  });
});
