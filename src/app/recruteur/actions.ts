"use server";

import { redirect } from "next/navigation";

export type SubmitLeadState = { error?: string };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function submitEmployerLead(formData: FormData): Promise<void> {
  const companyName = (formData.get("companyName") as string | null)?.trim() ?? "";
  const contactEmail = (formData.get("contactEmail") as string | null)?.trim() ?? "";
  const jobTitle = (formData.get("jobTitle") as string | null)?.trim() ?? "";
  const applyUrl = (formData.get("applyUrl") as string | null)?.trim() ?? "";
  const city = (formData.get("city") as string | null)?.trim() ?? "";
  const contractType = (formData.get("contractType") as string | null)?.trim() ?? "";
  const notes = (formData.get("notes") as string | null)?.trim() ?? "";

  if (!companyName || !contactEmail || !jobTitle || !applyUrl) {
    redirect("/recruteur?erreur=champs-requis");
  }
  if (!isValidEmail(contactEmail)) {
    redirect("/recruteur?erreur=email-invalide");
  }
  if (!isValidUrl(applyUrl)) {
    redirect("/recruteur?erreur=url-invalide");
  }

  const payload = {
    type: "employer_submission",
    submittedAt: new Date().toISOString(),
    companyName,
    contactEmail,
    jobTitle,
    city,
    contractType,
    applyUrl,
    notes
  };

  console.info("[recruteur] submission:", {
    ...payload,
    notes: notes ? "[present]" : "[empty]",
    contactEmail: "[redacted]"
  });

  const webhookUrl = process.env.SUBMISSION_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("[recruteur] webhook delivery failed:", err);
      // Non-fatal: still redirect to success
    }
  }

  redirect("/recruteur?merci=1");
}
