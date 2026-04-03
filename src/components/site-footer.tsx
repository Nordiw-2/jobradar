import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-6">
      <div className="container flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>JobRadar.ma - Discovery + structure + redirect vers la source.</p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-foreground">
            About / Legal
          </Link>
          <a href="mailto:contact@jobradar.ma" className="hover:text-foreground">
            contact@jobradar.ma
          </a>
        </div>
      </div>
    </footer>
  );
}
