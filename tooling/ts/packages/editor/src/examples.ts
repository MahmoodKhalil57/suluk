/**
 * Seed documents the editor can open with. These are deliberately v4-NATIVE: the flagship "Suluk Galaxy" puts TWO
 * named requests on one path sharing the same HTTP method (`checkout` → guestCheckout + memberCheckout) — the headline
 * v4 capability that OpenAPI 3.1, which keys operations by method, cannot express. They also carry the v4 facets
 * (`x-suluk-cost`, `x-suluk-access`) so the preview's cost explorer + access lens + hardening grade light up.
 *
 * `doc` is typed `unknown` on purpose: the v4 facets live as `x-suluk-*` members on requests, which the strict
 * Request type does not enumerate. The editor stringifies `doc` to JSON for the source pane; @suluk/core then
 * re-parses + validates it like any user input — so these are held to the same bar as a pasted document.
 */
export interface EditorExample {
  id: string;
  label: string;
  description?: string;
  /** A v4 document (or, for the upgrade demo, a 3.1 document). Parsed + validated like any user input. */
  doc: unknown;
}

/** The showcase: multi-request-per-method + cost + access facets, the things a 3.x editor structurally cannot show. */
const SULUK_GALAXY: unknown = {
  openapi: "4.0.0-candidate",
  info: {
    title: "Suluk Galaxy",
    version: "1.0.0",
    description:
      "A native OpenAPI **v4** showcase. Note `checkout` below: two named requests — `guestCheckout` and " +
      "`memberCheckout` — share the **same** `POST` method on **one** path. 3.1 keys operations by method, so it " +
      "cannot represent this; v4 keys them by name. Each operation also declares its cost (`x-suluk-cost`) and " +
      "access (`x-suluk-access`), which the preview turns into a cost explorer, an access lens, and a hardening grade.",
  },
  servers: [{ url: "https://galaxy.suluk.dev", description: "Production" }],
  tags: {
    Planets: { summary: "Browse and manage planets" },
    Checkout: { summary: "Two ways to pay — the v4 multi-request headline" },
    Auth: { summary: "Tokens" },
  },
  paths: {
    planet: {
      summary: "The planet collection",
      requests: {
        listPlanets: {
          method: "get",
          summary: "List planets",
          tags: ["Planets"],
          "x-suluk-access": { requires: "anyone" },
          "x-suluk-cost": { components: [{ source: "db-read", basis: "per-call", microUsd: 9 }], estimateMicroUsd: 9 },
          parameterSchema: {
            query: {
              type: "object",
              properties: {
                limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                cursor: { type: "string" },
              },
            },
          },
          responses: {
            ok: {
              status: 200,
              description: "A page of planets",
              contentType: "application/json",
              contentSchema: { type: "array", items: { $ref: "#/components/schemas/Planet" } },
            },
          },
        },
        createPlanet: {
          method: "post",
          summary: "Create a planet",
          tags: ["Planets"],
          security: [{ bearerAuth: [] }],
          "x-suluk-access": { requires: "admin" },
          "x-suluk-cost": {
            components: [
              { source: "compute", basis: "per-call", microUsd: 80 },
              { source: "db-write", basis: "per-call", microUsd: 40 },
            ],
            estimateMicroUsd: 120,
          },
          contentType: "application/json",
          contentSchema: { $ref: "#/components/schemas/PlanetInput" },
          responses: {
            created: { status: 201, description: "Created", contentType: "application/json", contentSchema: { $ref: "#/components/schemas/Planet" } },
            invalid: { status: 400, description: "Validation failed" },
          },
        },
      },
    },
    "planet/{planetId}": {
      summary: "A single planet",
      shared: { parameterSchema: { path: { type: "object", required: ["planetId"], properties: { planetId: { type: "string" } } } } },
      requests: {
        getPlanet: {
          method: "get",
          summary: "Get a planet by id",
          tags: ["Planets"],
          "x-suluk-access": { requires: "anyone" },
          "x-suluk-cost": { components: [{ source: "db-read", basis: "per-call", microUsd: 6 }], estimateMicroUsd: 6 },
          responses: {
            ok: { status: 200, contentType: "application/json", contentSchema: { $ref: "#/components/schemas/Planet" } },
            notFound: { status: 404, description: "No such planet" },
          },
        },
        deletePlanet: {
          method: "delete",
          summary: "Delete a planet",
          tags: ["Planets"],
          security: [{ bearerAuth: [] }],
          "x-suluk-access": { requires: "admin" },
          responses: { deleted: { status: 204, description: "Deleted" }, notFound: { status: 404, description: "No such planet" } },
        },
      },
    },
    checkout: {
      summary: "Pay — as a guest or as a member (two requests, one method)",
      requests: {
        guestCheckout: {
          method: "post",
          summary: "Checkout as a guest",
          description: "No account needed. Shares `POST /checkout` with `memberCheckout` — v4 only.",
          tags: ["Checkout"],
          "x-suluk-access": { requires: "anyone" },
          "x-suluk-cost": { components: [{ source: "stripe", basis: "per-call", microUsd: 250 }], estimateMicroUsd: 250 },
          contentType: "application/json",
          contentSchema: { $ref: "#/components/schemas/GuestCheckout" },
          responses: {
            ok: { status: 200, contentType: "application/json", contentSchema: { $ref: "#/components/schemas/Order" } },
            invalid: { status: 400, description: "Bad cart" },
          },
        },
        memberCheckout: {
          method: "post",
          summary: "Checkout as a signed-in member",
          description: "Uses the member's saved details + loyalty. Same `POST /checkout`, a distinct named request.",
          tags: ["Checkout"],
          security: [{ bearerAuth: [] }],
          "x-suluk-access": { requires: "authenticated" },
          "x-suluk-cost": { components: [{ source: "stripe", basis: "per-call", microUsd: 250 }, { source: "db-read", basis: "per-call", microUsd: 10 }], estimateMicroUsd: 260 },
          contentType: "application/json",
          contentSchema: { $ref: "#/components/schemas/MemberCheckout" },
          responses: {
            ok: { status: 200, contentType: "application/json", contentSchema: { $ref: "#/components/schemas/Order" } },
            invalid: { status: 400, description: "Bad cart" },
          },
        },
      },
    },
    token: {
      summary: "Auth tokens",
      requests: {
        createToken: {
          method: "post",
          summary: "Exchange credentials for a bearer token",
          tags: ["Auth"],
          "x-suluk-access": { requires: "anyone" },
          contentType: "application/json",
          contentSchema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 } } },
          responses: {
            ok: { status: 200, contentType: "application/json", contentSchema: { type: "object", properties: { token: { type: "string" }, expiresAt: { type: "string", format: "date-time" } } } },
            denied: { status: 401, description: "Bad credentials" },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Planet: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string", description: "Stable id" },
          name: { type: "string" },
          type: { type: "string", enum: ["terrestrial", "gas-giant", "ice-giant", "dwarf"] },
          moons: { type: "integer", minimum: 0, default: 0 },
        },
      },
      PlanetInput: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", minLength: 1 }, type: { type: "string", enum: ["terrestrial", "gas-giant", "ice-giant", "dwarf"] }, moons: { type: "integer", minimum: 0 } },
      },
      GuestCheckout: {
        type: "object",
        required: ["items", "email"],
        properties: { items: { type: "array", items: { $ref: "#/components/schemas/CartLine" } }, email: { type: "string", format: "email" } },
      },
      MemberCheckout: {
        type: "object",
        required: ["items"],
        properties: { items: { type: "array", items: { $ref: "#/components/schemas/CartLine" } }, useLoyalty: { type: "boolean", default: false } },
      },
      CartLine: { type: "object", required: ["planetId", "qty"], properties: { planetId: { type: "string" }, qty: { type: "integer", minimum: 1 } } },
      Order: {
        type: "object",
        required: ["id", "totalMicroUsd", "status"],
        properties: { id: { type: "string" }, totalMicroUsd: { type: "integer" }, status: { type: "string", enum: ["pending", "paid", "cancelled"] } },
      },
    },
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer" },
      apiKey: { type: "apiKey", name: "x-api-key", in: "header" },
    },
  },
};

