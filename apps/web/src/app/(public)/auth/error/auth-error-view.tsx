import { ErrorState } from "@/components/error-state";
import { resolveAuthError } from "@/features/auth/auth-error";

export function AuthErrorView({ code }: { code?: string | null }) {
  const resolved = resolveAuthError(code);

  return (
    <main id="main" className="bg-surface px-5 py-6 text-text font-sans antialiased">
      <div className="mx-auto w-full max-w-card rounded-md border border-border bg-surface p-6 shadow-sm">
        <ErrorState
          titleKey={resolved.titleKey}
          descKey={resolved.descKey}
          headingLevel={1}
          action={resolved.action}
          messageTestId="auth-error-message"
        />
      </div>
    </main>
  );
}
