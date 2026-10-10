import { useQuery } from "@tanstack/react-query";

import type { ReportOwnerItem } from "@/features/browse/types";
import { ApiQueryError, api } from "@/lib/api/client";
import { reportsMineKey } from "@/lib/api/keys";

const MINE_STALE_TIME_MS = 30 * 1000; // FE-04: staleTime 30 s

interface FailureEnvelope {
  error?: { code?: string; message?: string };
}

export function useMyReports(filters: { status?: string } = { status: "active" }) {
  return useQuery({
    queryKey: reportsMineKey(filters),
    queryFn: async (): Promise<ReportOwnerItem[]> => {
      const result = (await api.GET("/api/v1/reports/mine", {
        params: {
          query: {
            status: filters.status === "active" ? "OPEN,MATCHED" : filters.status,
          } as never,
        },
      })) as unknown as {
        data?: { data: ReportOwnerItem[] };
        error?: FailureEnvelope | null;
        response: Response;
      };

      if (result.error) {
        const code = result.error.error?.code ?? "INTERNAL";
        const requestId = result.response.headers.get("x-request-id");
        throw new ApiQueryError(code, result.response.status, requestId);
      }

      return result.data?.data ?? [];
    },
    staleTime: MINE_STALE_TIME_MS,
  });
}
