[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / [Specification](../Specification.md) / Reference Core — Rust (suluk-core)

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

A Rust counterpart to [`@suluk/core`](https://github.com/MahmoodKhalil57/suluk)'s portable
algorithms: parse a v4 document, compute canonical request **signatures**, reverse-parse
**uriTemplates**, and match concrete requests to operations (the ADA). A second, independent
implementation is part of what makes the spec's algorithms a *standard* rather than a single
codebase.

## Install

```sh
cargo add suluk-core
```

## The Suluk cycle

`suluk-core` is the native station on the Suluk walk — author one v4 source, then **validate ·
audit · preview · generate · deploy** the whole stack from it. Explore the full toolchain in the
[main repository](https://github.com/MahmoodKhalil57/suluk).

## License

Apache-2.0
