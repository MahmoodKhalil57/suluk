# Types & Enums

## billing.pricing

### `CreditPack`
**Properties:**
- `id: string`
- `credits: number`
- `priceCents: number`
- `label: string`

## billing.service

### `PaymentAlertRow`
A payment-health flag row as the UI reads it.
**Properties:**
- `id: string`
- `kind: string`
- `detail: string | null`
- `createdAt: number`
