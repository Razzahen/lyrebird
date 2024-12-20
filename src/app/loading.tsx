export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>

        {/* Controls skeleton */}
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Note input skeleton */}
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 flex-1 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>

        {/* Notes list skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
