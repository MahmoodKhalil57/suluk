import { test, expect, describe } from "bun:test";
import { isLocal, withProtocol, apex, isSubdomain, deriveUrls } from "../src/urls";
import { definePlatform, planPlatform } from "../src/index";

describe("urls — protocol + host derivation", () => {
  test("isLocal is hostname-only (a domain with a port is NOT local)", () => {
    expect(isLocal("localhost:3000")).toBe(true);
    expect(isLocal("127.0.0.1")).toBe(true);
    expect(isLocal("app.local")).toBe(true);
    expect(isLocal("example.com:8443")).toBe(false); // the adversarial break — port ≠ local
    expect(isLocal("autotoolfactory.example")).toBe(false);
  });

  test("withProtocol: local→http, domain→https, default ports stripped", () => {
    expect(withProtocol("localhost:8787")).toBe("http://localhost:8787");
    expect(withProtocol("autotoolfactory.example")).toBe("https://autotoolfactory.example");
    expect(withProtocol("https://autotoolfactory.example/")).toBe("https://autotoolfactory.example"); // idempotent + trailing slash
    expect(withProtocol("example.com:443")).toBe("https://example.com"); // default https port dropped → exact origin match
    expect(withProtocol("localhost:80")).toBe("http://localhost"); // default http port dropped
  });

  test("apex strips www; isSubdomain flags a non-apex live host", () => {
    expect(apex("www.example.com")).toBe("example.com");
    expect(isSubdomain("api.example.com")).toBe(true);
    expect(isSubdomain("example.com")).toBe(false);
  });

  test("deriveUrls: live runtime → https everything; TRUSTED_ORIGINS has apex+www; EMAIL_FROM at apex", () => {
    const d = deriveUrls("autotoolfactory.example", "autotoolfactory.example", { scopes: ["a:read"] });
    expect(d.BETTER_AUTH_URL).toBe("https://autotoolfactory.example");
    expect(d.BASE_URL).toBe("https://autotoolfactory.example");
    expect(d.TRUSTED_ORIGINS).toBe("https://autotoolfactory.example,https://www.autotoolfactory.example");
    expect(d.EMAIL_FROM).toBe("noreply@autotoolfactory.example");
    expect(d.mcp).toEqual({ loginPage: "https://autotoolfactory.example/oauth/sign-in", consentPage: "https://autotoolfactory.example/oauth/consent", resource: "https://autotoolfactory.example/api/mcp", scopes: ["a:read"] });
  });

  test("deriveUrls: local runtime → http BASE, but EMAIL_FROM + mcp stay LIVE", () => {
    const d = deriveUrls("localhost:8787", "autotoolfactory.example", { scopes: ["a:read"] });
    expect(d.BASE_URL).toBe("http://localhost:8787");
    expect(d.TRUSTED_ORIGINS).toContain("http://localhost:8787");
    expect(d.TRUSTED_ORIGINS).toContain("https://autotoolfactory.example");
    expect(d.EMAIL_FROM).toBe("noreply@autotoolfactory.example"); // always live
    expect(d.mcp.loginPage).toBe("https://autotoolfactory.example/oauth/sign-in"); // always live
  });
});

describe("deriveHosts — the two-host manifest derives every URL var (no boilerplate)", () => {
  const TWO_HOST = definePlatform({
    system: {
      registry: "MahmoodKhalil57/suluk",
      services: ["auth", "contract", "billing", "email", "mcp"], // mcp requires contract (+auth) — the decoupling requires-guard
      globalServiceOpts: { ENVIRONMENT: "production" },
      serviceOpts: { auth: { mcpScopes: ["credits:read", "logs:read"] } },
    },
    brand: {
      name: "acme",
      globalBrandOpts: { LIVE_BASE_URL: "acme.example", LOCAL_BASE_URL: "localhost:8787", BRAND_NAME: "Acme" },
    },
  });

  test("Worker [vars] carry the LIVE-derived URLs; the bare hosts are NOT emitted", () => {
    const w = planPlatform(TWO_HOST).wranglerToml;
    expect(w).toContain('BETTER_AUTH_URL = "https://acme.example"');
    expect(w).toContain('BASE_URL = "https://acme.example"');
    expect(w).toContain('EMAIL_FROM = "noreply@acme.example"');
    expect(w).toContain('TRUSTED_ORIGINS = "https://acme.example,https://www.acme.example"');
    expect(w).not.toContain("LIVE_BASE_URL");
    expect(w).not.toContain("LOCAL_BASE_URL");
  });

  test("the entry bakes the LIVE-derived mcp trio (mcpScopes → full URLs); no hand-authored mcp URLs", () => {
    const e = planPlatform(TWO_HOST).entry;
    expect(e).toContain('"loginPage":"https://acme.example/oauth/sign-in"');
    expect(e).toContain('"resource":"https://acme.example/api/mcp"');
    expect(e).toContain('"scopes":["credits:read","logs:read"]');
    expect(e).not.toContain("mcpScopes");
  });

  test("localVars (dev entry) resolve BASE_URL to the LOCAL host; planPlatform does not mutate the input", () => {
    const local = definePlatform({ system: { ...(TWO_HOST as any).system, local: true }, brand: (TWO_HOST as any).brand });
    const dev = planPlatform(local).devEntry!;
    expect(dev).toContain('"BASE_URL":"http://localhost:8787"');
    expect(dev).toContain('"BETTER_AUTH_URL":"http://localhost:8787"');
    // the caller's manifest is untouched (private-copy invariant) — the bare host survives on the brand
    expect((TWO_HOST as any).brand.globalBrandOpts.LIVE_BASE_URL).toBe("acme.example");
  });
});
