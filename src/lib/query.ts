import type { JobFilters } from "@/lib/jobs";

export type SearchParamValue = string | string[] | undefined;

function readParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseFilters(
  searchParams: Record<string, SearchParamValue> | undefined
): JobFilters & { fresh?: boolean } {
  const q = readParam(searchParams?.q);
  const city = readParam(searchParams?.city);
  const category = readParam(searchParams?.category);
  const experience = readParam(searchParams?.experience);
  const contract = readParam(searchParams?.contract);
  const remote = readParam(searchParams?.remote);
  const source = readParam(searchParams?.source);
  const sort = readParam(searchParams?.sort) as JobFilters["sort"] | undefined;
  const fresh = readParam(searchParams?.fresh) === "1";

  return { q, city, category, experience, contract, remote, source, sort, fresh };
}
