import { useQuery } from "@tanstack/react-query";

import { ApiQueryError, api } from "@/lib/api/client";
import { metaKey } from "@/lib/api/keys";

import type { ApiDropPoints, CampusValue } from "./types";

const META_STALE_TIME_MS = 60 * 60 * 1000;

interface FailureEnvelope {
  error?: { code?: string };
}

export function useDropPoints(campus?: CampusValue) {
  return useQuery({
    queryKey: metaKey("drop-points", campus),
    queryFn: async (): Promise<ApiDropPoints> => {
      const result = (await api.GET("/api/v1/meta/drop-points", {
        params: { query: { campus } },
      })) as unknown as {
        data?: ApiDropPoints;
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
