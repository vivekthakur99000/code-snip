import { type Metadata } from "next";

import { SnippetVotes } from "~/components/snippet/SnippetVotes";
import { SnippetViewer } from "~/components/snippet/SnippetViewer";
import { env } from "~/env";
import { api } from "~/trpc/server";
import { incrementPublicSnippetView } from "./actions";

// Revalidate every 60 seconds to cache popular snippets
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const snippet = await api.snippets.getPublicBySlug({ slug });
    const baseUrl = env.AUTH_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/s/${snippet.slug}`;
    const ogImage = `${baseUrl}/api/og/snippet/${snippet.slug}`;

    return {
      title: `${snippet.title} | CodeSnip`,
      description: `Public ${snippet.language} snippet on CodeSnip.`,
      openGraph: {
        title: `${snippet.title} | CodeSnip`,
        description: `Public ${snippet.language} snippet on CodeSnip.`,
        type: "article",
        url,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${snippet.title} preview`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${snippet.title} | CodeSnip`,
        description: `Public ${snippet.language} snippet on CodeSnip.`,
        images: [ogImage],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return {
      title: "Snippet not found | CodeSnip",
      description: "The requested snippet could not be found.",
    };
  }
}

export default async function PublicSnippetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Increment view asynchronously without blocking page render
  incrementPublicSnippetView(slug).catch(() => {
    // Silent fail - view increment is not critical
  });

  const snippet = await api.snippets.getPublicBySlug({ slug });
  const baseUrl = env.AUTH_URL ?? "http://localhost:3000";
  const embedUrl = `${baseUrl}/api/embed/${snippet.slug}`;

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="panel rounded-3xl p-6">
          <h1 className="text-[30px] font-semibold text-slate-100">{snippet.title}</h1>
          <p className="mt-2 text-sm text-slate-300">
            by {snippet.creator.name ?? "Anonymous"} • {snippet.language}
          </p>

          <div className="mt-4">
            <SnippetViewer
              title={`${snippet.title}.${snippet.language}`}
              code={snippet.code}
              language={snippet.language}
              theme="github-dark"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-200"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>

        <aside className="panel rounded-3xl p-4">
          <h2 className="text-sm font-medium text-slate-100">Community Pulse</h2>
          <p className="mt-1 text-xs text-slate-400">React with like/dislike to rank this snippet.</p>

          <div className="mt-3">
            <SnippetVotes
              snippetId={snippet.id}
              initialLikes={snippet.votes.likes}
              initialDislikes={snippet.votes.dislikes}
              initialUserVote={snippet.votes.userVote}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
            <p>{snippet.views} views</p>
            <p className="mt-1">Embed URL: {embedUrl}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
