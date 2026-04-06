"use client";

import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";

export function CopyButton({ code }: { code: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => void copy(code)}
      className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
