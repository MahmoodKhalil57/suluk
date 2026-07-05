/**
 * `@suluk/core` — the foundation library for the OpenAPI v4.0 "Suluk" candidate.
 *
 * parse → validate (meta-schema) → resolve references (by-name) → compute signatures → build the ADA →
 * match requests. Implements the structural + behavioral contract in
 * specification/candidate-v4/conformance/CONFORMANCE.md and the buildable grammars in SPEC Appendix A (C019).
 * CANDIDATE tooling — provisional; the soft points (CONFIDENCE.md) are isolated here.
 */
export type {
  OpenAPIv4Document, Info, Contact, License, Server, ServerVariable, ExternalDocumentation,
  Tag, PathItem, Shared, Request, HttpMethod, HttpStatusCode, HttpStatus,
  ParameterSchema, Response, Header, Link, Example, Callback, Components,
  SecurityRequirement, SecurityScheme, Reference, SulukSource,
  // JSON Schema 2020-12 model (C099) — the typed source-of-truth for inputs/outputs.
  Schema, SchemaObject, SchemaOrRef, OpaqueSchema, JsonSchemaType, StringFormat,
  SchemaBase, SchemaConstraints, StringKeywords, NumericKeywords, ObjectKeywords, ArrayKeywords,
  StringSchema, NumberSchema, ObjectSchema, ArraySchema, BooleanSchema, NullSchema,
  MultiTypeSchema, UntypedSchema, Discriminator, XmlObject, Static,
  SchemaProperty, PropertyFacets,
  // Discriminated security-scheme model (C099) — the exhaustive companion to the loose SecurityScheme.
  SecuritySchemeObject, ApiKeySecurityScheme, HttpSecurityScheme, OAuth2SecurityScheme,
  OpenIdConnectSecurityScheme, MutualTLSSecurityScheme, OAuthFlows, OAuthFlow,
  SulukRateLimit, SulukDedupe, SulukApproval, SulukJob,
  SulukAgent, SulukSkillRef, SulukRouteRef, SulukAgentRef, SulukPolicy,
  SulukResource, SulukResourceRef,
  SulukStore, SulukNotifyPolicy, SulukNotifySeverity,
  // Event-architecture surface (C100) — CloudEvents 1.0.2 (envelope) + AsyncAPI 3.x (document); the async twin of the doc model.
  CloudEventV1, CloudEventV1Attributes, CloudEventV1OptionalAttributes, CloudEventSpecVersion, CloudEventContentMode,
  AsyncApiDocument, AsyncApiInfo, AsyncApiChannel, AsyncApiOperation, AsyncApiMessage, AsyncApiMessageRef,
  AsyncApiComponents, AsyncApiParameter, AsyncApiCorrelationId, AsyncApiMessageExample, AsyncApiVersion, AsyncApiAction,
  // Provisioning facet (C101) — the light "broker intent" annotation @suluk/provision's deriveInstanceSpecs projects.
  SulukProvisionInstance,
  // OSB v2 wire-contract companion (C101) — the third companion model, reference-only (@suluk/provision re-exports these).
  OperationState, JsonObject, Context, Metadata, MaintenanceInfo, DashboardClient,
  Schemas, ServiceInstanceSchema, ServiceBindingSchema, ServiceRequires,
  Plan, Service, CatalogResponse, ServiceInstanceMetadata,
  ServiceInstanceProvisionRequestBody, ServiceInstanceProvisionResponse, ServiceInstanceAsyncOperation,
  ServiceInstanceUpdateRequestBody, ServiceInstancePreviousValues, ServiceInstanceResource,
  AsyncOperation, LastOperationResource,
  ServiceBindingResouceObject, ServiceBindingRequest, ServiceBindingMetadata, ServiceBindingEndpoint,
  ServiceBindingVolumeMountDevice, ServiceBindingVolumeMount, ServiceBindingResponse, ServiceBindingResource,
  ServiceBrokerError,
  // Run-pipeline facet (C104) — an operation's composed pipeline as data (nodes + dependency edges).
  SulukRunGraph, SulukRunNode, SulukRunEdge, SulukRunNodeKind,
} from "./types";
export {
  isCloudEvent, cloudEventEnvelopeSchema,
  CLOUDEVENTS_JSON_CONTENT_TYPE, CLOUDEVENTS_BATCH_JSON_CONTENT_TYPE, CLOUDEVENTS_HEADER_PREFIX,
} from "./types";

export { parseDocument } from "./parse";
export { validateDocument, isValidDocument, type ValidationResult, type ValidationIssue } from "./validate";
export { isReference, resolveRef, deref } from "./reference";
export { sourceIndex, sourceCoverage, scrubSource, sourceKey, type SourceGroup, type SourceRef } from "./source";
export { RATELIMIT_EXT, rateLimitOf, rateLimitIndex, rateLimitCoverage, retryAfterSeconds, type RateLimitGroup } from "./ratelimit";
export {
  PROBLEM_CONTENT_TYPE, PROBLEM_STATUS_TABLE, TITLE_BY_TAG, PROBLEM_DETAILS_SCHEMA,
  PROBLEM_TYPE_BASE, PROBLEM_TYPE_BY_STATUS, PROBLEM_TAG_BY_STATUS, PROBLEM_COMPONENT_BY_STATUS, problemSchemaFor,
  isProblemDetails, toProblemDetails,
  type ProblemDetails, type ProblemStatus, type ErrorTag,
} from "./errors";
export { compileTemplate, matchPath, variableCount, type CompiledTemplate, type PathSegment } from "./template";
export { computeSignature, collide, type SignatureTuple, type CollisionVerdict } from "./signature";
export {
  buildAda, matchRequest, parseQuery,
  type Ada, type Operation, type Collision, type MatchResult,
} from "./ada";
