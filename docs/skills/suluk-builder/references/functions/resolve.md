# Functions

## resolve

### `resolveParams`
Effective param values: defaults, then a variant preset, then consumer props (only keys in `params`).
```ts
resolveParams(doc: DslDocument, variant: string | undefined, props: Record<string, unknown> | undefined): Record<string, unknown>
```
**Parameters:**
- `doc: DslDocument`
- `variant: string | undefined`
- `props: Record<string, unknown> | undefined`
**Returns:** `Record<string, unknown>`

### `resolveList`
The effective ordered selection for a `list` param. The default is the spec default (or all options).
A consumer selection is applied only as far as the controls allow:
  include → may add options not in the default ; hide → may drop ; reorder → may change order ;
  repeat  → may list an option more than once.
Returns the resolved ordered list (catalog keys).
```ts
resolveList(spec: { type: "list"; options: string[]; controls: ListControl[]; default?: string[] }, selection: string[] | undefined): string[]
```
**Parameters:**
- `spec: { type: "list"; options: string[]; controls: ListControl[]; default?: string[] }`
- `selection: string[] | undefined`
**Returns:** `string[]`
