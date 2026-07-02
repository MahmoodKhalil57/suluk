# Functions

## skill

### `contentHash`
A short, stable content hash of an instructions snapshot.
```ts
contentHash(instructions: string): string
```
**Parameters:**
- `instructions: string`
**Returns:** `string`

### `renderSkillMd`
Render a Claude SKILL.md: YAML frontmatter (name + description) + a GENERATED stamp carrying source, the
computed contentHash, and version — then the instructions body verbatim. Deterministic in its inputs.
```ts
renderSkillMd(input: SkillRenderInput): string
```
**Parameters:**
- `input: SkillRenderInput`
**Returns:** `string`
