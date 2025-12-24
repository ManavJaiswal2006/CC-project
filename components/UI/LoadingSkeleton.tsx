"use client";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-3">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-6 bg-gray-200 rounded w-24" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-t border-gray-200 flex items-center px-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/6" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white border p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-6 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-40" />
    </div>
  );
}

