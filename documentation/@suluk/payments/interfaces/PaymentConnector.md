[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/payments](../README.md) / PaymentConnector

# Interface: PaymentConnector

Defined in: [tooling/ts/packages/payments/src/connector.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L25)

A payment processor behind the unified schema. The CORE flows (authorize/capture/void/refund/sync) are required; the
advanced surfaces (customer, tokenize/vault, recurring, webhook) are OPTIONAL — a connector declares them as it gains
coverage, and the caller feature-detects. A soft decline is returned as `status: FAILURE`, never thrown.

## Properties

### name

> `readonly` **name**: `string`

Defined in: [tooling/ts/packages/payments/src/connector.ts:27](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L27)

the processor id, e.g. "stripe".

## Methods

### authorize()

> **authorize**(`req`): `Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:28](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L28)

#### Parameters

##### req

[`AuthorizeRequest`](AuthorizeRequest.md)

#### Returns

`Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

***

### capture()

> **capture**(`req`): `Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:29](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L29)

#### Parameters

##### req

[`CaptureRequest`](CaptureRequest.md)

#### Returns

`Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

***

### createCustomer()?

> `optional` **createCustomer**(`req`): `Promise`\<\{ `customerId`: `string`; \}\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:36](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L36)

create a processor customer (returns its id).

#### Parameters

##### req

###### email?

`string`

###### metadata?

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<\{ `customerId`: `string`; \}\>

***

### createPaymentSession()?

> `optional` **createPaymentSession**(`req`): `Promise`\<[`ClientSession`](ClientSession.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:51](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L51)

Create a browser-confirmable PAYMENT session (Stripe PaymentIntent client_secret) — the Payment-Element / one-click
 path. The browser confirms with the processor SDK; crediting happens on the webhook, not here.

#### Parameters

##### req

[`CreatePaymentSessionRequest`](CreatePaymentSessionRequest.md)

#### Returns

`Promise`\<[`ClientSession`](ClientSession.md)\>

***

### createSetupSession()?

> `optional` **createSetupSession**(`req`): `Promise`\<[`ClientSession`](ClientSession.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:53](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L53)

Create a browser-confirmable SETUP session (Stripe SetupIntent client_secret) — vault a card without charging.

#### Parameters

##### req

[`CreateSetupSessionRequest`](CreateSetupSessionRequest.md)

#### Returns

`Promise`\<[`ClientSession`](ClientSession.md)\>

***

### handleWebhook()?

> `optional` **handleWebhook**(`raw`, `headers`): `Promise`\<[`WebhookEvent`](WebhookEvent.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:46](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L46)

verify + normalize a processor webhook into a unified event.

#### Parameters

##### raw

`string`

##### headers

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<[`WebhookEvent`](WebhookEvent.md)\>

***

### recurringCharge()?

> `optional` **recurringCharge**(`req`): `Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L42)

charge an established recurring mandate off-session.

#### Parameters

##### req

###### amount

[`MinorAmount`](MinorAmount.md)

###### mandateId

`string`

###### merchantTransactionId

`string`

#### Returns

`Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

***

### recurringRevoke()?

> `optional` **recurringRevoke**(`req`): `Promise`\<`void`\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:44](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L44)

revoke a recurring mandate.

#### Parameters

##### req

###### mandateId

`string`

#### Returns

`Promise`\<`void`\>

***

### recurringSetup()?

> `optional` **recurringSetup**(`req`): `Promise`\<\{ `mandateId`: `string`; \}\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:40](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L40)

set up an off-session mandate for recurring charges.

#### Parameters

##### req

###### customerId

`string`

###### paymentMethod

[`PaymentMethod`](PaymentMethod.md)

#### Returns

`Promise`\<\{ `mandateId`: `string`; \}\>

***

### refund()

> **refund**(`req`): `Promise`\<[`RefundResponse`](RefundResponse.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L31)

#### Parameters

##### req

[`RefundRequest`](RefundRequest.md)

#### Returns

`Promise`\<[`RefundResponse`](RefundResponse.md)\>

***

### sync()

> **sync**(`req`): `Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:32](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L32)

#### Parameters

##### req

[`SyncRequest`](SyncRequest.md)

#### Returns

`Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

***

### tokenize()?

> `optional` **tokenize**(`req`): `Promise`\<\{ `token`: [`Secret`](../type-aliases/Secret.md); \}\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:38](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L38)

vault an instrument → a reusable token (the app/processor vault; the library stores nothing).

#### Parameters

##### req

###### customerId?

`string`

###### paymentMethod

[`PaymentMethod`](PaymentMethod.md)

#### Returns

`Promise`\<\{ `token`: [`Secret`](../type-aliases/Secret.md); \}\>

***

### void()

> **void**(`req`): `Promise`\<[`PaymentResponse`](PaymentResponse.md)\>

Defined in: [tooling/ts/packages/payments/src/connector.ts:30](https://github.com/MahmoodKhalil57/suluk/blob/686a9e1a5deb9fd975e16addda8eab9635242992/tooling/ts/packages/payments/src/connector.ts#L30)

#### Parameters

##### req

[`VoidRequest`](VoidRequest.md)

#### Returns

`Promise`\<[`PaymentResponse`](PaymentResponse.md)\>
