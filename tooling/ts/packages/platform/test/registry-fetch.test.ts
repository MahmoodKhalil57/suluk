import { test, expect, describe } from "bun:test";
import { fetchRegistry } from "../src/index";

// A mock registry (never touches the network). `app` is a shared registryDependency; `mcp` chains through `contract`.
const REGISTRY = {
  items: [
    { name: "app", files: [{ path: "registry/foundation/app/app.ts", target: "src/app.ts" }] },
    { name: "contract", registryDependencies: ["o/r/app"], dependencies: ["@suluk/hono"], files: [{ path: "registry/derivation/contract/contract.routes.ts", target: "src/routes/contract.ts" }] },
    { name: "mcp", registryDependencies: ["o/r/app", "o/r/contract"], dependencies: ["@suluk/mcp", "@suluk/hono"], files: [{ path: "registry/surfaces/mcp/mcp.routes.ts", target: "src/routes/mcp.ts" }, { path: "registry/surfaces/mcp/mcp.schema.ts", target: "src/db/mcp.ts" }] },
  ],
};
const mkFetch = (log: string[] = []) =>
  (async (url: string | URL) => {
    const u = String(url);
    log.push(u);
    if (u.endsWith("registry.json")) return new Response(JSON.stringify(REGISTRY));
    return new Response(`// content of ${u.split("/main/")[1]}`);
  }) as unknown as typeof fetch;

describe("fetchRegistry — the importable shadcn-add replacement", () => {
  test("resolves registryDependencies (dep-first), writes each file to its target, and collects npm deps", async () => {
    const wrote: Record<string, string> = {};
    const res = await fetchRegistry(["o/r/mcp"], { write: async (p, c) => void (wrote[p] = c), fetch: mkFetch() });
    // mcp needs app + contract → dep-first order, deduped.
    expect(res.added).toEqual(["app", "contract", "mcp"]);
    // every file landed at its TARGET (not its repo path).
    expect(Object.keys(wrote).sort()).toEqual(["src/app.ts", "src/db/mcp.ts", "src/routes/contract.ts", "src/routes/mcp.ts"]);
    expect(wrote["src/routes/mcp.ts"]).toContain("mcp.routes.ts"); // fetched from the raw path
    // the union of npm deps, deduped.
    expect(res.deps.sort()).toEqual(["@suluk/hono", "@suluk/mcp"]);
  });

  test("fetches raw files from the repo's main branch and dedups a shared dependency (`app` fetched once)", async () => {
    const log: string[] = [];
    const wrote: string[] = [];
    await fetchRegistry(["o/r/contract", "o/r/mcp"], { write: async (p) => void wrote.push(p), fetch: mkFetch(log) });
    expect(log[0]).toBe("https://raw.githubusercontent.com/o/r/main/registry.json");
    expect(log.filter((u) => u.endsWith("app.ts")).length).toBe(1); // app's file fetched exactly once
    expect(wrote.filter((p) => p === "src/app.ts").length).toBe(1); // and written exactly once
  });

  test("fails closed on an unknown item + honours a custom ref", async () => {
    await expect(fetchRegistry(["o/r/nope"], { write: async () => {}, fetch: mkFetch() })).rejects.toThrow(/item "nope" not found/);
    const log: string[] = [];
    await fetchRegistry(["o/r/app"], { write: async () => {}, fetch: mkFetch(log), ref: "v1" });
    expect(log[0]).toContain("/o/r/v1/registry.json"); // the custom git ref
  });

  test("an empty ref list is a no-op", async () => {
    expect(await fetchRegistry([], { write: async () => { throw new Error("should not write"); } })).toEqual({ added: [], deps: [] });
  });
});
