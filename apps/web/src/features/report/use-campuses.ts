import { useQuery } from "@tanstack/react-query";

import { ApiQueryError, api } from "@/lib/api/client";
import { metaKey } from "@/lib/api/keys";

import type { ApiCampuses } from "./types";

const META_STALE_TIME_MS = 60 * 60 * 1000; // FE-04: meta staleTime 1 h.

interface FailureEnvelope {
  error?: { code?: string };
}

export function useCampuses() {
  return useQuery({
    queryKey: metaKey("campuses"),
    queryFn: async (): Promise<ApiCampuses> => {
      const result = (await api.GET("/api/v1/meta/campuses")) as unknown as {
        data?: ApiCampuses;
        error?: FailureEnvelope | null;
        response: Response;
      };
      if (result.error) {
        throw new ApiQueryError(result.error.error?.code ?? "INTERNAL", result.response.status);
      }
      return result.data ?? [];
    },
    staleTime: META_STALE_TIME_MS,
  });
}
