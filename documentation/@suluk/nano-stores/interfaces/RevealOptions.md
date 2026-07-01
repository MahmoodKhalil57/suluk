[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/nano-stores](../README.md) / RevealOptions

# Interface: RevealOptions

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L8)

revealOnScroll — staggered scroll-triggered reveal for lists as a framework-agnostic primitive (saastarter parity:
"list items fade/slide in as they enter the viewport, staggered"). One IntersectionObserver toggles the reveal
class on `[data-reveal]` elements as they enter view; the look (initial hidden + transition + the `--i` stagger
delay) is @suluk/theme base CSS. Degrades gracefully: with no IntersectionObserver (SSR/old) it reveals everything
immediately, and reduced-motion is handled by the CSS, so content is NEVER stuck hidden.

## Properties

### observer?

> `optional` **observer?**: \{(`callback`, `options?`): `IntersectionObserver`; `prototype`: `IntersectionObserver`; \}

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L16)

injectable IntersectionObserver ctor (default global; absent → reveal-all fallback).

#### Parameters

##### callback

`IntersectionObserverCallback`

##### options?

`IntersectionObserverInit`

#### Returns

`IntersectionObserver`

#### prototype

> **prototype**: `IntersectionObserver`

***

### revealedClass?

> `optional` **revealedClass?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L12)

class added on reveal (default "reveal-in").

***

### root?

> `optional` **root?**: \{ `querySelectorAll`: `ArrayLike`\<`Element`\>; \} \| `null`

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L14)

query root (default document).

***

### selector?

> `optional` **selector?**: `string`

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L10)

elements to reveal (default "[data-reveal]").

***

### stagger?

> `optional` **stagger?**: `boolean`

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L18)

set `--i` (index, capped) on each element for the CSS stagger (default true).

***

### staggerCap?

> `optional` **staggerCap?**: `number`

Defined in: [tooling/ts/packages/nano-stores/src/reveal.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/nano-stores/src/reveal.ts#L20)

max stagger index before wrapping (default 12).
