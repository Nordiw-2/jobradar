"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BookmarkCheck, Search, Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSavedIntents } from "@/lib/local-storage";
import { useLanguage, useText } from "@/components/language-provider";

export function SiteHeader() {
  const t = useText();
  const { toggleLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [savedCount, setSavedCount] = useState(0);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSavedCount(getSavedIntents().length);
  }, [pathname]);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-14 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold tracking-[-0.02em] text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>{t.appName}</span>
        </Link>

        <form onSubmit={onSearchSubmit} className="hidden flex-1 items-center gap-2 md:flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="pl-9"
              aria-label={t.searchPlaceholder}
            />
          </div>
          <Button type="submit" size="sm">
            Rechercher
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleLang} className="text-muted-foreground">
            {t.language}
          </Button>
          <Link href="/saved" className="inline-flex">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BookmarkCheck className="h-4 w-4" />
              {t.saved}
              {savedCount > 0 ? (
                <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {savedCount}
                </span>
              ) : null}
            </Button>
          </Link>
        </div>
      </div>
      <div className="container pb-3 md:hidden">
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="pl-9"
              aria-label={t.searchPlaceholder}
            />
          </div>
          <Button type="submit" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
