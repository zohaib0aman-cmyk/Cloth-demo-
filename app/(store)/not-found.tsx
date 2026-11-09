import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-serif text-8xl font-semibold text-brand/20">404</p>
      <h1 className="mt-2 text-4xl font-semibold">This page has wandered off</h1>
      <p className="mt-3 max-w-md text-ink-mute">The link may be old or the product may no longer be available.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-dark">Go home</Link>
        <Link href="/shop" className="btn-outline">Browse the shop</Link>
      </div>
    </div>
  );
}
