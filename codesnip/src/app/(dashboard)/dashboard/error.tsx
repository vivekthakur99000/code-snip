"use client";

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);

  return <p className="p-6 text-sm text-neutral-500">Dashboard failed to load.</p>;
}
