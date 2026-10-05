"use client";

import { useSession } from "next-auth/react";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function useSessionStatus(): { status: SessionStatus } {
  const { status } = useSession();
  return { status };
}
