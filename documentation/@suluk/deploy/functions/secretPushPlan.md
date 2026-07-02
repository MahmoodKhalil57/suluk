[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/deploy](../README.md) / secretPushPlan

# Function: secretPushPlan()

> **secretPushPlan**(`secretNames`, `opts?`): [`SecretPushPlan`](../interfaces/SecretPushPlan.md)

Defined in: [secrets.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/6ca20cc58a630d10d850c784bcf2e00a0e69bc7c/tooling/ts/packages/deploy/src/secrets.ts#L22)

The steps to push the named secrets to a Worker. Default: one interactive `wrangler secret put NAME` per secret
(the value is typed at the prompt — never on the command line). `bulk` instead emits a single
`wrangler secret bulk` step + a note to generate the JSON from the DECRYPTED env (@suluk/env decrypt-from-PQC).

## Parameters

### secretNames

`string`[]

### opts?

#### bulk?

`boolean`

#### workerName

`string`

## Returns

[`SecretPushPlan`](../interfaces/SecretPushPlan.md)
