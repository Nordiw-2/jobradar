"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Link2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { upsertSavedIntent } from "@/lib/local-storage";
import { useText } from "@/components/language-provider";
import type { SavedIntent } from "@/lib/types";

type SearchControlsProps = {
  cities: string[];
  categories: string[];
  sources: Array<{ value: string; label: string }>;
  totalResults: number;
};

const filterKeys = ["q", "city", "category", "experience", "contract", "remote", "source", "sort"] as const;

function buildIntentLabel(query: URLSearchParams): string {
  return [query.get("q"), query.get("city"), query.get("category")].filter(Boolean).join(" - ") || "Recherche rapide";
}

export function SearchControls({ cities, categories, sources, totalResults }: SearchControlsProps) {
  const t = useText();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const [copied, setCopied] = useState(false);
  const current = useMemo(() => new URLSearchParams(paramsString), [paramsString]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(current.toString());
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.push(`/search?${next.toString()}`);
  }

  function renderPanel() {
    return (
      <div className="space-y-3">
        <Input
          placeholder={t.searchPlaceholder}
          value={current.get("q") ?? ""}
          onChange={(event) => setFilter("q", event.target.value)}
        />
        <Select value={current.get("city") ?? "all"} onValueChange={(v) => setFilter("city", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={current.get("category") ?? "all"}
          onValueChange={(v) => setFilter("category", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={current.get("experience") ?? "all"}
          onValueChange={(v) => setFilter("experience", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute experience</SelectItem>
            <SelectItem value="0">Debutant</SelectItem>
            <SelectItem value="1-3">1-3 ans</SelectItem>
            <SelectItem value="3-5">3-5 ans</SelectItem>
            <SelectItem value="5+">5+ ans</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={current.get("contract") ?? "all"}
          onValueChange={(v) => setFilter("contract", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Contrat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les contrats</SelectItem>
            <SelectItem value="CDI">CDI</SelectItem>
            <SelectItem value="CDD">CDD</SelectItem>
            <SelectItem value="Stage">Stage</SelectItem>
            <SelectItem value="Freelance">Freelance</SelectItem>
            <SelectItem value="Interim">Interim</SelectItem>
            <SelectItem value="Public">Public</SelectItem>
          </SelectContent>
        </Select>
        <Select value={current.get("remote") ?? "all"} onValueChange={(v) => setFilter("remote", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les modes</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="Onsite">Onsite</SelectItem>
          </SelectContent>
        </Select>
        <Select value={current.get("source") ?? "all"} onValueChange={(v) => setFilter("source", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sources</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={current.get("sort") ?? "newest"} onValueChange={(v) => setFilter("sort", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t.newest}</SelectItem>
            <SelectItem value="easiest">{t.easiest}</SelectItem>
            <SelectItem value="relevant">{t.relevant}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  function saveCurrentSearch() {
    const serializable: Record<string, string> = {};
    for (const key of filterKeys) {
      const value = current.get(key);
      if (value) {
        serializable[key] = value;
      }
    }

    const intent: SavedIntent = {
      id: Object.keys(serializable).sort().map((key) => `${key}:${serializable[key]}`).join("|"),
      query: serializable,
      label: buildIntentLabel(current),
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };

    upsertSavedIntent(intent);
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/search?${current.toString()}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <TooltipProvider>
      <aside className="space-y-3">
        <div className="surface hidden p-4 md:block">{renderPanel()}</div>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {t.filters}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t.filters}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{renderPanel()}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="surface flex items-center justify-between gap-2 p-3 text-sm">
          <span>
            {totalResults} {t.results}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-1" onClick={saveCurrentSearch}>
              <Save className="h-4 w-4" />
              {t.saveSearch}
            </Button>
            <Tooltip open={copied ? true : undefined}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={copyShareLink} aria-label="Copy search link">
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copie" : "Partager"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
