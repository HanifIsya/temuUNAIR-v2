// Single API access point for the web app (FE-04): feature code imports from
// here instead of reaching into the generated contract client directly.
export { api } from "@temuunair/contracts/generated/client";

/** Query/mutation failure carrying the HTTP status and request ID for the retry policy. */
export class ApiQueryError extends Error {
  readonly status: number;
  readonly requestId: string | null;

  constructor(code: string, status: number, requestId: string | null = null) {
    super(code);
    this.name = "ApiQueryError";
    this.status = status;
    this.requestId = requestId;
  }
}
