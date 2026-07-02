[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / PathSegment

# Type Alias: PathSegment

> **PathSegment** = \{ `kind`: `"literal"`; `value`: `string`; \} \| \{ `kind`: `"var"`; `multi`: `boolean`; `name`: `string`; \}

Defined in: [template.ts:7](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/template.ts#L7)

uriTemplate compile + match + reverse-parse — the RFC6570 parseable-profile tooling default (C005, C019 §A.4).
Buildable subset: literal segments, single-segment `{var}`, leading-slash multi-segment `{+var}`, and a
query key-set (`{?a,b}`, `{&a}`, or `?a={a}`). Split-BEFORE-decode (the §2.4 bug-fix). Provisional @0.62.
