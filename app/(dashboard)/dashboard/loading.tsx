export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="skeleton h-7 w-32" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="skeleton h-10 w-40 rounded-md" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        {[80, 100, 90, 80].map((w, i) => (
          <div key={i} className="skeleton h-9 rounded-md" style={{ width: w }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Head */}
        <div className="border-b bg-gray-50 px-4 py-3 grid grid-cols-5 gap-4">
          {['Candidat', 'Poste', 'Date J1', 'Statut', 'Actions'].map((col) => (
            <div key={col} className="skeleton h-4 rounded" style={{ width: '60%' }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-4 grid grid-cols-5 gap-4 items-center">
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-3 w-36" />
            </div>
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="flex gap-2">
              <div className="skeleton h-4 w-14" />
              <div className="skeleton h-8 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
