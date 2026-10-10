import { notFound } from "next/navigation";
import { ReportDetailView } from "@/features/report/report-detail-view";
import { getServerReport } from "@/features/report/server-report";

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const result = await getServerReport(id);
  if (result && "notFound" in result) {
    notFound();
  }

  const initialData = result && "data" in result ? result.data : undefined;

  return <ReportDetailView reportId={id} initialData={initialData} />;
}
