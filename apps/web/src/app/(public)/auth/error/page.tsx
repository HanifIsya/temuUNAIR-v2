import { AuthErrorView } from "./auth-error-view";

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  return <AuthErrorView code={params.error ?? null} />;
}
