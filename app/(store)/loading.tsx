export default function Loading() {
  return (
    <div>
      <div className="skeleton h-[60vh] rounded-none" />
      <div className="container grid grid-cols-2 gap-4 py-16 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[3/4] rounded-t-full" />
            <div className="skeleton mx-auto mt-3 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
