[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/shadcn](../README.md) / FieldSpec

# Interface: FieldSpec

Defined in: [spec.ts:26](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L26)

One form control, derived from a single object property.

## Properties

### description?

> `optional` **description?**: `string`

Defined in: [spec.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L36)

Schema `description`, if any (rendered as helper text).

***

### label

> **label**: `string`

Defined in: [spec.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L30)

Human label (title if present, else the humanised name).

***

### max?

> `optional` **max?**: `number`

Defined in: [spec.ts:41](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L41)

***

### min?

> `optional` **min?**: `number`

Defined in: [spec.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L40)

Numeric bounds (minimum/maximum) — surfaced on number/date inputs.

***

### name

> **name**: `string`

Defined in: [spec.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L28)

Property name = react-hook-form field name.

***

### options?

> `optional` **options?**: `string`[]

Defined in: [spec.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L38)

Allowed values for a `select` (the enum members, stringified).

***

### pattern?

> `optional` **pattern?**: `string`

Defined in: [spec.ts:43](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L43)

String `pattern` (regex source) — surfaced as a hint.

***

### relation?

> `optional` **relation?**: `string`

Defined in: [spec.ts:45](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L45)

For a `relation` widget: the entity this property references (from `x-suluk-relation`).

***

### required

> **required**: `boolean`

Defined in: [spec.ts:34](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L34)

Whether the property is in the object's `required[]`.

***

### widget

> **widget**: [`FieldWidget`](../type-aliases/FieldWidget.md)

Defined in: [spec.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/shadcn/src/spec.ts#L32)

Which shadcn control to render.
