"use client";

import { translateSnippet } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";

export function LangSnippet({ snippet }: { snippet: string }) {
  const { lang } = useLanguage();
  return <>{translateSnippet(snippet, lang)}</>;
}
