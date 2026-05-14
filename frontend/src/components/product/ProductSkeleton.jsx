export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-square" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-3 w-2/3 rounded" />
            <div className="skeleton h-4 rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="flex justify-between items-center mt-3">
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton w-9 h-9 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
