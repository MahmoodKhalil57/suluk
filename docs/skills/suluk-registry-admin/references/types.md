# Types & Enums

## admin.service

### `AdminStats`
The admin dashboard aggregate: the generic ledger stats + the module-owned transaction count. `users` is the app's to
 add (it owns the user table) — left optional so the shape is stable whether or not you compose the count in.
**Properties:**
- `transactions: number`
- `users: number` (optional)
