import { test, expect, describe } from "bun:test";
import { toolsFrom, handleRpc, buildRequest, appExec, mcpApp, LATEST_PROTOCOL, type RpcContext } from "../src/index";

// A tiny v4-shaped document: a read op with a path param + query, and a mutation with a body.
const doc = {
  components: { schemas: { ProductCreate: { type: "object", required: ["name"], properties: { name: { type: "string" }, priceCents: { type: "integer" } } } } },
  paths: {
    "product": { requests: {
      listProduct: { method: "GET", summary: "List products", parameterSchema: { query: { type: "object", properties: { limit: { type: "integer" }, q: { type: "string" } }, required: ["limit"] } } },
      createProduct: { method: "POST", summary: "Create a product", parameterSchema: { body: { $ref: "#/components/schemas/ProductCreate" } } },
    } },
    "product/{id}": { requests: {
      getProduct: { method: "GET", summary: "Get one product", parameterSchema: { path: { type: "object", properties: { id: { type: "integer" } } } } },
      deleteProduct: { method: "DELETE", summary: "Delete a product", deprecated: true, parameterSchema: { path: { type: "object", properties: { id: { type: "integer" } } } } },
    } },
  },
} as never;

describe("toolsFrom — contract → MCP tools", () => {
  test("read-only by default: only GET ops, mutations + deprecated excluded", () => {
    const names = toolsFrom(doc).map((t) => t.name).sort();
    expect(names).toEqual(["getProduct", "listProduct"]); // createProduct (POST) + deleteProduct (deprecated) excluded
  });
  test("inputSchema flattens path + query params; path param required", () => {
    const get = toolsFrom(doc).find((t) => t.name === "getProduct")!;
    expect(get.inputSchema.properties).toHaveProperty("id");
    expect(get.inputSchema.required).toEqual(["id"]);
    expect(get.op).toMatchObject({ method: "GET", path: "/product/{id}", pathParams: ["id"], readOnly: true });
    const list = toolsFrom(doc).find((t) => t.name === "listProduct")!;
    expect(Object.keys(list.inputSchema.properties).sort()).toEqual(["limit", "q"]);
    expect(list.inputSchema.required).toEqual(["limit"]);
    expect(list.op.queryParams.sort()).toEqual(["limit", "q"]);
  });
  test("include:'all' exposes mutations with a deref'd body schema under `body`", () => {
    const tools = toolsFrom(doc, { include: "all" });
    const create = tools.find((t) => t.name === "createProduct")!;
    expect(create.op.method).toBe("POST");
    expect(create.op.hasBody).toBe(true);
    expect(create.inputSchema.required).toContain("body");
    expect((create.inputSchema.properties.body as { properties: object }).properties).toHaveProperty("name"); // $ref resolved
  });
  test("hide / only filters", () => {
    expect(toolsFrom(doc, { hide: ["listProduct"] }).map((t) => t.name)).toEqual(["getProduct"]);
    expect(toolsFrom(doc, { only: ["listProduct"] }).map((t) => t.name)).toEqual(["listProduct"]);
  });
});

describe("buildRequest — SSRF-safe HTTP projection", () => {
  test("path params encoded into the template; query set on the URL; origin never escapes", () => {
    const op = toolsFrom(doc).find((t) => t.name === "getProduct")!.op;
    const req = buildRequest(op, { id: "../../etc/passwd" }, "https://shop.example");
    const u = new URL(req.url);
    expect(u.origin).toBe("https://shop.example");           // host is fixed — no SSRF
    expect(u.pathname).toBe("/product/..%2F..%2Fetc%2Fpasswd"); // traversal neutralized by encodeURIComponent
  });
  test("query op: empty/nullish values dropped, present ones encoded", () => {
    const op = toolsFrom(doc).find((t) => t.name === "listProduct")!.op;
    const u = new URL(buildRequest(op, { limit: 10, q: "a b&c" }, "https://shop.example").url);
    expect(u.searchParams.get("limit")).toBe("10");
    expect(u.searchParams.get("q")).toBe("a b&c");
  });
});

