"use client";

export default function RootError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return (
    <main className="min-h-[40vh] bg-neutral-50 p-6">
      <p className="mx-auto max-w-6xl text-sm text-neutral-500">
        Something went wrong while loading this page.
      </p>
    </main>
  );
}
