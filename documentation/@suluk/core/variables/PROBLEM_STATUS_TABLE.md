[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / PROBLEM\_STATUS\_TABLE

# Variable: PROBLEM\_STATUS\_TABLE

> `const` **PROBLEM\_STATUS\_TABLE**: `Readonly`\<`Record`\<[`ErrorTag`](../type-aliases/ErrorTag.md), [`ProblemStatus`](../type-aliases/ProblemStatus.md)\>\>

Defined in: [errors.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/aaf30cfa393544c0ef54e004d9e2f37412540fa8/tooling/ts/packages/core/src/errors.ts#L30)

typed-throw → HTTP status, ported verbatim from saastarter route-handler.ts:24-86. Frozen — the single
source of the mapping every package shares. Note `ExternalServiceError` → 502 (route-handler.ts:62-67):
the roadmap's Phase-0 list abbreviated the codes and omitted it; the faithful port keeps it.
