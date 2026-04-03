import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="surface mx-auto max-w-xl space-y-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Offre introuvable</h1>
      <p className="text-muted-foreground">Cette annonce n&apos;est plus disponible ou l&apos;ID est invalide.</p>
      <Link href="/search">
        <Button>Retour aux offres</Button>
      </Link>
    </div>
  );
}
