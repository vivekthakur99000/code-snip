import { redirect } from "next/navigation";
import Link from "next/link";

import { DeleteSnippetButton } from "~/components/snippet/DeleteSnippetButton";
import { SnippetViewer } from "~/components/snippet/SnippetViewer";
import { SnippetVotes } from "~/components/snippet/SnippetVotes";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const snippet = await api.snippets.getById({ id });

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="panel rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-semibold text-slate-100">{snippet.title}</h1>
              <p className="mt-2 text-sm text-slate-300">
                by {snippet.creator.name ?? "Anonymous"} • {snippet.language}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/snippets/${snippet.id}/edit`}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500"
              >
                Edit snippet
              </Link>
              <DeleteSnippetButton snippetId={snippet.id} />
            </div>
          </div>

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
          <h2 className="text-sm font-medium text-slate-100">Engagement</h2>
          <p className="mt-1 text-xs text-slate-400">Vote on this snippet quality and usefulness.</p>

          <div className="mt-3">
            <SnippetVotes
              snippetId={snippet.id}
              initialLikes={snippet.votes.likes}
              initialDislikes={snippet.votes.dislikes}
              initialUserVote={snippet.votes.userVote}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
            <p>{snippet.views} total views</p>
            <p className="mt-1">{snippet.isPublic ? "Public snippet" : "Private snippet"}</p>
            <p className="mt-1">Created {new Date(snippet.createdAt).toLocaleDateString()}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
