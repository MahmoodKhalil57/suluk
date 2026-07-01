[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/panel](../README.md) / FieldType

# Type Alias: FieldType

> **FieldType** = `"text"` \| `"textarea"` \| `"richtext"` \| `"number"` \| `"boolean"` \| `"select"` \| `"date"` \| `"datetime"` \| `"email"` \| `"url"` \| `"media"` \| `"json"` \| `"relationship"`

Defined in: [fields.ts:8](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/panel/src/fields.ts#L8)

Field-type inference — the Payload-parity core, contract-first. Given an entity's JSON-Schema (from the v4 doc's
components.schemas), infer the Payload-style field set: the right widget per property (text/textarea/number/
boolean/select/date/email/url/json/richtext/relationship), required/nullable, enum options, and relationships
(a `<entity>Id` whose `<Entity>` is itself an entity). No config DSL — the contract IS the config.
