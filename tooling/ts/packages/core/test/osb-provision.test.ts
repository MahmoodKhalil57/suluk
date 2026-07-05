import { test, expect } from "bun:test";
import type {
  OpenAPIv4Document, SulukProvisionInstance,
  Service, Plan, CatalogResponse, ServiceInstanceProvisionRequestBody, ServiceBindingRequest,
  ServiceBrokerError, OperationState, JsonObject,
} from "../src/index";

/**
 * C101 — the OSB v2 wire-contract companion model + the `x-suluk-provision` facet. Type assertions are enforced by
 * `bun run typecheck` (core's tsconfig includes `test/**`); the runtime tests anchor the file under `bun test`.
 */

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

/* ── The light facet: SulukProvisionInstance omits `ref` (implied by the x-suluk-provision map key) ──────────── */
const dbInstance: SulukProvisionInstance = {
  service: "cloudflare-d1",
  name: "app-db",
  params: { migrations: ["0001_init.sql"] },
  bind: { database_id: "CLOUDFLARE_D1_ID" },
  protected: true,
};
void dbInstance;
const docWithProvision: OpenAPIv4Document = {
  openapi: "4.0.0",
  info: { title: "x", version: "1" },
  paths: {},
  ["x-suluk-provision"]: { db: dbInstance },
};
void docWithProvision;

/* ── The OSB wire-contract companion (reference the standard, no dep) ────────────────────────────────────────── */
const offering: Service = { name: "d1", id: "cloudflare-d1", description: "A D1 database.", bindable: true, plans: [
  { id: "standard", name: "standard", description: "Standard plan." },
] };
void offering;
const plan_: Plan = { id: "standard", name: "standard", description: "Standard plan.", free: true };
void plan_;
const catalog: CatalogResponse = { services: [offering] };
void catalog;
const provisionReq: ServiceInstanceProvisionRequestBody = {
  service_id: "cloudflare-d1", plan_id: "standard", organization_guid: "org", space_guid: "space",
};
void provisionReq;
const bindReq: ServiceBindingRequest = { service_id: "cloudflare-d1", plan_id: "standard" };
void bindReq;
const err: ServiceBrokerError = { error: "ConcurrencyError", description: "A provision is already in progress." };
void err;
type _opState = Expect<Equal<OperationState, "in progress" | "succeeded" | "failed">>;
type _jsonObject = Expect<Equal<JsonObject, Record<string, unknown>>>;

test("C101: SulukProvisionInstance + x-suluk-provision round-trip as a plain object (no OSB wire ceremony present)", () => {
  const facet = docWithProvision["x-suluk-provision"]!;
  expect(facet.db.service).toBe("cloudflare-d1");
  expect(facet.db.params).toEqual({ migrations: ["0001_init.sql"] });
  expect("dashboard_client" in facet.db).toBe(false); // OSB wire ceremony does NOT belong on the light facet
});

test("C101: the OSB wire-contract types compose into a full catalog + provision/bind request shape", () => {
  expect(catalog.services?.[0]?.plans[0]?.id).toBe("standard");
  expect(provisionReq.service_id).toBe("cloudflare-d1");
  expect(bindReq.plan_id).toBe("standard");
  expect(err.error).toBe("ConcurrencyError");
});
