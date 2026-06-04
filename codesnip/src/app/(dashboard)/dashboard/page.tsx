import Link from "next/link";
import { redirect } from "next/navigation";
import { type CSSProperties } from "react";

import { Sidebar } from "~/components/layout/Sidebar";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [{ items }, userTags] = await Promise.all([
    api.snippets.getByUser({ limit: 20 }),
    api.tags.getByUser(),
  ]);

  const totalSnippets = items.length;
  const publicSnippets = items.filter((item) => item.isPublic).length;
  const totalViews = items.reduce((acc, item) => acc + item.views, 0);

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-6xl">
        <Sidebar tags={userTags} />
        <div className="flex-1 p-6">
          <h1 className="text-[28px] font-medium text-slate-100">Dashboard</h1>
          <p className="mt-2 text-sm leading-relaxed muted">
            Signed in as {session?.user?.email ?? session?.user?.name ?? "unknown user"}
          </p>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="panel rounded-2xl p-4">
              <p className="text-xs muted">Total snippets</p>
              <p className="mt-2 text-[20px] font-medium text-slate-100">{totalSnippets}</p>
            </article>
            <article className="panel rounded-2xl p-4">
              <p className="text-xs muted">Public snippets</p>
              <p className="mt-2 text-[20px] font-medium text-slate-100">{publicSnippets}</p>
            </article>
            <article className="panel rounded-2xl p-4">
              <p className="text-xs muted">Total views</p>
              <p className="mt-2 text-[20px] font-medium text-slate-100">{totalViews}</p>
            </article>
          </section>

          <section className="panel mt-6 rounded-2xl p-4">
            <h2 className="text-[20px] font-medium text-slate-100">Your snippets</h2>
            <ul className="mt-3 space-y-2">
              {items.map((snippet, index) => (
                <li
                  key={snippet.id}
                  className="stagger-item rounded-xl border border-slate-700/90 bg-slate-900/50 p-3"
                  style={{ "--stagger": `${index * 45}ms` } as CSSProperties}
                >
                  <Link href={`/snippets/${snippet.id}`} className="text-sm text-slate-100">
                    {snippet.title}
                  </Link>
                  <p className="mt-1 text-xs muted">
                    {snippet.language} • {snippet.views} views
                  </p>
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-sm muted">No snippets yet.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
