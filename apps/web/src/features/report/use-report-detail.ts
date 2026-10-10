import { useQuery } from "@tanstack/react-query";

import type {
  ReportModeratorItem,
  ReportOwnerItem,
  ReportPublicItem,
} from "@/features/browse/types";
import { ApiQueryError, api } from "@/lib/api/client";
import { reportsDetailKey } from "@/lib/api/keys";

const DETAIL_STALE_TIME_MS = 30 * 1000; // FE-04: detail staleTime 30 s

interface FailureEnvelope {
  error?: { code?: string; message?: string };
}

export type ReportDetailData = ReportPublicItem | ReportOwnerItem | ReportModeratorItem;

export function useReportDetail(id: string, initialData?: ReportDetailData) {
  return useQuery({
    queryKey: reportsDetailKey(id),
    queryFn: async (): Promise<ReportDetailData> => {
      const result = (await api.GET("/api/v1/reports/{id}", {
        params: {
          path: { id },
        },
      })) as unknown as {
        data?: ReportDetailData;
        error?: FailureEnvelope | null;
        response: Response;
      };

      if (result.error) {
        const code = result.error.error?.code ?? "INTERNAL";
        const requestId = result.response.headers.get("x-request-id");
        throw new ApiQueryError(code, result.response.status, requestId);
      }

      if (!result.data) {
        const requestId = result.response.headers.get("x-request-id");
        throw new ApiQueryError("NOT_FOUND", 404, requestId);
      }

      return result.data;
    },
    initialData,
    staleTime: DETAIL_STALE_TIME_MS,
    enabled: Boolean(id),
  });
}
