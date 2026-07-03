import { test, expect, describe } from "bun:test";
import { CORE_SERVICES, toCatalogEntry, defineService, CATALOG } from "../src/index";

/** C053 Phase 1 — the common Service interface + the dogfooded core set + the derived-CATALOG invariant. */

const IDS = [
  "app", "auth", "contract", "mcp", "credits", "keys", "billing", "cost", "erasure", "email",
  "webhooks", "rate-limit", "rate-credit", "i18n", "reference", "admin", "logs", "todo", "journeys", "audit",
];

describe("CORE_SERVICES — the core services through defineService", () => {
  test("carries exactly the expected service ids, key === service.id", () => {
    expect(Object.keys(CORE_SERVICES).sort()).toEqual([...IDS].sort());
    for (const [id, s] of Object.entries(CORE_SERVICES)) expect(s.id).toBe(id);
  });

  test("CATALOG is a byte-faithful derived view of CORE_SERVICES", () => {
    expect(Object.keys(CATALOG).sort()).toEqual(Object.keys(CORE_SERVICES).sort());
    for (const [id, s] of Object.entries(CORE_SERVICES)) {
      expect(CATALOG[id]).toEqual(toCatalogEntry(s));
      expect(CATALOG[id].mount).toBe(s.mount);
    }
  });

  test("auth EXPOSES the onUserCreated port; credits OFFERS the grantOnSignup capability (composition surface)", () => {
    expect(CORE_SERVICES.auth.compose?.exposes?.onUserCreated?.hookOptKey).toBe("onUserCreated");
    expect(CORE_SERVICES.auth.compose?.exposes?.onUserCreated?.kind).toBe("port");
    expect(CORE_SERVICES.credits.compose?.offers?.grantOnSignup?.kind).toBe("capability");
    expect(CORE_SERVICES.credits.compose?.offers?.grantOnSignup?.symbol).toBe("Credits");
  });

  test("defineService requires an id", () => {
    expect(() => defineService({ id: "", mount: { kind: "dev" } })).toThrow(/id/);
  });
});
