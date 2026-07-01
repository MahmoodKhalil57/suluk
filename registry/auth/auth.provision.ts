/**
 * The `auth` provision FRAGMENT — the Better Auth tables on the shared app D1, created FIRST (the `user` table other
 * modules reference). ⚠ SCAFFOLD SQL — regenerate against `npx @better-auth/cli generate` for byte-exactness with your
 * Better Auth version + plugin set. Merged into your `provision.config.ts`.
 */
import type { InstanceSpec } from "@suluk/provision";

const AUTH_MIGRATION = `
CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, emailVerified INTEGER NOT NULL DEFAULT 0, image TEXT, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, token TEXT NOT NULL UNIQUE, expiresAt INTEGER NOT NULL, ipAddress TEXT, userAgent TEXT, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, accountId TEXT NOT NULL, providerId TEXT NOT NULL, accessToken TEXT, refreshToken TEXT, idToken TEXT, accessTokenExpiresAt INTEGER, refreshTokenExpiresAt INTEGER, scope TEXT, password TEXT, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY, identifier TEXT NOT NULL, value TEXT NOT NULL, expiresAt INTEGER NOT NULL, createdAt INTEGER, updatedAt INTEGER);
CREATE TABLE IF NOT EXISTS apikey (id TEXT PRIMARY KEY, name TEXT, start TEXT, prefix TEXT, key TEXT NOT NULL, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, refillInterval INTEGER, refillAmount INTEGER, lastRefillAt INTEGER, enabled INTEGER DEFAULT 1, rateLimitEnabled INTEGER DEFAULT 0, rateLimitTimeWindow INTEGER, rateLimitMax INTEGER, requestCount INTEGER DEFAULT 0, remaining INTEGER, lastRequest INTEGER, expiresAt INTEGER, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, permissions TEXT, metadata TEXT);
CREATE TABLE IF NOT EXISTS passkey (id TEXT PRIMARY KEY, name TEXT, publicKey TEXT NOT NULL, userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, credentialID TEXT NOT NULL, counter INTEGER NOT NULL, deviceType TEXT NOT NULL, backedUp INTEGER NOT NULL, transports TEXT, createdAt INTEGER, aaguid TEXT);
`.trim();

export const authProvision: InstanceSpec[] = [
  {
    ref: "db",
    service: "cloudflare-d1",
    name: "app-db",
    params: { migrations: [{ name: "0000_auth", sql: AUTH_MIGRATION }] },
    bind: { database_id: "CLOUDFLARE_D1_ID" },
    protected: true,
  },
];
