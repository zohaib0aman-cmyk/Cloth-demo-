import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/store/AuthForm";
import { CUSTOMER_DEMO, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next ?? "/account");
  return (
    <div className="container flex min-h-[70vh] items-center py-12">
      <AuthForm next={next} demo={CUSTOMER_DEMO} />
    </div>
  );
}
