import { LoadingSpinner } from "~/components/ui/LoadingSpinner";

export default function RootLoading() {
  return (
    <main className="min-h-[40vh] p-6">
      <div className="mx-auto flex max-w-6xl justify-center">
        <LoadingSpinner className="h-5 w-5" label="Loading workspace" />
      </div>
    </main>
  );
}
