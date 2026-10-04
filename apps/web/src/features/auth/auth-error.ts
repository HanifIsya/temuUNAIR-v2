export type AuthErrorKind = "domain" | "suspended" | "generic";

export interface AuthErrorVariant {
  kind: AuthErrorKind;
  titleKey: string;
  descKey: string;
  action?: { labelKey: string; href: string };
}

const LOGIN_ACTION = { labelKey: "auth.error.action.another", href: "/login" } as const;

export function resolveAuthError(code: string | null | undefined): AuthErrorVariant {
  if (code === "AUTH_DOMAIN_NOT_ALLOWED" || code === "AccessDenied") {
    return {
      kind: "domain",
      titleKey: "auth.error.title",
      descKey: "auth.error.domain",
      action: LOGIN_ACTION,
    };
  }
  if (code === "ACCOUNT_SUSPENDED") {
    return {
      kind: "suspended",
      titleKey: "auth.error.suspended.title",
      descKey: "error.ACCOUNT_SUSPENDED",
    };
  }
  return {
    kind: "generic",
    titleKey: "auth.error.title",
    descKey: "auth.error.generic",
    action: LOGIN_ACTION,
  };
}
