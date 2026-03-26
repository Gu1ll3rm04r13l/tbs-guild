export default function RosterLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-1">
        <div className="h-3 w-24 rounded bg-[#1e1e1e] animate-pulse" />
        <div className="h-8 w-48 rounded bg-[#1e1e1e] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-[#262626] bg-[#161616] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
