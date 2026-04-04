import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container py-10 space-y-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Villes</p>
            <ul className="space-y-2 text-sm">
              {["casablanca", "rabat", "marrakech", "tanger", "agadir"].map((c) => (
                <li key={c}>
                  <Link href={`/ville/${c}`} className="text-muted-foreground hover:text-foreground capitalize">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Secteurs</p>
            <ul className="space-y-2 text-sm">
              {[["tech", "Tech"],["vente", "Vente"],["comptabilite", "Comptabilité"],["sante", "Santé"],["logistique", "Logistique"]].map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/categorie/${slug}`} className="text-muted-foreground hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sources</p>
            <ul className="space-y-2 text-sm">
              {[["anapec", "ANAPEC"],["rekrute", "ReKrute"],["emploi-ma", "Emploi.ma"],["emploi-public", "Emploi Public"],["novojob", "Novojob"]].map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/source/${slug}`} className="text-muted-foreground hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">JobRadar.ma</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/teletravail" className="text-muted-foreground hover:text-foreground">Télétravail</Link></li>
              <li><Link href="/recruteur" className="text-muted-foreground hover:text-foreground">Publier une offre</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">À propos</Link></li>
              <li><a href="mailto:contact@jobradar.ma" className="text-muted-foreground hover:text-foreground">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} JobRadar.ma — Agrégateur d&apos;offres d&apos;emploi au Maroc.</p>
          <p>Discovery · Structure · Redirect vers la source officielle.</p>
        </div>
      </div>
    </footer>
  );
}
