// apps/web/src/app/api/auth/[...nextauth]/route.ts
// Auth.js v5 route handler (BE-09). Mounts at /api/auth/*.

import NextAuth from "next-auth";
import { getAuthOptions } from "@/server/auth/config";

const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };
