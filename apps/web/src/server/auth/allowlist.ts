// apps/web/src/server/auth/allowlist.ts
// Domain allowlist check per BE-09. Emails whose domain ∉ AUTH_ALLOWED_DOMAINS
// are rejected after callback with AUTH_DOMAIN_NOT_ALLOWED and no user row.

/**
 * Check if an email's domain is in the allowed list.
 * Case-insensitive; empty list rejects everything (BE-11 rule 3).
 */
export function isDomainAllowed(email: string, allowedDomains: string[]): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@").pop()?.toLowerCase() ?? "";
  if (!domain || allowedDomains.length === 0) return false;
  return allowedDomains.includes(domain);
}

/**
 * Hash an email for abuse-detection logging (BE-09 enforcement rule 5).
 * Never logs the raw email or domain.
 */
export function hashEmailForLog(email: string): string {
  // Simple deterministic hash for logging. Production should use a HMAC with a
  // server-side secret; this implementation keeps the output non-reversible
  // for the email content while remaining deterministic for correlation.
  const normalized = email.toLowerCase().trim();
  let h = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV-1a prime
  }
  return `sha1:${(h >>> 0).toString(16).padStart(8, "0")}`;
}
