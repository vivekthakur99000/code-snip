type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({
  className = "h-4 w-4",
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <span
        className={`inline-block animate-spin rounded-full border-2 border-slate-400 border-t-transparent ${className}`}
        aria-hidden="true"
      />
      <span className="text-xs text-slate-200">{label}</span>
    </span>
  );
}
