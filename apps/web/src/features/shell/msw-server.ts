// Test-only MSW server for the generated contract handlers.
// Imported FIRST (before any module that loads the generated API client) so that
// `server.listen()` patches `globalThis.fetch` before openapi-fetch captures it.
//
// openapi-fetch builds `new Request(url)` before fetching; the jsdom/undici
// `Request` rejects relative URLs (browsers resolve them against the document
// base), so relative contract paths are resolved against the jsdom origin here.
import { mswHandlers } from "@temuunair/contracts/generated/msw-handlers";
import { setupServer } from "msw/node";

const NativeRequest = globalThis.Request;
const origin = globalThis.location?.origin ?? "http://localhost:3000";

globalThis.Request = class RelativeRequest extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(
      typeof input === "string" && input.startsWith("/") && !input.startsWith("//")
        ? new URL(input, origin)
        : input,
      init,
    );
  }
} as typeof Request;

export interface CapturedRequest {
  method: string;
  xsr: string | null;
  body: Request;
}

export const captured: CapturedRequest[] = [];

export const server = setupServer(...mswHandlers);

server.events.on("request:start", ({ request }) => {
  captured.push({
    method: request.method,
    xsr: request.headers.get("x-requested-with"),
    body: request.clone(),
  });
});

server.listen({ onUnhandledRequest: "error" });
