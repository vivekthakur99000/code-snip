type SidebarProps = {
  tags: Array<{ id: string; name: string }>;
};

export function Sidebar({ tags }: SidebarProps) {
  return (
    <aside className="hidden w-[220px] border-r border-[var(--color-border)]/80 bg-[#0b1220]/80 p-4 md:block">
      <section>
        <p className="text-xs tracking-[0.18em] muted">WORKSPACE</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="rounded-md bg-[var(--color-accent-soft)] px-2 py-1 text-green-300">All snippets</li>
          <li className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800/70">Public</li>
          <li className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800/70">Private</li>
        </ul>
      </section>

      <section className="mt-6">
        <p className="text-xs tracking-[0.18em] muted">TAGS</p>
        <ul className="mt-2 space-y-1 text-sm">
          {tags.map((tag) => (
            <li key={tag.id} className="rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-800/70">
              {tag.name}
            </li>
          ))}
          {tags.length === 0 && <li className="text-xs muted">No tags yet</li>}
        </ul>
      </section>
    </aside>
  );
}
