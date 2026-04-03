"use client";

import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trustLabel } from "@/lib/i18n";
import type { Job } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";

export function TrustBadge({ trust }: { trust: Job["trust"] }) {
  const { lang } = useLanguage();
  if (trust.level === "Official") {
    return (
      <Badge variant="success" className="gap-1">
        <ShieldCheck className="h-3 w-3" />
        {trustLabel(trust.level, lang)}
      </Badge>
    );
  }
  if (trust.level === "Verified") {
    return (
      <Badge variant="warning" className="gap-1">
        <ShieldAlert className="h-3 w-3" />
        {trustLabel(trust.level, lang)}
      </Badge>
    );
  }
  return (
    <Badge variant="low" className="gap-1">
      <ShieldQuestion className="h-3 w-3" />
      {trustLabel(trust.level, lang)}
    </Badge>
  );
}
