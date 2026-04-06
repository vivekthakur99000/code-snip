"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  snippetInputSchema,
  type SnippetInput,
} from "~/lib/validators/snippet";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";
import { api } from "~/trpc/react";
import { SnippetEditor } from "~/components/snippet/SnippetEditor";

const LANGUAGE_OPTIONS = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "cpp",
  "c",
  "php",
  "swift",
  "kotlin",
  "ruby",
  "scala",
  "dart",
  "r",
  "lua",
  "perl",
  "elixir",
  "haskell",
  "clojure",
  "objective-c",
  "powershell",
  "yaml",
  "toml",
  "html",
  "css",
  "sql",
  "bash",
  "json",
] as const;

type SnippetFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    title: string;
    code: string;
    language: string;
    isPublic: boolean;
    tags: string[];
  };
};

export function SnippetForm({ mode, initial }: SnippetFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "typescript");
  const [code, setCode] = useState(initial?.code ?? "");
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = mode === "edit" && !!initial;

  const createMutation = api.snippets.create.useMutation({
    onSuccess: async (snippet) => {
      await utils.snippets.getByUser.invalidate();
      router.push(`/snippets/${snippet.id}`);
      router.refresh();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const updateMutation = api.snippets.update.useMutation({
    onSuccess: async (snippet) => {
      await utils.snippets.getByUser.invalidate();
      await utils.snippets.getById.invalidate({ id: snippet.id });
      router.push(`/snippets/${snippet.id}`);
      router.refresh();
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const buttonLabel = useMemo(() => {
    if (isPending) {
      return "Saving...";
    }

    return isEditing ? "Update snippet" : "Create snippet";
  }, [isEditing, isPending]);

  const submit = () => {
    setErrorMessage(null);

    const parsedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const parsed = snippetInputSchema.safeParse({
      title,
      code,
      language,
      tags: parsedTags,
      isPublic,
    } satisfies SnippetInput);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      setErrorMessage(firstError);
      return;
    }

    if (isEditing && initial) {
      updateMutation.mutate({
        id: initial.id,
        ...parsed.data,
      });
      return;
    }

    createMutation.mutate(parsed.data);
  };

  return (
    <section className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300">Title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Drizzle upsert example"
          className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-green-500/20 transition focus:border-green-600/70 focus:ring"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm text-slate-300">Language</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-green-500/20 transition focus:border-green-600/70 focus:ring"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-slate-300">Tags (comma-separated)</label>
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="drizzle, trpc, nextjs"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-green-500/20 transition focus:border-green-600/70 focus:ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300">Code</label>
        <div className="mt-1">
          <SnippetEditor value={code} language={language} onChange={setCode} />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900"
        />
        Make snippet public
      </label>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div>
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-2 text-sm text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? <LoadingSpinner className="h-3.5 w-3.5" label="Saving" /> : buttonLabel}
        </button>
      </div>
    </section>
  );
}
