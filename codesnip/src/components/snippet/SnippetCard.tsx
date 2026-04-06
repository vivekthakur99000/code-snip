import Link from "next/link";

type SnippetCardProps = {
  title: string;
  slug: string;
  code: string;
  language: string;
  views: number;
  creatorName?: string | null;
  tags?: string[];
};

function getLanguageBadgeClass(language: string) {
  const normalized = language.toLowerCase();

  if (normalized === "typescript" || normalized === "ts") {
    return "bg-blue-50 text-blue-800";
  }

  if (normalized === "python" || normalized === "py") {
    return "bg-amber-50 text-amber-800";
  }

  if (normalized === "go") {
    return "bg-teal-50 text-teal-800";
  }

  if (normalized === "rust" || normalized === "rs") {
    return "bg-red-50 text-red-800";
  }

  return "bg-neutral-100 text-neutral-700";
}

export function SnippetCard({
  title,
  slug,
  code,
  language,
  views,
  creatorName,
  tags = [],
}: SnippetCardProps) {
  return (
    <article className="grain panel rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5 hover:border-slate-500/70 hover:shadow-[0_18px_35px_rgba(2,6,23,0.65)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="truncate text-[16px] font-medium text-slate-100">{title}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getLanguageBadgeClass(language)}`}
        >
          {language}
        </span>
      </div>

      <Link href={`/s/${slug}`} className="block">
        <pre className="mt-3 max-h-24 overflow-hidden rounded-xl border border-slate-800 bg-[#070b14] p-3 font-mono text-xs text-slate-200">
          {code}
        </pre>
      </Link>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-700/90 bg-slate-900/70 px-2 py-0.5 text-xs text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="text-right">
          <p className="text-xs muted">{views} views</p>
          {creatorName && <p className="text-[11px] text-slate-400">by {creatorName}</p>}
        </div>
      </div>
    </article>
  );
}
