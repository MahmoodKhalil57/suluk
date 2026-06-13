# OpenAPI v4.0 "Suluk" Candidate — Confidence Map & Soft Points

> For anyone building on this candidate (vscode extension, TS library, validator, codegen): this is an
> honest map of **where the candidate is most provisional** and **what would harden each point**. Every
> decision carries a mizan-gated confidence ceiling; the whole ledger is `burhan-converge`-clean and
> perturbation-robust. **Treat the @0.5–0.55 decisions below as the most likely to change** — design tooling
> so they are isolated/configurable.

## Distribution (251 claims)

| Ceiling band | Count | Meaning |
|---|---|---|
| **@0.85** | ~59 | Strong: multi-aspect inherited backbone (collections-are-maps, by-name identity, dialect, paths-are-uriTemplate) |
| @0.6–0.8 | ~95 | Solid candidate decisions, sole-witness-capped (+ C030 router-delegation @0.76) |
| **@0.5–0.58** | ~40 | **Softest** — contested shapes, Originated inventions (incl. the whole **agent layer C027–C030** + **cost/jobs C024–C026**), provisional tooling defaults (below) |

Audit (`mizan_verify_claim` / `burhan-converge`, 2026-06-13): **converge-clean, 251 claims, 7 load-bearing all witnessed, 0 contradictions.** The soft claims are **sole-witness, bcmea-clean, declared ≤ recommended cap** — honestly capped, *not* inflated. They lift only with an independent witness (a second corroborating source) or SIG ratification. The agent layer (below) is the **newest + most Originated** band — there is no SIG prior for it at all.

## The softest decisions (@0.5–0.55) — and how to harden each

| Decision | Ceiling | What would harden it |
|---|---|---|
| **No declared signature-style indicator** (#16) — overrides earth2marsh's stub | 0.5 | SIG ratification of the signature mechanism, or a 2nd voice corroborating uniform/implicit |
| **PR#183 declared `signature` array → optional** (#16 D2) | 0.5 | the SIG merging or rejecting PR#183 |
| **Tags flip array→map** (#83) | 0.5 | the #67 tags-upgrade proposal landing |
| **Links scoped baseline** (#58), **server hints** (#56), **order field** (#20 subq4) | 0.5 | dedicated panels / SIG signal — these are thin single-voice areas |
| **`$ref` pointer-vs-name policy, inline-restriction** (#73) | 0.5 | the deferred referencing fragment grammar (#26/#49/#72) |
| **Path inheritance `shared`** (#116) | 0.55 | a 2nd witness; the proposal used pathItem-level params directly |
| **Responses stay named-map** (#83) | 0.55 | corroboration; the array camp (kevinswiber et al.) was real |
| **D1: JSON-Schema out of the static matcher** | 0.55 (mizan floor 0.139) | **the weakest load-bearing guardrail** — an independent witness, or the SIG ratifying JSON-Schema-in-matcher would *overturn* it |
| **Callbacks/webhooks** (#upgrade gap, C018) | 0.55 | Originated; SIG design or async-spec alignment |
| **Tooling defaults** (C019: reference/signature/deserialization grammars) | 0.55 | the deferred grammars ratifying (#26/#49/#72, C003, #100/#108) |
| **Upgrade coverage 55–70%** (C017) | 0.5 | building the actual transformer + measuring on a real corpus |
| **Cost-on-event + `x-suluk-jobs`** (C024–C026, §15) | 0.58 | Originated vendor extension; a real fleet exercising attribution + reconciliation (the `costCeiling` *enforcement* runtime is RESERVED) |
| **`x-suluk-agents` composition** (C027, §16) | 0.52 | Originated, no SIG prior; a 2nd real or nested agent beyond Conin (the recursion reopen-trigger) — today: cycle/depth-lint + schema slot only |
| **`x-suluk-policy` governance** (C028, §17) | 0.52 | Originated; the `costCeiling` enforcement runtime + a governed fleet; the determinism-gate mandate is OPEN |
| **Thinking bound** (C029, §17) — `{maxRounds,budget}`, no `stopCondition` | 0.55 | Originated bound; a 2nd agent that needs richer within-agent control would reopen the vocabulary |
| **Model resolution + ZDR-router** (C030, §17) | 0.72 | live-probe-verified (2026-06-13) that `provider.zdr`+`openrouter/auto` combine; an independent witness on strict non-ZDR-endpoint *exclusion*, + operator-governed-ZDR (needs a policy retention vocab) |

## Practical guidance for tool authors

- **Build against the high-confidence backbone freely** (the canonical model §1, by-name identity, uriTemplate paths, per-location slots, 2020-12 dialect — all @0.85).
- **Isolate the @0.5–0.55 points** behind interfaces/flags: the signature *encoding*, the reference *fragment* spelling, the query/header *deserialization*, and the inheritance `shared` mechanism are the ones a future ratification is most likely to change. The C019 Appendix A defaults are interoperable *today*, but pin your tool's version.
- **D1 is the one to watch**: the "JSON Schema stays out of the static matcher" guardrail is soft (mizan floor 0.139). A tool that compiles parameterSchema into its router is taking a position the candidate explicitly declines — keep matching (signature) and validation (schema) as separate stages.
- **The agent layer (`x-suluk-agents`/`x-suluk-policy`, §16–§17) is the newest, most Originated surface** — no SIG prior at all. The composition shape (skills / routes-are-`$ref`s / cycle-linted sub-agents) is buildable today, but isolate the soft edges: recursion is **one-hop-only** (cycle/depth-lint + schema slot, no runtime machinery), `costCeiling` is **declared-not-enforced**, the thinking bound has **no `stopCondition`**, and model selection **delegates to `@suluk/models`** (NEEDS not frozen ids). Crucially the D1 invariant **extends here**: the request matcher never reads an `x-suluk-agents` / `modelResolve` / `x-suluk-policy` field — selection and governance are a runtime-advisory overlay, never part of routing.
