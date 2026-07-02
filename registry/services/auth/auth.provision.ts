/**
 * The `auth` provision FRAGMENT — the Better Auth tables on the shared app D1, created FIRST (the `user` table other
 * modules reference). Reconciled against **Better Auth v1.6.23** (canonical, extracted from the installed package): the
 * `apikey` table carries `configId` + `referenceId` (the v1.6 api-key plugin requires them), `rateLimitEnabled` defaults
 * to 1, and the five plugin indexes are created. Regenerate against `npx @better-auth/cli generate` if you change your
 * Better Auth version or plugin set. Merged into your `provision.config.ts`.
 */
import type { InstanceSpec } from "@suluk/provision";

const AUTH_MIGRATION = `
CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, email TEXT NOT NULL UNIQUE, emailVerified INTEGER NOT NULL DEFAULT 0, name TEXT NOT NULL, image TEXT);
CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, expiresAt INTEGER NOT NULL, token TEXT NOT NULL UNIQUE, ipAddress TEXT, userAgent TEXT);
CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, providerId TEXT NOT NULL, accountId TEXT NOT NULL, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt INTEGER, refreshTokenExpiresAt INTEGER, scope TEXT, password TEXT);
CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, value TEXT NOT NULL, expiresAt INTEGER NOT NULL, identifier TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS apikey (id TEXT PRIMARY KEY, configId TEXT NOT NULL DEFAULT 'default', name TEXT, start TEXT, referenceId TEXT NOT NULL, prefix TEXT, key TEXT NOT NULL, refillInterval INTEGER, refillAmount INTEGER, lastRefillAt INTEGER, enabled INTEGER DEFAULT 1, rateLimitEnabled INTEGER DEFAULT 1, rateLimitTimeWindow INTEGER DEFAULT 60, rateLimitMax INTEGER DEFAULT 10, requestCount INTEGER DEFAULT 0, remaining INTEGER, lastRequest INTEGER, expiresAt INTEGER, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, permissions TEXT, metadata TEXT, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS passkey (id TEXT PRIMARY KEY, name TEXT, publicKey TEXT NOT NULL, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, credentialID TEXT NOT NULL, counter INTEGER NOT NULL, deviceType TEXT NOT NULL, backedUp INTEGER NOT NULL, transports TEXT, createdAt INTEGER, aaguid TEXT);
CREATE INDEX IF NOT EXISTS apikey_configId_idx ON apikey(configId);
CREATE INDEX IF NOT EXISTS apikey_referenceId_idx ON apikey(referenceId);
CREATE INDEX IF NOT EXISTS apikey_key_idx ON apikey(key);
CREATE INDEX IF NOT EXISTS passkey_userId_idx ON passkey(userId);
CREATE INDEX IF NOT EXISTS passkey_credentialID_idx ON passkey(credentialID);
`.trim();

// The OAuth 2.1 authorization-server tables (Better Auth `mcp()` = oidc-provider) — only needed when opts.mcp is enabled.
const AUTH_OAUTH_MIGRATION = `
CREATE TABLE IF NOT EXISTS oauthApplication (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT, metadata TEXT, clientId TEXT NOT NULL UNIQUE, clientSecret TEXT, redirectUrls TEXT NOT NULL, type TEXT NOT NULL, disabled INTEGER DEFAULT 0, userId TEXT REFERENCES user(id) ON DELETE CASCADE, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS oauthAccessToken (id TEXT PRIMARY KEY, accessToken TEXT NOT NULL UNIQUE, refreshToken TEXT UNIQUE, accessTokenExpiresAt INTEGER, refreshTokenExpiresAt INTEGER, clientId TEXT NOT NULL REFERENCES oauthApplication(clientId) ON DELETE CASCADE, userId TEXT REFERENCES user(id) ON DELETE CASCADE, scopes TEXT NOT NULL, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS oauthConsent (id TEXT PRIMARY KEY, clientId TEXT NOT NULL REFERENCES oauthApplication(clientId) ON DELETE CASCADE, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, scopes TEXT NOT NULL, consentGiven INTEGER NOT NULL, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS oauthApplication_userId_idx ON oauthApplication(userId);
CREATE INDEX IF NOT EXISTS oauthAccessToken_clientId_idx ON oauthAccessToken(clientId);
CREATE INDEX IF NOT EXISTS oauthAccessToken_userId_idx ON oauthAccessToken(userId);
CREATE INDEX IF NOT EXISTS oauthConsent_clientId_idx ON oauthConsent(clientId);
CREATE INDEX IF NOT EXISTS oauthConsent_userId_idx ON oauthConsent(userId);
`.trim();

export const authProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0000_auth", sql: AUTH_MIGRATION }, { name: "0001_auth_oauth", sql: AUTH_OAUTH_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
