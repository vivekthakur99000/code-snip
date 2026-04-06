"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

type DeleteSnippetButtonProps = {
  snippetId: string;
};

export function DeleteSnippetButton({ snippetId }: DeleteSnippetButtonProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const deleteMutation = api.snippets.delete.useMutation({
    onSuccess: async () => {
      await utils.snippets.getByUser.invalidate();
      router.push("/dashboard");
      router.refresh();
    },
  });

  const onDelete = () => {
    const confirmed = window.confirm("Delete this snippet? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    deleteMutation.mutate({ id: snippetId });
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleteMutation.isPending}
      className="rounded-xl border border-rose-700/60 bg-rose-900/25 px-3 py-1.5 text-xs text-rose-200 transition hover:bg-rose-800/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete snippet"}
    </button>
  );
}
