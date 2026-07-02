/** A first-party `crm` module — Contacts and a Deal pipeline. Deal references the host's User (owner) and the
 *  module's own Contact, showing both a cross-module require and an intra-module reference. */
import type { SulukModule } from "../module";

export const CRM: SulukModule = {
  name: "crm",
  version: "0.1.0",
  provides: ["Contact", "Deal"],
  requires: ["User"], // Deal.owner references the host's User
  schemas: {
    Contact: {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        email: { type: "string" },
        company: { type: "string" },
      },
      additionalProperties: false,
    },
    Deal: {
      type: "object",
      required: ["title"],
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
        contact: { $ref: "#/components/schemas/Contact" }, // intra-module reference
        owner: { $ref: "#/components/schemas/User" }, // cross-module require
        valueCents: { type: "integer", minimum: 0 },
        stage: { type: "string", enum: ["lead", "qualified", "won", "lost"] },
      },
      additionalProperties: false,
    },
  },
  cost: {
    // infra multipliers + a `credit` payment method on every op (the per-user token debit the cost calculator tracks).
    listContact: { components: [{ source: "db-read", basis: "per-call", microUsd: 10 }], estimateMicroUsd: 10, infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "credit" } },
    createContact: { components: [{ source: "db-write", basis: "per-call", microUsd: 30 }], estimateMicroUsd: 30, infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "credit" } },
    getContact: { components: [{ source: "db-read", basis: "per-call", microUsd: 8 }], estimateMicroUsd: 8, infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "credit" } },
    updateContact: { components: [{ source: "db-write", basis: "per-call", microUsd: 30 }], estimateMicroUsd: 30, infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "credit" } },
    deleteContact: { components: [{ source: "db-write", basis: "per-call", microUsd: 20 }], estimateMicroUsd: 20, infra: { "worker.request": 1, "d1.write": 1 }, settlement: { method: "credit" } },
    listDeal: { components: [{ source: "db-read", basis: "per-call", microUsd: 12 }], estimateMicroUsd: 12, infra: { "worker.request": 1, "d1.read": 20 }, settlement: { method: "credit" } },
    createDeal: { components: [{ source: "db-write", basis: "per-call", microUsd: 35 }], estimateMicroUsd: 35, infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "credit" } },
    getDeal: { components: [{ source: "db-read", basis: "per-call", microUsd: 8 }], estimateMicroUsd: 8, infra: { "worker.request": 1, "d1.read": 1 }, settlement: { method: "credit" } },
    updateDeal: { components: [{ source: "db-write", basis: "per-call", microUsd: 35 }], estimateMicroUsd: 35, infra: { "worker.request": 1, "d1.write": 1, "d1.read": 1 }, settlement: { method: "credit" } },
    deleteDeal: { components: [{ source: "db-write", basis: "per-call", microUsd: 20 }], estimateMicroUsd: 20, infra: { "worker.request": 1, "d1.write": 1 }, settlement: { method: "credit" } },
  },
};
