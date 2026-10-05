import { useQuery } from "@tanstack/react-query";

import { ApiQueryError, api } from "@/lib/api/client";
import { metaKey } from "@/lib/api/keys";

import type { ApiLocations, CampusValue } from "./types";

const META_STALE_TIME_MS = 60 * 60 * 1000;

interface FailureEnvelope {
  error?: { code?: string };
}

export function useLocations(campus?: CampusValue) {
  return useQuery({
    queryKey: metaKey("locations", campus),
    queryFn: async (): Promise<ApiLocations> => {
      const result = (await api.GET("/api/v1/meta/locations", {
        params: { query: { campus } },
      })) as unknown as {
        data?: ApiLocations;
        error?: FailureEnvelope | null;
        response: Response;
      };
      if (result.error) {
        throw new ApiQueryError(result.error.error?.code ?? "INTERNAL", result.response.status);
      }
      return result.data ?? [];
    },
    enabled: Boolean(campus),
    staleTime: META_STALE_TIME_MS,
  });
}
