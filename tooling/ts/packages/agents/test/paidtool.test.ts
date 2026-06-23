import { test, expect, describe } from "bun:test";
import type { OpenAPIv4Document } from "@suluk/core";
import { paidToolPrice, projectCloudflareAgent } from "../src/index";

describe("paidToolPrice — x-suluk-cost (CostModel) → x402 paidTool price (C035 follow-up)", () => {
  test("a flat per-call component → a fixed USD price (1_000_000 µ$ = $1)", () => {
    const p = paidToolPrice({ components: [{ source: "compute", basis: "per-call", microUsd: 10_000 }] });
    expect(p).toEqual({ priceUsd: 0.01, microUsd: 10_000, metered: false });
  });

  test("estimateMicroUsd wins over component sum when present", () => {
    const p = paidToolPrice({ components: [{ basis: "per-call", microUsd: 10_000 }], estimateMicroUsd: 50_000 });
    expect(p!.priceUsd).toBe(0.05);
  });

  test("a usage-metered component is flagged, never folded into the fixed price (→ MPP session)", () => {
    const p = paidToolPrice({ components: [{ basis: "per-token", microUsd: 3 }] });
    expect(p).toEqual({ priceUsd: 0, microUsd: 0, metered: true });
  });

  test("flat + metered: the price is the flat portion only, metered flagged", () => {
    const p = paidToolPrice({ components: [{ basis: "per-call", microUsd: 20_000 }, { basis: "per-token", microUsd: 3 }] });
    expect(p).toEqual({ priceUsd: 0.02, microUsd: 20_000, metered: true });
  });

  test("no chargeable cost → null (stays a plain tool())", () => {
    expect(paidToolPrice(undefined)).toBeNull();
    expect(paidToolPrice({ components: [] })).toBeNull();
    expect(paidToolPrice({ components: [{ basis: "per-call", microUsd: 0 }] })).toBeNull();
  });
});

describe("the Cloudflare scaffold surfaces the paidTool wiring from x-suluk-cost (declared, not enforced)", () => {
  const doc: OpenAPIv4Document = {
    openapi: "4.0.0-candidate",
    info: { title: "Paid", version: "1.0.0" },
    paths: {
      "v1/square": {
        requests: {
          square: {
            method: "post", summary: "Square a number", responses: { ok: { status: 200 } },
            "x-suluk-cost": { components: [{ source: "compute", basis: "per-call", microUsd: 10_000 }] },
          } as any,
        },
      },
      "v1/echo": { requests: { echo: { method: "post", summary: "Echo", responses: { ok: { status: 200 } } } } },
    },
    "x-suluk-agents": {
      paid: {
        description: "An agent with one paid route and one free route.",
        maxDepth: 0,
        skills: { chat: { model: ["m"], tier: "resident", provenance: { source: "https://x/i", contentHash: "h", version: "v" } } },
        routes: {
          square: { operationRef: "#/paths/v1~1square/requests/square" },
          echo: { operationRef: "#/paths/v1~1echo/requests/echo" },
        },
        agents: {},
      },
    },
  };

  const src = Object.values(projectCloudflareAgent(doc, "paid").files).join("\n");

  test("the paid route emits the x402 paidTool pointer with the derived $ price", () => {
    expect(src).toContain("x-suluk-cost → x402");
    expect(src).toContain('server.paidTool("square"');
    expect(src).toContain("$0.01 per call");
  });

  test("the free route gets no paidTool annotation (mixing free + paid is fine)", () => {
    const echoBlock = src.slice(src.indexOf("echo: tool("));
    expect(echoBlock.slice(0, echoBlock.indexOf("}),"))).not.toContain("x402");
  });
});
