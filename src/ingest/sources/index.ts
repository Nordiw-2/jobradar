import { anapecAdapter } from "@/ingest/sources/anapec";
import { emploiMarocAdapter } from "@/ingest/sources/emploi-maroc";
import { emploiMaAdapter } from "@/ingest/sources/emploi-ma";
import { emploiPublicAdapter } from "@/ingest/sources/emploi-public";
import { novojobAdapter } from "@/ingest/sources/novojob";
import { offresEmploiAdapter } from "@/ingest/sources/offres-emploi";
import { rekruteAdapter } from "@/ingest/sources/rekrute";
import type { SourceAdapter } from "@/ingest/types";

export const sourceAdapters: SourceAdapter[] = [
  anapecAdapter,
  emploiPublicAdapter,
  emploiMaAdapter,
  rekruteAdapter,
  emploiMarocAdapter,
  offresEmploiAdapter,
  novojobAdapter
];
