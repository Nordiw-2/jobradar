import type { SourceName } from "@/lib/types";

export const SOURCE_LABELS: Record<SourceName, string> = {
  ANAPEC: "ANAPEC",
  EMPLOI_PUBLIC: "Emploi Public",
  EMPLOI_MA: "Emploi.ma",
  REKRUTE: "ReKrute",
  EMPLOI_MAROC: "Emplois.co",
  OFFRES_EMPLOI: "Offres-emploi.ma",
  NOVOJOB: "Novojob"
};

export function sourceLabel(source: SourceName): string {
  return SOURCE_LABELS[source] ?? source;
}
