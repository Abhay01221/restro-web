export default function SkeletonCard() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="skeleton w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
