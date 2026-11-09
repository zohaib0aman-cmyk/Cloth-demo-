import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { AdminLoginForm } from "@/components/admin/LoginForm";
import { ADMIN_DEMO, isAdmin } from "@/lib/auth";
import { getBrand } from "@/lib/brand-server";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  const brand = await getBrand();
  return (
    <div className="grain flex min-h-screen items-center justify-center bg-ivory-deep px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-lift sm:p-9">
        <div className="text-center">
          <BrandLogo size="lg" />
          <h1 className="mt-4 text-3xl font-semibold">{brand.brandName} Admin</h1>
          <p className="mt-1 text-sm text-ink-mute">Manage products, orders and your storefront.</p>
        </div>
        <div className="mt-7">
          <AdminLoginForm demo={ADMIN_DEMO} />
        </div>
      </div>
    </div>
  );
}
