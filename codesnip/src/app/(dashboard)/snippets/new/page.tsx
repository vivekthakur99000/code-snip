import { redirect } from "next/navigation";

import { SnippetForm } from "~/components/snippet/SnippetForm";
import { auth } from "~/server/auth";

export default async function NewSnippetPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="panel mx-auto max-w-5xl rounded-2xl p-6">
        <h1 className="text-[28px] font-medium text-slate-100">Create snippet</h1>
        <p className="mt-2 text-sm leading-relaxed muted">
          Write, tag, and save your code snippet.
        </p>
        <div className="mt-6">
          <SnippetForm mode="create" />
        </div>
      </div>
    </main>
  );
}
