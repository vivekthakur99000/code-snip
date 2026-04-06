import { LoadingSpinner } from "~/components/ui/LoadingSpinner";

export default function PublicSnippetLoading() {
  return (
    <div className="p-6">
      <LoadingSpinner className="h-5 w-5" label="Loading public snippet" />
    </div>
  );
}
