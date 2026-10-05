import { ReportWizard } from "@/features/report/report-wizard";

interface ReportNewPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ReportNewPage({ searchParams }: ReportNewPageProps) {
  const params = await searchParams;
  const type = params.type === "lost" ? "LOST" : params.type === "found" ? "FOUND" : undefined;
  return <ReportWizard initialType={type} />;
}
