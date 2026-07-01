[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / eventCostEvent

# Function: eventCostEvent()

> **eventCostEvent**(`input`): [`CostEvent`](../interfaces/CostEvent.md)

Defined in: [event.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/c1aead3c4d317f73b0e055f0bc85bdb50e0c8a74/tooling/ts/packages/cost/src/event.ts#L78)

Build the CostEvent for a FIRED background event — pure. Stamps the trigger, resolves principal + dedupeKey,
 and (C026) uses the payload-reconciled amount as the authoritative total when the model declares one.

## Parameters

### input

[`EventCostInput`](../interfaces/EventCostInput.md)

## Returns

[`CostEvent`](../interfaces/CostEvent.md)
