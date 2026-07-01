[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / Oklch

# Interface: Oklch

Defined in: [oklch.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/theme/src/oklch.ts#L8)

The OKLCH value type (saastarter-parity Phase 1). saastarter's themes are OKLCH (globals.css), the modern
perceptually-uniform color space — lightness, chroma, hue are independent, which is exactly what makes a
deterministic light→dark derivation tractable (you move L without smearing hue). Pure value type + parse/format;
no CSS engine, no deps.

## Properties

### alpha?

> `optional` **alpha?**: `number`

Defined in: [oklch.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/theme/src/oklch.ts#L16)

optional alpha, 0 … 1.

***

### c

> **c**: `number`

Defined in: [oklch.ts:12](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/theme/src/oklch.ts#L12)

chroma (colorfulness), ≥ 0 (~0.37 max for sRGB).

***

### h

> **h**: `number`

Defined in: [oklch.ts:14](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/theme/src/oklch.ts#L14)

hue angle in degrees, 0 … 360.

***

### l

> **l**: `number`

Defined in: [oklch.ts:10](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/theme/src/oklch.ts#L10)

perceptual lightness, 0 (black) … 1 (white).
