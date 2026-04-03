import { createHash } from "node:crypto";
import type { SourceName } from "@/lib/types";

export function stableJobId(source: SourceName, sourceUrl: string, sourceId?: string): string {
  const payload = `${source}|${sourceId ?? sourceUrl}`;
  return createHash("sha1").update(payload).digest("hex").slice(0, 16);
}
