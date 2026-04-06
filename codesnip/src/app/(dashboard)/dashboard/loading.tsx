import { LoadingSpinner } from "~/components/ui/LoadingSpinner";

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <LoadingSpinner className="h-5 w-5" label="Loading dashboard" />
    </div>
  );
}
