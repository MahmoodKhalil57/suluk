[**Suluk**](../README.md)

***

[Suluk](../packages.md) / Specification

# Specification

**Suluk is a candidate exploration of OpenAPI v4.0 "Moonwalk"** — an independent, single-contributor draft of
the next OpenAPI. It is **not** the official specification and **not** SIG-ratified. This section is the
specification itself: the object model, request signatures, parameters, responses, schemas, components, and
security.

- **[The Specification](documents/The-Specification.md)** — the full candidate document (sections 1–9).
- **Design notes** — [Signatures](documents/Signatures-&-Request-Matching.md) · [Templating](documents/Templating-System.md) · [Parameters](documents/Parameter-Schema.md) · [Collections](documents/Collections:-Array-vs-Map.md).
- **[Conformance](documents/Conformance.md)** — the valid/invalid test corpus + runner.
- **[Confidence & Soft Points](documents/Confidence-&-Soft-Points.md)** — the honestly-low-ceiling parts.
- **[Reference Core — Rust](documents/Reference-Core-—-Rust-(suluk-core).md)** — the `suluk-core` performance implementation.
- **[Moonwalk Priors](documents/Moonwalk-Priors-(upstream).md)** — the upstream OAI source these decisions inherit from.

## Associated files

- **Meta-schema** — [`v4-meta-schema.json`](https://github.com/MahmoodKhalil57/suluk/blob/main/specification/candidate-v4/v4-meta-schema.json)
- **TypeScript types** — [`v4-types.ts`](https://github.com/MahmoodKhalil57/suluk/blob/main/specification/candidate-v4/v4-types.ts) (the v4 document object model)
- **Example document** — [`petstore.suluk.yaml`](https://github.com/MahmoodKhalil57/suluk/blob/main/specification/candidate-v4/examples/petstore.suluk.yaml)
- **Conformance corpus** — [`conformance/`](https://github.com/MahmoodKhalil57/suluk/tree/main/specification/candidate-v4/conformance)

> The specification is a **projection of the decision ledger** ([ADRs](https://github.com/MahmoodKhalil57/suluk/tree/main/doc/architecture/decisions), C001–C053), not the source of truth — see [Architecture](documents/Architecture.md).
