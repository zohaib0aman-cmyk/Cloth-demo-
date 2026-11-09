import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <BrandLogo size="lg" />
      <p className="mt-8 font-serif text-7xl font-semibold text-brand/25">404</p>
      <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
      <Link href="/" className="btn-dark mt-8">Back to the store</Link>
    </div>
  );
}
