"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, Package, RefreshCcw, Settings, Shirt, Ticket, Users, X, TriangleAlert } from "lucide-react";
import { AnimatedIcon } from "../motion/AnimatedIcon";
import { BrandLogo } from "../BrandLogo";
import { adminLogout, resetDemo } from "@/app/admin/actions";
import { useBrand } from "@/components/BrandContext";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Shirt },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Store settings", icon: Settings },
];

export function AdminShell({ children, newOrders }: { children: React.ReactNode; newOrders: number }) {
  const brand = useBrand();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <BrandLogo size="sm" />
        <div className="min-w-0">
          <p className="truncate font-serif text-lg font-semibold leading-tight">{brand.brandName}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-mute">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n, i) => (
          <Link key={n.href} href={n.href} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive(n.href) ? "text-white" : "text-ink-soft hover:bg-ink/5 hover:text-ink")}>
            {isActive(n.href) && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <span className="relative flex items-center gap-3">
              <AnimatedIcon icon={n.icon} size={18} delay={i * 0.03} /> {n.label}
            </span>
            {n.href === "/admin/orders" && newOrders > 0 && <span className="relative ml-auto rounded-full bg-brand px-2 text-[10px] font-bold text-white">{newOrders}</span>}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/5">
          <AnimatedIcon icon={ExternalLink} size={17} /> View store
        </Link>
        <button onClick={() => setConfirm(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/5">
          <AnimatedIcon icon={RefreshCcw} size={17} /> Reset demo
        </button>
        <form action={adminLogout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-ink/5">
            <AnimatedIcon icon={LogOut} size={17} /> Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-full p-2 hover:bg-ink/5">
          <AnimatedIcon icon={Menu} />
        </button>
        <span className="flex items-center gap-2">
          <BrandLogo size="sm" />
          <span className="font-serif text-lg font-semibold">Admin</span>
        </span>
        <Link href="/" target="_blank" className="rounded-full p-2 hover:bg-ink/5" aria-label="View store">
          <AnimatedIcon icon={ExternalLink} size={18} />
        </Link>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.aside className="h-full w-72 bg-white" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 330, damping: 34 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-full p-2 hover:bg-ink/5" aria-label="Close menu">
                <X size={18} />
              </button>
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="lg:pl-64">
        <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </motion.div>
      </main>

      <AnimatePresence>
        {confirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !pending && setConfirm(false)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
              {done ? (
                <div className="text-center">
                  <p className="font-serif text-2xl font-semibold">Demo restored</p>
                  <p className="mt-2 text-sm text-ink-mute">Sample products, orders and settings are back. The next viewing starts clean.</p>
                  <button onClick={() => (setConfirm(false), setDone(false))} className="btn-dark mt-6 w-full">Done</button>
                </div>
              ) : (
                <>
                  <span className="inline-flex rounded-full bg-amber-100 p-3 text-amber-700">
                    <TriangleAlert size={22} />
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold">Reset the demo store?</h3>
                  <p className="mt-2 text-sm text-ink-mute">This restores the original sample products, categories, orders, coupons and settings. Changes and test orders made during this demo will be removed.</p>
                  <div className="mt-6 flex gap-2">
                    <button disabled={pending} onClick={() => setConfirm(false)} className="btn-outline flex-1">Cancel</button>
                    <button
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          await resetDemo();
                          setDone(true);
                          router.refresh();
                        })
                      }
                      className="btn-primary flex-1"
                    >
                      {pending ? (
                        <>
                          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="inline-flex">
                            <RefreshCcw size={16} />
                          </motion.span>
                          Restoring…
                        </>
                      ) : (
                        "Reset demo"
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
