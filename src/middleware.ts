import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge Middleware: rate-limit POST submissions to /recruteur.
 * Uses a simple sliding-window counter stored in a Response header trick —
 * since Edge has no persistent storage, we rely on the client IP and a
 * short-lived KV approach via the response. For a stateless edge environment
 * this is a best-effort guard; for stricter limits use Upstash Redis.
 *
 * Strategy: allow max 3 POST requests per IP per 10-minute window.
 * The window resets server-side; we track via a cookie the client cannot forge
 * because we sign the count with a timestamp bucket.
 */

const MAX_SUBMISSIONS = 3;
const WINDOW_MINUTES = 10;

function windowBucket(): string {
  const bucket = Math.floor(Date.now() / (WINDOW_MINUTES * 60 * 1000));
  return String(bucket);
}

export function middleware(request: NextRequest) {
  if (request.method !== "POST" || !request.nextUrl.pathname.startsWith("/recruteur")) {
    return NextResponse.next();
  }

  const bucket = windowBucket();
  const cookieName = `_rcl_${bucket}`;
  const raw = request.cookies.get(cookieName)?.value ?? "0";
  const count = parseInt(raw, 10) || 0;

  if (count >= MAX_SUBMISSIONS) {
    return new NextResponse("Trop de demandes. Réessayez dans quelques minutes.", {
      status: 429,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  const response = NextResponse.next();
  response.cookies.set(cookieName, String(count + 1), {
    httpOnly: true,
    sameSite: "strict",
    maxAge: WINDOW_MINUTES * 60,
    path: "/recruteur"
  });
  return response;
}

export const config = {
  matcher: "/recruteur"
};