describe("handleRpc — JSON-RPC surface", () => {
  const ctx: RpcContext = { tools: toolsFrom(doc), info: { name: "test", version: "9" }, exec: async (op, args) => ({ ran: op.name, args }) };
  test("initialize negotiates protocol + advertises tools capability", async () => {
    const r = await handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } }, ctx);
    expect(r!.result).toMatchObject({ protocolVersion: "2025-03-26", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "test" } });
    const r2 = await handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "9999-99-99" } }, ctx);
    expect((r2!.result as { protocolVersion: string }).protocolVersion).toBe(LATEST_PROTOCOL); // unsupported → server default
  });
  test("notifications get no response", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }, ctx)).toBeNull();
  });
  test("tools/list returns name+description+inputSchema only", async () => {
    const r = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }, ctx);
    const tools = (r!.result as { tools: { name: string }[] }).tools;
    expect(tools.map((t) => t.name).sort()).toEqual(["getProduct", "listProduct"]);
    expect(tools[0]).toHaveProperty("inputSchema");
  });
  test("tools/call runs exec and returns text + structuredContent", async () => {
    const r = await handleRpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "getProduct", arguments: { id: 7 } } }, ctx);
    const res = r!.result as { content: { type: string; text: string }[]; structuredContent: { ran: string } };
    expect(res.content[0].type).toBe("text");
    expect(res.structuredContent.ran).toBe("getProduct");
  });
  test("unknown tool → invalid params; tool throw → in-band isError (not a protocol error)", async () => {
    const bad = await handleRpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "nope" } }, ctx);
    expect(bad!.error!.code).toBe(-32602);
    const throwing: RpcContext = { ...ctx, exec: async () => { throw new Error("boom"); } };
    const r = await handleRpc({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "getProduct", arguments: {} } }, throwing);
    expect(r!.error).toBeUndefined();
    expect((r!.result as { isError: boolean }).isError).toBe(true);
  });
  test("unknown method → -32601", async () => {
    const r = await handleRpc({ jsonrpc: "2.0", id: 6, method: "no/such" }, ctx);
    expect(r!.error!.code).toBe(-32601);
  });
});

