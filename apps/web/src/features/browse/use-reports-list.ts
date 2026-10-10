import { useInfiniteQuery } from "@tanstack/react-query";

import { ApiQueryError, api } from "@/lib/api/client";
import { reportsListKey } from "@/lib/api/keys";
import type { BrowseFilters, ReportPublicItem } from "./types";

const LIST_STALE_TIME_MS = 30 * 1000; // FE-04: lists staleTime 30 s

interface FailureEnvelope {
  error?: { code?: string; message?: string };
}

export interface ReportsListPage {
  data: ReportPublicItem[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export function useReportsList(filters: BrowseFilters = {}) {
  return useInfiniteQuery({
    queryKey: reportsListKey(filters),
    queryFn: async ({ pageParam }): Promise<ReportsListPage> => {
      const queryParams: Record<string, unknown> = {};
      if (filters.type) queryParams.type = filters.type;
      if (filters.campus && filters.campus.length > 0) queryParams.campus = filters.campus;
      if (filters.category && filters.category.length > 0) queryParams.category = filters.category;
      if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) queryParams.dateTo = filters.dateTo;
      if (filters.custody) queryParams.custody = filters.custody;
      if (pageParam) queryParams.cursor = pageParam;
      if (filters.limit) queryParams.limit = filters.limit;

      const result = (await api.GET("/api/v1/reports", {
        params: {
          query: queryParams as never,
        },
      })) as unknown as {
        data?: ReportsListPage;
        error?: FailureEnvelope | null;
        response: Response;
      };

      if (result.error) {
        const code = result.error.error?.code ?? "INTERNAL";
        const requestId = result.response.headers.get("x-request-id");
        throw new ApiQueryError(code, result.response.status, requestId);
      }

      return result.data ?? { data: [], page: { nextCursor: null, hasMore: false } };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.page.nextCursor,
    staleTime: LIST_STALE_TIME_MS,
  });
}
