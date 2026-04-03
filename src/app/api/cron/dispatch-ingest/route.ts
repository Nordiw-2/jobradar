import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const workflowId = process.env.GITHUB_WORKFLOW_ID ?? "ingest-daily.yml";
  const ref = process.env.GITHUB_WORKFLOW_REF ?? "main";

  if (!token || !owner || !repo) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing env: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO"
      },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref
      })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return NextResponse.json(
      { ok: false, error: "GitHub dispatch failed", details: body },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: "Ingest workflow dispatched." });
}
