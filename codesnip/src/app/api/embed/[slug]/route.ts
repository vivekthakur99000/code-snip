import { NextResponse } from "next/server";

import { api } from "~/trpc/server";
import { highlightSnippetCode } from "~/lib/shiki";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const snippet = await api.snippets.getPublicBySlug({ slug });
    const highlighted = await highlightSnippetCode(snippet.code, snippet.language, "github-dark");

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(snippet.title)} | CodeSnip Embed</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background: #0b0f19;
        color: #e5e7eb;
      }
      .wrap {
        border: 1px solid #1f2937;
        border-radius: 12px;
        overflow: hidden;
      }
      .bar {
        padding: 10px 14px;
        background: #111827;
        border-bottom: 1px solid #1f2937;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .title {
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        font-size: 12px;
        color: #9ca3af;
      }
      .content {
        max-height: 560px;
        overflow: auto;
      }
      .content pre {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <article class="wrap">
      <header class="bar">
        <span class="title">${escapeHtml(snippet.title)}</span>
        <span class="meta">${escapeHtml(snippet.language)}</span>
      </header>
      <div class="content">${highlighted}</div>
    </article>
  </body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-frame-options": "SAMEORIGIN",
      },
    });
  } catch {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }
}
