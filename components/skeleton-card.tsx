export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200"></div>
      
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        
        {/* Description skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        
        {/* Category skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Footer skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
