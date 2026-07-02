[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/drizzle](../README.md) / SoftDeleteOptions

# Interface: SoftDeleteOptions

Defined in: [mutations.ts:9](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/mutations.ts#L9)

CrudOptions runtime helpers (saastarter-parity Phase 1): pure value-builders for soft-delete, anonymize-on-delete,
and server-managed timestamps. The package projects CONTRACTS (it runs no SQL), so these produce the PATCH an
app's Drizzle handler applies — keeping the policy (which column is `deletedAt`, which columns to redact) in one
place. anonymizeValues is the row-level counterpart of @suluk/better-auth's GDPR erasure cascade (the keep-record,
FK-safe posture).

## Properties

### column?

> `optional` **column?**: `string`

Defined in: [mutations.ts:11](https://github.com/MahmoodKhalil57/suluk/blob/84f6cb98bf3145a19eb32e3dedc636cf3a1a9d0b/tooling/ts/packages/drizzle/src/mutations.ts#L11)

the timestamp column set on delete (default "deletedAt").
