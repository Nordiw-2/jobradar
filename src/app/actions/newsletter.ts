"use server";

import { redirect } from "next/navigation";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Subscribes an email to the newsletter / job digest.
 *
 * Delivery options (checked in order):
 *   1. NEWSLETTER_WEBHOOK_URL — POST JSON to any webhook (Mailchimp, Brevo, n8n, Make, etc.)
 *   2. Fallback: log to server console (for local dev / cheap deployments)
 *
 * No database required.
 */
export async function subscribeEmail(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const ref = (formData.get("ref") as string | null)?.trim() ?? "home";

  if (!email || !isValidEmail(email)) {
    redirect("/?newsletter=erreur");
  }

  const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter_subscribe",
          email,
          ref,
          subscribedAt: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("[newsletter] webhook failed:", err);
    }
  } else {
    // Fallback: structured log (can be piped to a log aggregator)
    console.info("[newsletter] new subscriber ref=%s ts=%s", ref, new Date().toISOString());
  }

  redirect("/?newsletter=merci");
}
