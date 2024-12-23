"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4">
      <div className="text-red-700 mb-4">
        <h3 className="font-bold">Error</h3>
        <p>{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        Try again
      </button>
    </div>
  );
}
