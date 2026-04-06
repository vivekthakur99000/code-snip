"use client";

import { type CSSProperties, useMemo, useState } from "react";

import { useDebounce } from "~/hooks/useDebounce";
import { SnippetCard } from "~/components/snippet/SnippetCard";
import { api } from "~/trpc/react";

const POPULAR_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "cpp",
  "php",
  "swift",
  "kotlin",
  "ruby",
  "sql",
  "bash",
  "json",
] as const;

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const debounced = useDebounce(query, 300);
  const hasActiveFilter = debounced.trim().length > 0 || languageFilter !== "all";

  const { data: languageStats } = api.snippets.listLanguages.useQuery();
  const {
    data: defaultSnippets,
    isFetching: isFetchingDefault,
  } = api.snippets.listPublic.useQuery(
    { limit: 50 },
    { enabled: !hasActiveFilter },
  );

  const {
    data: filteredSnippets,
    isFetching: isFetchingFiltered,
    error,
  } = api.snippets.search.useQuery(
    {
      query: debounced,
      language: languageFilter,
      limit: 50,
    },
    { enabled: hasActiveFilter },
  );

  const isRateLimited = error?.data?.code === "TOO_MANY_REQUESTS";
  const isFetching = hasActiveFilter ? isFetchingFiltered : isFetchingDefault;
  const snippets = hasActiveFilter ? (filteredSnippets ?? []) : (defaultSnippets ?? []);

  const languageCountMap = useMemo(() => {
    return new Map((languageStats ?? []).map((item) => [item.language.toLowerCase(), item.count]));
  }, [languageStats]);

  const languageOptions = useMemo(() => {
    const dynamicLanguages = (languageStats ?? []).map((item) => item.language.toLowerCase());
    const combined = [
      ...POPULAR_LANGUAGES,
      ...dynamicLanguages,
    ];

    return [...new Set(combined)];
  }, [languageStats]);

  const popularLanguageOptions = useMemo(() => {
    return languageOptions.slice(0, 8);
  }, [languageOptions]);

  const displayedLanguageOptions = showAllLanguages
    ? languageOptions
    : popularLanguageOptions;

  return (
    <section>
      <div className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search public snippets"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 pr-16 text-sm text-slate-100 outline-none ring-green-500/20 transition focus:border-green-500/60 focus:ring"
        />
        <span className="absolute right-3 top-2.5 rounded-md border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-xs text-slate-400">
          ⌘K
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-400">Most popular languages</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLanguageFilter("all")}
          className={[
            "rounded-full border px-3 py-1 text-xs",
            languageFilter === "all"
              ? "border-green-700/60 bg-green-900/35 text-green-200"
              : "border-slate-700 bg-slate-900/75 text-slate-300",
          ].join(" ")}
        >
          All
        </button>
        {displayedLanguageOptions.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguageFilter(lang)}
            className={[
              "rounded-full border px-3 py-1 text-xs",
              languageFilter === lang
                ? "border-green-700/60 bg-green-900/35 text-green-200"
                : "border-slate-700 bg-slate-900/75 text-slate-300",
            ].join(" ")}
          >
            {lang.toUpperCase()} {languageCountMap.get(lang) ? `(${languageCountMap.get(lang)})` : ""}
          </button>
        ))}
        {languageOptions.length > popularLanguageOptions.length && (
          <button
            type="button"
            onClick={() => setShowAllLanguages((prev) => !prev)}
            className="rounded-full border border-slate-700 bg-slate-900/75 px-3 py-1 text-xs text-slate-300"
          >
            {showAllLanguages ? "Show fewer" : "View all languages"}
          </button>
        )}
      </div>

      <div className="mt-6">
        {isRateLimited && (
          <p className="mb-2 text-xs text-red-600">
            Search rate limit reached. Please wait a minute and try again.
          </p>
        )}

        {isFetching && <p className="text-xs muted">Loading snippets...</p>}

        {!isFetching && snippets.length === 0 && (
          <p className="text-sm muted">No snippets found.</p>
        )}

        {!isFetching && snippets.length > 0 && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((item, index) => (
              <div
                key={item.id}
                className="stagger-item"
                style={{ "--stagger": `${index * 35}ms` } as CSSProperties}
              >
                <SnippetCard
                  title={item.title}
                  slug={item.slug}
                  code={item.code}
                  language={item.language}
                  views={item.views}
                  creatorName={item.creatorName}
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </section>
  );
}
