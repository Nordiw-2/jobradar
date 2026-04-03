import type { ContractType, RemoteType } from "@/lib/types";

type SnippetInput = {
  title: string;
  city?: string;
  contract?: ContractType;
  remote?: RemoteType;
  sourceLabel: string;
};

export function generateSnippet(input: SnippetInput): string {
  const titlePart = `Poste de ${input.title}`;
  const cityPart = input.city ? `a ${input.city}` : "au Maroc";
  const contractPart = input.contract ? `Contrat ${input.contract}.` : "";
  const remotePart =
    input.remote && input.remote !== "Unknown" ? `Mode ${input.remote}.` : "";
  return `${titlePart} ${cityPart}. ${contractPart} ${remotePart} Consulte l'annonce et postule via la source (${input.sourceLabel}).`
    .replace(/\s+/g, " ")
    .trim();
}
