[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/i18n](../README.md) / LocaleDef

# Interface: LocaleDef

Defined in: [locale.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/i18n/src/locale.ts#L12)

One locale in an app's set.

## Properties

### code

> **code**: `string`

Defined in: [locale.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/i18n/src/locale.ts#L14)

BCP-47 tag, e.g. "en", "ar", "es" (or a region: "ar-EG").

***

### dir?

> `optional` **dir?**: [`Direction`](../type-aliases/Direction.md)

Defined in: [locale.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/i18n/src/locale.ts#L18)

writing direction (default "ltr"; set "rtl" for ar/he/fa/ur).

***

### label?

> `optional` **label?**: `string`

Defined in: [locale.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/i18n/src/locale.ts#L16)

human label in its OWN language (for a picker), e.g. "العربية".

***

### numberingSystem?

> `optional` **numberingSystem?**: `string`

Defined in: [locale.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/i18n/src/locale.ts#L20)

Intl numbering system, e.g. "arab" for Eastern-Arabic numerals (٠١٢٣). Default "latn".
