import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Store settings" };

export default async function SettingsPage() {
  const [s, row] = await Promise.all([getSettings(), prisma.setting.findUnique({ where: { id: 1 } })]);
  return (
    <>
      <AdminHeader title="Store settings" subtitle="Banners, theme, announcement, delivery, GST and contact details." />
      <SettingsForm initial={{ ...s, email: row?.email ?? "" }} emailPlaceholder={s.email} />
    </>
  );
}
