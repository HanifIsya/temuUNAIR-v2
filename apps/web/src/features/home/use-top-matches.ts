import { useQuery } from "@tanstack/react-query";

import type { MatchItem } from "@/components/report/match-card";
import { ApiQueryError, api } from "@/lib/api/client";
import { matchesKey } from "@/lib/api/keys";

const MATCHES_STALE_TIME_MS = 30 * 1000; // FE-04: staleTime 30 s

interface FailureEnvelope {
  error?: { code?: string; message?: string };
}

export function useTopMatches(reportId?: string) {
  return useQuery({
    queryKey: matchesKey(reportId ?? ""),
    queryFn: async (): Promise<MatchItem[]> => {
      if (!reportId) return [];

      const result = (await api.GET("/api/v1/reports/{id}/matches", {
        params: {
          path: { id: reportId },
        },
      })) as unknown as {
        data?: MatchItem[];
        error?: FailureEnvelope | null;
        response: Response;
      };

      if (result.error) {
        const code = result.error.error?.code ?? "INTERNAL";
        const requestId = result.response.headers.get("x-request-id");
        throw new ApiQueryError(code, result.response.status, requestId);
      }

      return result.data ?? [];
    },
    staleTime: MATCHES_STALE_TIME_MS,
    enabled: Boolean(reportId),
  });
}
