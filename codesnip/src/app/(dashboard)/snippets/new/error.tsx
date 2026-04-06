"use client";

export default function NewSnippetError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return <p className="p-6 text-sm text-neutral-500">Snippet form failed to load.</p>;
}
