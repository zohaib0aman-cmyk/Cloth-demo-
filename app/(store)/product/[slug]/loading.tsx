export default function Loading() {
  return (
    <div className="container grid gap-10 py-10 lg:grid-cols-[1.15fr_1fr]">
      <div className="skeleton aspect-[4/5] rounded-3xl" />
      <div className="space-y-4">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-12 w-4/5" />
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-8 h-10 w-2/3" />
        <div className="skeleton h-12 w-full rounded-full" />
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
