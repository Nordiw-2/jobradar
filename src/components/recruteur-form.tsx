"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitEmployerLead } from "@/app/recruteur/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Envoi en cours…" : "Envoyer la demande"}
    </Button>
  );
}

export function RecruteurForm() {
  return (
    <form action={submitEmployerLead} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="companyName" className="text-sm font-medium">
            Entreprise <span className="text-destructive">*</span>
          </label>
          <Input id="companyName" name="companyName" required maxLength={200} />
        </div>
        <div className="space-y-1">
          <label htmlFor="contactEmail" className="text-sm font-medium">
            Email de contact <span className="text-destructive">*</span>
          </label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Titre du poste <span className="text-destructive">*</span>
        </label>
        <Input id="jobTitle" name="jobTitle" required maxLength={200} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="city" className="text-sm font-medium">
            Ville
          </label>
          <Input id="city" name="city" maxLength={100} placeholder="ex: Casablanca" />
        </div>
        <div className="space-y-1">
          <label htmlFor="contractType" className="text-sm font-medium">
            Type de contrat
          </label>
          <select
            id="contractType"
            name="contractType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">— Choisir —</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
            <option value="Other">Autre</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="applyUrl" className="text-sm font-medium">
          Lien pour postuler <span className="text-destructive">*</span>
        </label>
        <Input
          id="applyUrl"
          name="applyUrl"
          type="url"
          required
          maxLength={500}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Message (optionnel)
        </label>
        <textarea
          id="notes"
          name="notes"
          maxLength={1000}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Informations supplémentaires, budget, délai…"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
