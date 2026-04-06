"use client";

export default function PublicSnippetError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return <p className="p-6 text-sm text-neutral-500">Public snippet failed to load.</p>;
}
