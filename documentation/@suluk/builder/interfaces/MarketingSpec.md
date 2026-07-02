[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/builder](../README.md) / MarketingSpec

# Interface: MarketingSpec

Defined in: [marketing.ts:81](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L81)

## Properties

### cta?

> `optional` **cta?**: `object`

Defined in: [marketing.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L89)

#### buttonHref

> **buttonHref**: `string`

#### buttonKey

> **buttonKey**: `string`

#### newsletter?

> `optional` **newsletter?**: `boolean`

#### titleKey

> **titleKey**: `string`

***

### faq?

> `optional` **faq?**: `object`

Defined in: [marketing.ts:88](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L88)

present (even {}) ⇒ include the FAQ section; default source = active Faqs, ordered.

#### source?

> `optional` **source?**: [`ProjectionSource`](ProjectionSource.md)

***

### features?

> `optional` **features?**: `object`

Defined in: [marketing.ts:83](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L83)

#### featureKeys

> **featureKeys**: `string`[]

***

### footer?

> `optional` **footer?**: `object`

Defined in: [marketing.ts:90](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L90)

#### builtWith?

> `optional` **builtWith?**: `string`[]

#### newsletterLabelKey?

> `optional` **newsletterLabelKey?**: `string`

***

### hero

> **hero**: `object`

Defined in: [marketing.ts:82](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L82)

#### ctaHref

> **ctaHref**: `string`

#### ctaKey

> **ctaKey**: `string`

#### subtitleKey?

> `optional` **subtitleKey?**: `string`

#### titleKey

> **titleKey**: `string`

***

### order?

> `optional` **order?**: `string`[]

Defined in: [marketing.ts:92](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L92)

explicit section order; default = every configured section, canonical order.

***

### pricing?

> `optional` **pricing?**: `object`

Defined in: [marketing.ts:84](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L84)

#### currency?

> `optional` **currency?**: `string`

#### plans

> **plans**: [`PlanSpec`](PlanSpec.md)[]

***

### testimonials?

> `optional` **testimonials?**: `object`

Defined in: [marketing.ts:86](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/builder/src/marketing.ts#L86)

present (even {}) ⇒ include the testimonials section; default source = approved Reviews.

#### source?

> `optional` **source?**: [`ProjectionSource`](ProjectionSource.md)
