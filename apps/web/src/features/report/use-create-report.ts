import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiQueryError, api } from "@/lib/api/client";

import type { ReportCreateRequest } from "./types";

interface FailureEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: { fields?: Array<{ field: string; message: string }> };
  };
}

export interface CreateReportOptions {
  payload: ReportCreateRequest;
  idempotencyKey: string;
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, idempotencyKey }: CreateReportOptions) => {
      const result = (await api.POST("/api/v1/reports", {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: payload as never,
      })) as unknown as {
        data?: { id: string };
        error?: FailureEnvelope | null;
        response: Response;
      };

      if (result.error) {
        const code = result.error.error?.code ?? "INTERNAL";
        throw new ApiQueryError(code, result.response.status);
      }

      return result.data ?? { id: "" };
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["reports", "mine"] });
      void queryClient.invalidateQueries({ queryKey: ["reports", "list"] });
      if (data.id) {
        void queryClient.invalidateQueries({ queryKey: ["reports", "detail", data.id] });
      }
    },
    retry: false, // FE-04: mutations run with retry: false
  });
}
