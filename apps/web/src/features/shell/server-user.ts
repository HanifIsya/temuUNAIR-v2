import { Campus } from "@temuunair/contracts/src/enums";
import { cookies } from "next/headers";

import { requireSessionUser } from "@/server/auth/request-user";
import { getDb } from "@/server/db";
import { DomainError, ErrorCode } from "@/server/errors";
import { PgMeRepository } from "@/server/repositories/me";
import { getMe } from "@/server/services/me";

import type { Me } from "./types";

export type AppUserResult = { user: Me } | { redirectTo: string };

function toContractMe(me: Awaited<ReturnType<typeof getMe>>): Me {
  const user: Me = {
    id: me.id,
    email: me.email,
    displayName: me.displayName,
    role: me.role,
    status: me.status,
    locale: me.locale,
    createdAt: me.createdAt,
  };
  if (me.moderatorCampus !== undefined) {
    const parsed = Campus.safeParse(me.moderatorCampus);
    if (parsed.success) {
      user.moderatorCampus = parsed.data;
    }
  }
  return user;
}

export async function getAppUser(): Promise<AppUserResult> {
  try {
    const store = await cookies();
    const cookieHeader = store
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    const request = new Request("http://localhost/", { headers: { cookie: cookieHeader } });
    const repo = new PgMeRepository(getDb());
    const session = await requireSessionUser(request, repo);
    const me = await getMe(repo, session.id);
    return { user: toContractMe(me) };
  } catch (error) {
    if (error instanceof DomainError && error.code === ErrorCode.AUTH_REQUIRED) {
      return { redirectTo: "/login" };
    }
    if (error instanceof DomainError && error.code === ErrorCode.ACCOUNT_SUSPENDED) {
      return { redirectTo: `/auth/error?error=${ErrorCode.ACCOUNT_SUSPENDED}` };
    }
    throw error;
  }
}
