import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">A propos & Legal</h1>
      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            JobRadar.ma agrege des metadonnees d&apos;offres d&apos;emploi publiques pour faciliter la decouverte.
          </p>
          <p>
            Nous ne republions pas les descriptions completes. Pour candidater, utilise toujours le bouton
            &quot;View & Apply&quot; vers la source originale.
          </p>
          <p>Si un organisme souhaite la suppression d&apos;un lien, contactez-nous a contact@jobradar.ma.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Email:{" "}
          <a className="text-primary underline" href="mailto:contact@jobradar.ma">
            contact@jobradar.ma
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
