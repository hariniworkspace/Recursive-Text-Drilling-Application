export default function LoadingSpinner({
  label = "Loading...",
  size = "medium",
  className = ""
}) {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-4",
    large: "h-12 w-12 border-4"
  };

  const spinnerSize = sizeClasses[size] ?? sizeClasses.medium;

  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className={`${spinnerSize} inline-block animate-spin rounded-full border-slate-200 border-t-indigo-600`}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-slate-600">
          {label}
        </span>
      )}
    </div>
  );
}