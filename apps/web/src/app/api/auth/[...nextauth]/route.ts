// apps/web/src/app/api/auth/[...nextauth]/route.ts
// Auth.js v5 route handler (BE-09). Mounts at /api/auth/*.
// FR-AUTH-005: every successful sign-in cancels a pending account.delete job
// (re-login within the cool-off restores the account).

import NextAuth from "next-auth";
import { getAuthOptions } from "@/server/auth/config";
import { getDb } from "@/server/db";
import { logger } from "@/server/logging";
import { PgMeRepository } from "@/server/repositories/me";
import { getDeletionQueue } from "@/server/services/deletion-queue";
import { cancelPendingDeletion } from "@/server/services/me";

const handler = NextAuth(
  getAuthOptions({
    onSignIn: (userId) => {
      cancelPendingDeletion(new PgMeRepository(getDb()), getDeletionQueue(), userId).catch(
        (err: unknown) => {
          logger.warn({ userId, err: String(err) }, "could not cancel pending account deletion");
        },
      );
    },
  }),
);

export { handler as GET, handler as POST };
