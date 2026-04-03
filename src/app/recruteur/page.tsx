import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecruteurForm } from "@/components/recruteur-form";
import { canonical } from "@/lib/seo";
import type { SearchParamValue } from "@/lib/query";

export const metadata: Metadata = {
  title: "Publier une offre d'emploi - JobRadar.ma",
  description:
    "Recruteurs : soumettez votre offre d'emploi au Maroc pour être agrégée sur JobRadar.ma et atteindre rapidement les candidats.",
  alternates: { canonical: canonical("/recruteur") }
};

type RecruteurPageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

const ERROR_MESSAGES: Record<string, string> = {
  "champs-requis": "Merci de remplir tous les champs obligatoires.",
  "email-invalide": "L'adresse email saisie n'est pas valide.",
  "url-invalide": "Le lien pour postuler n'est pas une URL valide."
};

export default async function RecruteurPage({ searchParams }: RecruteurPageProps) {
  const params = (await searchParams) ?? {};
  const merci = params.merci === "1";
  const erreur = typeof params.erreur === "string" ? params.erreur : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Publier une offre d&apos;emploi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Recruteurs : soumettez votre offre pour être agrégée sur JobRadar.ma. Vous serez
          recontacté sous 48h ouvrées.
        </p>
      </div>

      {merci ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Demande reçue !</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700">
            Merci pour votre soumission. Nous vous contacterons à l&apos;adresse email indiquée
            sous 48h ouvrées.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Votre offre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {erreur ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {ERROR_MESSAGES[erreur] ?? "Une erreur est survenue. Veuillez réessayer."}
              </div>
            ) : null}
            <RecruteurForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comment ça fonctionne ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Soumettez votre offre via le formulaire ci-dessus.</p>
          <p>2. Notre équipe vérifie la demande et vous répond sous 48h.</p>
          <p>3. L&apos;offre est agrégée et redirige les candidats vers votre lien officiel.</p>
          <p>
            Contact direct :{" "}
            <a href="mailto:contact@jobradar.ma" className="text-primary underline">
              contact@jobradar.ma
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