describe("mcpApp — transport", () => {
  const app = mcpApp({ document: doc, name: "shop", exec: async (_c, op) => ({ ok: op.name }) });
  test("GET → 405 (no server stream); OPTIONS → 204 CORS; POST initialize works", async () => {
    expect((await app.request("/mcp", { method: "GET" })).status).toBe(405);
    const opt = await app.request("/mcp", { method: "OPTIONS" });
    expect(opt.status).toBe(204);
    expect(opt.headers.get("access-control-allow-origin")).toBe("*");
    const res = await app.request("/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).result.serverInfo.name).toBe("shop");
  });
  test("a notification-only POST → 202 no body", async () => {
    const res = await app.request("/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
    expect(res.status).toBe(202);
  });
  test("authorize:false → 401", async () => {
    const gated = mcpApp({ document: doc, authorize: () => false });
    const res = await gated.request("/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) });
    expect(res.status).toBe(401);
  });
  test("MCP 2025-06-18: a batch (array) POST is rejected, not fanned out", async () => {
    const res = await app.request("/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify([{ jsonrpc: "2.0", id: 1, method: "ping" }]) });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe(-32600);
  });
  test("oversized body → 413 before parse", async () => {
    const huge = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping", params: { pad: "x".repeat(300 * 1024) } });
    const res = await app.request("/mcp", { method: "POST", headers: { "content-type": "application/json", "content-length": String(huge.length) }, body: huge });
    expect(res.status).toBe(413);
  });
});

describe("review-hardening regressions", () => {
  test("name dedup terminates + stays ≤64 chars for >64-char ops sharing a prefix", () => {
    const long = "x".repeat(64);
    const requests = { [long + "A"]: { method: "GET" }, [long + "B"]: { method: "GET" } };
    const names = toolsFrom({ paths: { thing: { requests } } } as never).map((t) => t.name);
    expect(names.length).toBe(2);
    expect(names[0]).not.toBe(names[1]);
    expect(names.every((n) => n.length <= 64 && /^[A-Za-z0-9_-]+$/.test(n))).toBe(true);
  });
  test("every path template var becomes a path param even when the path schema only types some of them", () => {
    const getOrgProduct = { method: "GET", parameterSchema: { path: { type: "object", properties: { id: { type: "integer" } } } } };
    const d = { paths: { "/org/{org}/product/{id}": { requests: { getOrgProduct } } } } as never;
    const t = toolsFrom(d)[0];
    expect(t.op.pathParams.sort()).toEqual(["id", "org"]);
    expect(Object.keys(t.inputSchema.properties).sort()).toEqual(["id", "org"]);
    const u = new URL(buildRequest(t.op, { org: "acme", id: 7 }, "https://shop.example").url);
    expect(u.pathname).toBe("/org/acme/product/7"); // both vars substituted — no literal {org}
  });
  test("a request with id:null still gets a correlated error (not swallowed as a notification)", async () => {
    const ctx: RpcContext = { tools: toolsFrom(doc), info: { name: "t", version: "1" }, exec: async () => ({}) };
    const r = await handleRpc({ jsonrpc: "2.0", id: null, method: "no/such" }, ctx);
    expect(r).not.toBeNull();
    expect(r!.error!.code).toBe(-32601);
  });
  test("a non-object message → -32600 Invalid Request", async () => {
    const ctx: RpcContext = { tools: [], info: { name: "t", version: "1" }, exec: async () => ({}) };
    expect((await handleRpc(1 as never, ctx))!.error!.code).toBe(-32600);
    expect((await handleRpc(null as never, ctx))!.error!.code).toBe(-32600);
  });
  test("appExec dispatches in-process through host app.fetch (no network self-loop) and parses the result", async () => {
    const op = toolsFrom(doc).find((t) => t.name === "getProduct")!.op;
    let seen: Request | undefined;
    const fakeApp = { fetch: async (req: Request) => { seen = req; return new Response(JSON.stringify({ id: 7, name: "X" }), { headers: { "content-type": "application/json" } }); } };
    const c = { req: { url: "https://shop.example/mcp", header: () => undefined }, env: {}, get executionCtx() { throw new Error("none"); } } as never;
    const out = await appExec(fakeApp)(c, op, { id: 7 });
    expect(out).toEqual({ id: 7, name: "X" });
    expect(new URL(seen!.url).pathname).toBe("/product/7"); // routed in-process, origin preserved
  });
});

describe("tier-trim serving (C027) — resident default surface + discover_tools cold-tail", () => {
  const tools = toolsFrom(doc, { include: "all" }); // listProduct, createProduct, getProduct
  const mk = (resident?: Set<string>): RpcContext => ({ tools, info: { name: "t", version: "9" }, exec: async (op, args) => ({ ran: op.name, args }), resident });
  const list = async (ctx: RpcContext) => ((await handleRpc({ jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx))!.result as { tools: { name: string }[] }).tools.map((t) => t.name);

  test("no resident set ⇒ full surface, no discover_tools", async () => {
    expect(await list(mk())).toEqual(["listProduct", "createProduct", "getProduct"]);
  });
  test("resident set ⇒ tools/list serves only resident + discover_tools (cold-tail withheld)", async () => {
    const names = await list(mk(new Set(["listProduct"])));
    expect(names).toContain("listProduct");
    expect(names).toContain("discover_tools");
    expect(names).not.toContain("createProduct");
    expect(names).not.toContain("getProduct");
  });
  test("discover_tools reveals the cold-tail (filtered by intent), never routed to exec", async () => {
    const ctx = mk(new Set(["listProduct"]));
    const all = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "discover_tools" } }, ctx);
    expect((all!.result as { structuredContent: { tools: { name: string }[] } }).structuredContent.tools.map((t) => t.name).sort()).toEqual(["createProduct", "getProduct"]);
    const filtered = await handleRpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "discover_tools", arguments: { intent: "create" } } }, ctx);
    expect((filtered!.result as { structuredContent: { tools: { name: string }[] } }).structuredContent.tools.map((t) => t.name)).toEqual(["createProduct"]);
  });
  test("a cold-tail tool is still CALLABLE by name (lossless — withheld, not removed)", async () => {
    const r = await handleRpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "getProduct", arguments: { id: 7 } } }, mk(new Set(["listProduct"])));
    expect((r!.result as { structuredContent: { ran: string } }).structuredContent.ran).toBe("getProduct");
  });
  test("discover_tools is inert when there is NO cold-tail (all resident)", async () => {
    const names = await list(mk(new Set(["listProduct", "createProduct", "getProduct"])));
    expect(names).not.toContain("discover_tools");
  });
});
