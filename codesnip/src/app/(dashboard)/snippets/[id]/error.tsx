"use client";

export default function SnippetError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return <p className="p-6 text-sm text-neutral-500">Snippet failed to load.</p>;
}
