export default function LaptopCardSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>

      {/* Model & Owner Skeleton */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-36"></div>
      </div>

      {/* Accessories Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-3 bg-gray-200 rounded flex-1"></div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-3 bg-gray-200 rounded flex-1"></div>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-3 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
}

