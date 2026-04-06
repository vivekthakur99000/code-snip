import { and, eq, isNull } from "drizzle-orm";
import { ImageResponse } from "next/og";

import { db } from "~/server/db";
import { snippets } from "~/server/db/schema";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const [snippet] = await db
      .select({
        title: snippets.title,
        code: snippets.code,
        language: snippets.language,
        views: snippets.views,
      })
      .from(snippets)
      .where(and(eq(snippets.slug, slug), eq(snippets.isPublic, true), isNull(snippets.deletedAt)))
      .limit(1);

    if (!snippet) {
      throw new Error("Snippet not found");
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #0b1020 0%, #1f2937 60%, #111827 100%)",
            color: "#f9fafb",
            padding: 48,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#15803d",
              }}
            />
            <div style={{ fontSize: 28, fontWeight: 600 }}>CodeSnip</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.1 }}>
              {snippet.title}
            </div>
            <div style={{ fontSize: 26, color: "#9ca3af" }}>{snippet.language}</div>
            <div
              style={{
                marginTop: 10,
                border: "1px solid #374151",
                borderRadius: 12,
                background: "#0d1117",
                padding: 20,
                fontSize: 20,
                color: "#d1d5db",
                whiteSpace: "pre-wrap",
              }}
            >
              {snippet.code.slice(0, 220)}
            </div>
          </div>

          <div style={{ fontSize: 22, color: "#9ca3af" }}>{snippet.views} views</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111827",
            color: "#f9fafb",
            fontSize: 52,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          Snippet Not Found
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
}
