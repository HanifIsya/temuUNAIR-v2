export function safeInternalNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) {
    return "/";
  }
  if (next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}
