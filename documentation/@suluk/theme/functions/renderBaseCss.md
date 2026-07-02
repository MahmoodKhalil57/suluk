[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/theme](../README.md) / renderBaseCss

# Function: renderBaseCss()

> **renderBaseCss**(`opts?`): `string`

Defined in: [emit.ts:89](https://github.com/MahmoodKhalil57/suluk/blob/70b4fe70ea462a3da93bfa6f2cfb548af076bf09/tooling/ts/packages/theme/src/emit.ts#L89)

The reusable design-system BASE layer — the accessibility + motion contract every builder inherits, independent
of the scheme colors. Parameterized by CSS-var names so an app on its OWN color vocabulary (not the shadcn role
names) can point it at its own ring/destructive vars. Emits, all reduced-motion-gated:
  - keyboard-only focus rings (`:focus-visible`) on every interactive element — mouse clicks stay clean;
  - the `[aria-invalid]` destructive border+ring contract (app toggles the attribute, theme owns the look);
  - the `.sr-only` + `.skip-link` accessibility utilities (skip-to-content);
  - motion primitives — `shake`/`fade-in-down` (form errors), `[data-reveal]` staggered scroll-reveal, and the
    asymptotic `.navprogress` bar — so each app drives behavior while the look is one inherited source;
  - a GLOBAL `prefers-reduced-motion` baseline that neutralizes all of the above for users who ask for it.

## Parameters

### opts?

[`BaseCssOptions`](../interfaces/BaseCssOptions.md) = `{}`

## Returns

`string`
