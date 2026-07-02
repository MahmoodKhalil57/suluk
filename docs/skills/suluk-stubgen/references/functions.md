# Functions

## `stubSpec`
Resolve a gap to a renderable spec (inferring name/method/path/fields where not given).
```ts
stubSpec(gap: StubGap): StubSpec
```
**Parameters:**
- `gap: StubGap`
**Returns:** `StubSpec`

## `renderContract`
Render the CONTRACT half — a `@suluk/hono` RouteContract literal to paste into `contractDoc([...])`.
```ts
renderContract(spec: StubSpec): string
```
**Parameters:**
- `spec: StubSpec`
**Returns:** `string`

## `generateStub`
Generate the contract + handler stub for one gap, lowered through a handler target.
```ts
generateStub(gap: StubGap, target: HandlerTarget): GeneratedStub
```
**Parameters:**
- `gap: StubGap`
- `target: HandlerTarget` — default: `honoEffectTarget`
**Returns:** `GeneratedStub`

## `generateStubs`
Generate stubs for many gaps.
```ts
generateStubs(gaps: StubGap[], target: HandlerTarget): GeneratedStub[]
```
**Parameters:**
- `gaps: StubGap[]`
- `target: HandlerTarget` — default: `honoEffectTarget`
**Returns:** `GeneratedStub[]`
