"use client";

export default function EditSnippetError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return <p className="p-6 text-sm text-neutral-500">Snippet edit page failed to load.</p>;
}
