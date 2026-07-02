[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / TemplateContext

# Interface: TemplateContext

Defined in: [templates.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/templates.ts#L13)

Shared context for every template — the brand + the active-locale catalog (merged over English defaults).

## Properties

### brand

> **brand**: [`EmailBrand`](EmailBrand.md)

Defined in: [templates.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/templates.ts#L14)

***

### dir?

> `optional` **dir?**: `"ltr"` \| `"rtl"`

Defined in: [templates.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/templates.ts#L17)

***

### lang?

> `optional` **lang?**: `string`

Defined in: [templates.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/templates.ts#L18)

***

### messages?

> `optional` **messages?**: [`Catalog`](../../i18n/type-aliases/Catalog.md)

Defined in: [templates.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/templates.ts#L16)

the email-namespace catalog for the active locale (@suluk/i18n).

***

### year?

> `optional` **year?**: `number`

Defined in: [templates.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/0d44883ee3fb031bfb991981eb925e438e45c79f/tooling/ts/packages/email/src/templates.ts#L19)
