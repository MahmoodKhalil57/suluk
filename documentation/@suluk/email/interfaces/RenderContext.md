[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/email](../README.md) / RenderContext

# Interface: RenderContext

Defined in: [render.ts:39](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/render.ts#L39)

## Properties

### brand

> **brand**: [`EmailBrand`](EmailBrand.md)

Defined in: [render.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/render.ts#L40)

***

### dir?

> `optional` **dir?**: `"ltr"` \| `"rtl"`

Defined in: [render.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/render.ts#L44)

writing direction for <html dir> (default "ltr").

***

### lang?

> `optional` **lang?**: `string`

Defined in: [render.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/render.ts#L46)

BCP-47 lang for <html lang> (default "en").

***

### messages?

> `optional` **messages?**: [`Catalog`](../../i18n/type-aliases/Catalog.md)

Defined in: [render.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/render.ts#L42)

the email-namespace catalog for the active locale (@suluk/i18n); merged over English defaults.

***

### year?

> `optional` **year?**: `number`

Defined in: [render.ts:48](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/email/src/render.ts#L48)

footer copyright year (default: current year).