/** A minimal starter — the smallest valid v4 document, to author up from. */
const MINIMAL: unknown = {
  openapi: "4.0.0-candidate",
  info: { title: "My API", version: "0.1.0" },
  paths: {
    ping: {
      requests: {
        ping: {
          method: "get",
          summary: "Health check",
          responses: { ok: { status: 200, contentType: "application/json", contentSchema: { type: "object", properties: { ok: { type: "boolean" } } } } },
        },
      },
    },
  },
};

/** A standard OpenAPI 3.1 document — open it, then hit "Upgrade from 3.1" to convert it to v4 in place. */
const OPENAPI_31: unknown = {
  openapi: "3.1.0",
  info: { title: "Bookstore (OpenAPI 3.1)", version: "1.0.0", description: "A plain 3.1 doc. Click **Upgrade from 3.1** to convert it to native v4." },
  paths: {
    "/books": {
      get: {
        summary: "List books",
        parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Book" } } } } } },
      },
      post: {
        summary: "Add a book",
        requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/books/{id}": {
      get: {
        summary: "Get a book",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } }, "404": { description: "Not found" } },
      },
    },
  },
  components: {
    schemas: { Book: { type: "object", required: ["title"], properties: { id: { type: "string" }, title: { type: "string" }, author: { type: "string" } } } },
  },
};

export const examples: EditorExample[] = [
  { id: "galaxy", label: "Suluk Galaxy", description: "v4 showcase — multi-request per method + cost/access facets", doc: SULUK_GALAXY },
  { id: "minimal", label: "Minimal starter", description: "Smallest valid v4 document", doc: MINIMAL },
  { id: "openapi31", label: "OpenAPI 3.1 → upgrade me", description: "A plain 3.1 doc to try the upgrade button", doc: OPENAPI_31 },
];

export const defaultExample = examples[0];
