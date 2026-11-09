import { StoreProvider } from "@/components/store/StoreContext";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { SplashScreen } from "@/components/store/SplashScreen";
import { FlyToCartProvider } from "@/components/store/FlyToCart";
import { getSettings } from "@/lib/settings";
import { getCategories, getCollections } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, collections, user] = await Promise.all([getSettings(), getCategories(), getCollections(true), getCurrentUser()]);
  return (
    <StoreProvider
      value={{
        settings,
        categories: categories.map((c) => ({ name: c.name, slug: c.slug, image: c.image })),
        collections: collections.map((c) => ({ name: c.name, slug: c.slug, image: c.image, tagline: c.tagline })),
        user: user ? { id: user.id, name: user.name, email: user.email, phone: user.phone } : null,
      }}
    >
      <FlyToCartProvider>
        <SplashScreen />
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </FlyToCartProvider>
    </StoreProvider>
  );
}
