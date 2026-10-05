// apps/web/src/server/auth/config.ts
// Auth.js (NextAuth v5) configuration per BE-09.
// Google OAuth provider, database sessions (30-day sliding), domain allowlist,
// __Secure-temuunair.session cookie, CSRF same-origin checks.

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { isDomainAllowed } from "./allowlist";
import { SESSION_COOKIE_NAME } from "./session";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@temuunair/db/src/schema";

/** 30 days in seconds (BE-09: 30-day sliding sessions). */
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export interface AuthConfigInput {
  googleId: string;
  googleSecret: string;
  allowedDomains: string[];
  databaseUrl: string;
}

/** Optional hooks for the mounting route (FR-AUTH-005 re-login cancellation). */
export interface AuthConfigExtras {
  onSignIn?: (userId: string) => void | Promise<void>;
}

/**
 * Build the Auth.js options object.
 * Accepts explicit inputs so it is testable without process.env.
 */
export function buildAuthOptions(
  input: AuthConfigInput,
  extras?: AuthConfigExtras,
): NextAuthConfig {
  const pool = new Pool({ connectionString: input.databaseUrl });
  const db = drizzle(pool, { schema });
  const onSignIn = extras?.onSignIn;

  return {
    providers: [
      Google({
        clientId: input.googleId,
        clientSecret: input.googleSecret,
      }),
    ],
    adapter: DrizzleAdapter(db),
    session: {
      strategy: "database",
      maxAge: SESSION_MAX_AGE,
    },
    cookies: {
      sessionToken: {
        name: SESSION_COOKIE_NAME,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    ...(onSignIn
      ? {
          events: {
            async signIn({ user }: { user?: { id?: string } }) {
              if (user?.id) await onSignIn(user.id);
            },
          },
        }
      : {}),
    callbacks: {
      async signIn({ user }) {
        // Post-callback domain check (BE-09): reject before user row is created.
        if (!user.email) return false;
        return isDomainAllowed(user.email, input.allowedDomains);
      },
      async session({ session, user }) {
        // Attach the database user id to the session (BE-09 SessionUser shape).
        session.user.id = user.id;
        return session;
      },
    },
  };
}

// Lazy singleton so importing this module in tests does not create a DB pool.
let _options: NextAuthConfig | null = null;

/**
 * The Auth.js options object, built from process.env on first access.
 * In tests, call buildAuthOptions() directly instead.
 * `extras` only apply to the first call (the route module calls this once).
 */
export function getAuthOptions(extras?: AuthConfigExtras): NextAuthConfig {
  if (!_options) {
    _options = buildAuthOptions(
      {
        googleId: process.env.AUTH_GOOGLE_ID ?? "",
        googleSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
        allowedDomains: (process.env.AUTH_ALLOWED_DOMAINS ?? "")
          .split(",")
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean),
        databaseUrl: process.env.DATABASE_URL ?? "",
      },
      extras,
    );
  }
  return _options;
}

/** Named export for the route handler (uses getAuthOptions lazily). */
export const authOptions = new Proxy({} as NextAuthConfig, {
  get(_target, prop) {
    return (getAuthOptions() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
