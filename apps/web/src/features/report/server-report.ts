import { cookies } from "next/headers";
import { GET_BY_ID } from "@/server/handlers/reports";
import type { ReportDetailData } from "./use-report-detail";

export type ServerReportResult = { data: ReportDetailData } | { notFound: true } | null;

export async function getServerReport(id: string): Promise<ServerReportResult> {
  try {
    const store = await cookies();
    const cookieHeader = store
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const request = new Request(`http://localhost/api/v1/reports/${id}`, {
      headers: { cookie: cookieHeader },
    });
    const res = await GET_BY_ID(request, { params: Promise.resolve({ id }) });
    if (res.status === 404) {
      return { notFound: true };
    }
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as ReportDetailData;
    return { data: json };
  } catch {
    return null;
  }
}
