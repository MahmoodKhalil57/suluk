[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / TITLE\_BY\_TAG

# Variable: TITLE\_BY\_TAG

> `const` **TITLE\_BY\_TAG**: `Readonly`\<`Record`\<[`ErrorTag`](../type-aliases/ErrorTag.md), `string`\>\>

Defined in: [errors.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/core/src/errors.ts#L49)

Human-readable `title` per tag (RFC-9457 §3.1.1: `title` is human, `type` is the machine id). The STATIC
saastarter strings are ported verbatim where one exists; the rest derive a sensible title (saastarter built
those messages from dynamic data — e.g. `${resource} not found` — so there is no static string to port).
