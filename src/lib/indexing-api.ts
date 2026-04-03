/**
 * Lightweight Google Indexing API client.
 *
 * Uses a service account JWT (RS256) to obtain an OAuth2 access token,
 * then calls the Indexing API to notify Google of URL updates/removals.
 *
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account client_email
 *   GOOGLE_SERVICE_ACCOUNT_KEY    — service account private_key (PEM, \n escaped OK)
 *
 * Safe no-op when env vars are absent (will not throw, will not break build).
 */
import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const INDEXING_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claimSet = base64url(
    Buffer.from(
      JSON.stringify({
        iss: clientEmail,
        scope: INDEXING_SCOPE,
        aud: TOKEN_URL,
        exp: now + 3600,
        iat: now
      })
    )
  );
  const signingInput = `${header}.${claimSet}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const sig = base64url(sign.sign(privateKey));
  const jwt = `${signingInput}.${sig}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google Indexing API: failed to obtain access token");
  }
  return data.access_token;
}

export type IndexingAction = "URL_UPDATED" | "URL_DELETED";

/**
 * Notifies Google's Indexing API of a URL change.
 * No-op (and non-throwing) when credentials are not configured.
 */
export async function notifyIndexing(url: string, action: IndexingAction): Promise<void> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!clientEmail || !rawKey) return;

  const privateKey = rawKey.replace(/\\n/g, "\n");
  try {
    const token = await getGoogleAccessToken(clientEmail, privateKey);
    await fetch(INDEXING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ url, type: action })
    });
  } catch (err) {
    // Non-fatal: log error but do not break the caller
    console.error("[indexing-api] notifyIndexing failed:", err);
  }
}
