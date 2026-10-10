import { BrowseView } from "@/features/browse/browse-view";
import type {
  BrowseFilters,
  CampusValue,
  CategoryValue,
  CustodyValue,
} from "@/features/browse/types";

interface ReportsPageProps {
  searchParams?: Promise<{
    type?: string;
    campus?: string | string[];
    category?: string | string[];
    custody?: string;
    q?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = (await searchParams) ?? {};

  const type =
    params.type?.toUpperCase() === "LOST"
      ? "LOST"
      : params.type?.toUpperCase() === "FOUND"
        ? "FOUND"
        : undefined;

  const campusArray = params.campus
    ? Array.isArray(params.campus)
      ? (params.campus as CampusValue[])
      : [params.campus as CampusValue]
    : undefined;

  const categoryArray = params.category
    ? Array.isArray(params.category)
      ? (params.category as CategoryValue[])
      : [params.category as CategoryValue]
    : undefined;

  const initialFilters: BrowseFilters = {
    type,
    campus: campusArray,
    category: categoryArray,
    custody: params.custody as CustodyValue | undefined,
    q: params.q,
  };

  return <BrowseView initialFilters={initialFilters} />;
}
