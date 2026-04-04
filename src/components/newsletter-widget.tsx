"use client";

import { useFormStatus } from "react-dom";
import { subscribeEmail } from "@/app/actions/newsletter";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "…" : "S'abonner"}
    </button>
  );
}

export function NewsletterWidget({ status }: { status?: string }) {
  if (status === "merci") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
        ✓ Inscription confirmée — tu recevras les meilleures offres du jour.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5 space-y-3">
      <div>
        <p className="font-semibold text-sm text-foreground">Reçois les offres du jour par email</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Digest quotidien — les meilleures offres, zéro spam.
        </p>
      </div>
      <form action={subscribeEmail} className="flex gap-2">
        <input type="hidden" name="ref" value="home" />
        <input
          type="email"
          name="email"
          required
          placeholder="ton@email.ma"
          className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <SubmitBtn />
      </form>
      {status === "erreur" && (
        <p className="text-xs text-destructive">Email invalide, réessaie.</p>
      )}
    </div>
  );
}
