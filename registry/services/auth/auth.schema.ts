/**
 * Better Auth schema (Suluk registry: `auth`) — the core tables (user/session/account/verification) + the `apikey` and
 * `passkey` plugin tables, for the drizzle adapter.
 *
 * Reconciled against **Better Auth v1.6.23** (canonical, extracted from the installed package). Better Auth's schema IS
 * version + plugin dependent, so treat `npx @better-auth/cli generate` as the source of truth if you change your plugin
 * set or bump the version — then regenerate this file. Timestamps are epoch integers (drizzle `timestamp` mode); booleans
 * are 0/1 integers. The `apikey` table here is what the `keys` module's cascade-revoke soft-disables (`enabled = 0`).
 */
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull(),
  image: text("image"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  providerId: text("providerId").notNull(),
  accountId: text("accountId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  identifier: text("identifier").notNull(),
});

export const apikey = sqliteTable(
  "apikey",
  {
    id: text("id").primaryKey(),
    /** the api-key plugin's multi-configuration router (v1.6+). Required; defaults to "default". */
    configId: text("configId").notNull().default("default"),
    name: text("name"),
    start: text("start"),
    /** stable external reference for this key (v1.6+). Required. */
    referenceId: text("referenceId").notNull(),
    prefix: text("prefix"),
    key: text("key").notNull(),
    refillInterval: integer("refillInterval"),
    refillAmount: integer("refillAmount"),
    lastRefillAt: integer("lastRefillAt", { mode: "timestamp" }),
    enabled: integer("enabled", { mode: "boolean" }).default(true),
    rateLimitEnabled: integer("rateLimitEnabled", { mode: "boolean" }).default(true),
    rateLimitTimeWindow: integer("rateLimitTimeWindow").default(60),
    rateLimitMax: integer("rateLimitMax").default(10),
    requestCount: integer("requestCount").default(0),
    remaining: integer("remaining"),
    lastRequest: integer("lastRequest", { mode: "timestamp" }),
    expiresAt: integer("expiresAt", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    permissions: text("permissions"),
    metadata: text("metadata"),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    configIdIdx: index("apikey_configId_idx").on(t.configId),
    referenceIdIdx: index("apikey_referenceId_idx").on(t.referenceId),
    keyIdx: index("apikey_key_idx").on(t.key),
  }),
);

export const passkey = sqliteTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("publicKey").notNull(),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credentialID").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("deviceType").notNull(),
    backedUp: integer("backedUp", { mode: "boolean" }).notNull(),
    transports: text("transports"),
    createdAt: integer("createdAt", { mode: "timestamp" }),
    aaguid: text("aaguid"),
  },
  (t) => ({
    userIdIdx: index("passkey_userId_idx").on(t.userId),
    credentialIDIdx: index("passkey_credentialID_idx").on(t.credentialID),
  }),
);

// ── OAuth 2.1 authorization-server tables (Better Auth `mcp()` = oidc-provider). Only needed when opts.mcp is enabled. ──
export const oauthApplication = sqliteTable("oauthApplication", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  metadata: text("metadata"),
  clientId: text("clientId").notNull().unique(),
  clientSecret: text("clientSecret"),
  redirectUrls: text("redirectUrls").notNull(),
  type: text("type").notNull(),
  disabled: integer("disabled", { mode: "boolean" }).default(false),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const oauthAccessToken = sqliteTable("oauthAccessToken", {
  id: text("id").primaryKey(),
  accessToken: text("accessToken").notNull().unique(),
  refreshToken: text("refreshToken").unique(),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  clientId: text("clientId").notNull().references(() => oauthApplication.clientId, { onDelete: "cascade" }),
  userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const oauthConsent = sqliteTable("oauthConsent", {
  id: text("id").primaryKey(),
  clientId: text("clientId").notNull().references(() => oauthApplication.clientId, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  scopes: text("scopes").notNull(),
  consentGiven: integer("consentGiven", { mode: "boolean" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});
