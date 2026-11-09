import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBrand } from "@/lib/brand-server";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: { default: "Admin", template: `%s · Admin | ${brand.brandName}` }, robots: { index: false } };
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const newOrders = await prisma.order.count({ where: { status: "PLACED" } });
  return <AdminShell newOrders={newOrders}>{children}</AdminShell>;
}
