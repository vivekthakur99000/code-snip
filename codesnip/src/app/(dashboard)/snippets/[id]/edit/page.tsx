import { redirect } from "next/navigation";

import { SnippetForm } from "~/components/snippet/SnippetForm";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function EditSnippetPage({
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
    <main className="min-h-screen p-6">
      <div className="panel mx-auto max-w-5xl rounded-2xl p-6">
        <h1 className="text-[28px] font-medium text-slate-100">Edit snippet</h1>
        <p className="mt-2 text-sm leading-relaxed muted">{snippet.title}</p>
        <div className="mt-6">
          <SnippetForm
            mode="edit"
            initial={{
              id: snippet.id,
              title: snippet.title,
              code: snippet.code,
              language: snippet.language,
              isPublic: snippet.isPublic,
              tags: snippet.tags.map((tag) => tag.name),
            }}
          />
        </div>
      </div>
    </main>
  );
}
