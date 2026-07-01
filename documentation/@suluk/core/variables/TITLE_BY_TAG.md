[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / TITLE\_BY\_TAG

# Variable: TITLE\_BY\_TAG

> `const` **TITLE\_BY\_TAG**: `Readonly`\<`Record`\<[`ErrorTag`](../type-aliases/ErrorTag.md), `string`\>\>

Defined in: [errors.ts:49](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/core/src/errors.ts#L49)

Human-readable `title` per tag (RFC-9457 §3.1.1: `title` is human, `type` is the machine id). The STATIC
saastarter strings are ported verbatim where one exists; the rest derive a sensible title (saastarter built
those messages from dynamic data — e.g. `${resource} not found` — so there is no static string to port).
