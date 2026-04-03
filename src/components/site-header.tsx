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
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-primary">
          <Sparkles className="h-5 w-5" />
          <span>{t.appName}</span>
        </Link>

        <form onSubmit={onSearchSubmit} className="hidden flex-1 items-center gap-2 md:flex">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-10"
            aria-label={t.searchPlaceholder}
          />
          <Button type="submit" size="sm" className="h-10 gap-1">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleLang}>
            {t.language}
          </Button>
          <Link href="/saved" className="inline-flex">
            <Button variant="secondary" size="sm" className="gap-1">
              <BookmarkCheck className="h-4 w-4" />
              {t.saved} ({savedCount})
            </Button>
          </Link>
        </div>
      </div>
      <div className="container pb-3 md:hidden">
        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-10"
            aria-label={t.searchPlaceholder}
          />
          <Button type="submit" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
