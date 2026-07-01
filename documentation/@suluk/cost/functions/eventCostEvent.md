[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/cost](../README.md) / eventCostEvent

# Function: eventCostEvent()

> **eventCostEvent**(`input`): [`CostEvent`](../interfaces/CostEvent.md)

Defined in: [event.ts:78](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/cost/src/event.ts#L78)

Build the CostEvent for a FIRED background event — pure. Stamps the trigger, resolves principal + dedupeKey,
 and (C026) uses the payload-reconciled amount as the authoritative total when the model declares one.

## Parameters

### input

[`EventCostInput`](../interfaces/EventCostInput.md)

## Returns

[`CostEvent`](../interfaces/CostEvent.md)
