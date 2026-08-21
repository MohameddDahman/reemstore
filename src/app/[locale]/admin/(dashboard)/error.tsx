"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-ink">Something went wrong loading this page.</p>
      <p className="max-w-md text-xs text-ink-soft">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-full bg-ink px-5 py-2 text-sm text-cream"
      >
        Try again
      </button>
    </div>
  );
}
