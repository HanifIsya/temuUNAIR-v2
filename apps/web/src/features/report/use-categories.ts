import { useQuery } from "@tanstack/react-query";

import { ApiQueryError, api } from "@/lib/api/client";
import { metaKey } from "@/lib/api/keys";

import { categoryListSchema } from "./schemas";

const META_STALE_TIME_MS = 60 * 60 * 1000; // FE-04: meta staleTime 1 h.

// API-META-01 declares `errors: []` in the registry, so the generated client types
// the error branch as `never`; the runtime still returns the error envelope on
// non-2xx (asserted by the MSW failure test). Widen just that branch — contract
// observation filed for a TMU-CTR follow-up to declare the error responses.
interface FailureEnvelope {
  error?: { code?: string };
}

export function useCategories() {
  return useQuery({
    queryKey: metaKey("categories"),
    queryFn: async () => {
      const result = (await api.GET("/api/v1/meta/categories")) as unknown as {
        data?: unknown;
        error?: FailureEnvelope | null;
        response: Response;
      };
      if (result.error) {
        throw new ApiQueryError(result.error.error?.code ?? "INTERNAL", result.response.status);
      }
      return categoryListSchema.parse(result.data);
    },
    staleTime: META_STALE_TIME_MS,
  });
}
