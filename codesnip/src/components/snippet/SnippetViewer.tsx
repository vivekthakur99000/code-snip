import { type BundledTheme } from "shiki";

import { highlightSnippetCode } from "~/lib/shiki";
import { CopyButton } from "~/components/snippet/CopyButton";

type SnippetViewerProps = {
  title: string;
  code: string;
  language: string;
  theme?: BundledTheme;
};

export async function SnippetViewer({
  title,
  code,
  language,
  theme = "github-dark",
}: SnippetViewerProps) {
  const html = await highlightSnippetCode(code, language, theme);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1019] shadow-[0_22px_45px_rgba(2,6,23,0.7)]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <p className="truncate text-xs text-slate-300">{title}</p>
        <CopyButton code={code} />
      </div>
      <div
        className="max-h-[520px] overflow-auto text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
