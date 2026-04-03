import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-6">
      <div className="container space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/teletravail" className="hover:text-foreground">
            Emploi remote
          </Link>
          <Link href="/ville/casablanca" className="hover:text-foreground">
            Casablanca
          </Link>
          <Link href="/ville/rabat" className="hover:text-foreground">
            Rabat
          </Link>
          <Link href="/ville/marrakech" className="hover:text-foreground">
            Marrakech
          </Link>
          <Link href="/categorie/tech" className="hover:text-foreground">
            Tech
          </Link>
          <Link href="/categorie/vente" className="hover:text-foreground">
            Vente
          </Link>
          <Link href="/categorie/comptabilite" className="hover:text-foreground">
            Comptabilite
          </Link>
          <Link href="/source/anapec" className="hover:text-foreground">
            ANAPEC
          </Link>
          <Link href="/source/rekrute" className="hover:text-foreground">
            ReKrute
          </Link>
          <Link href="/recruteur" className="hover:text-foreground">
            Publier une offre
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
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
      </div>
    </footer>
  );
}
