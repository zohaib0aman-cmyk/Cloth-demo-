import type { Metadata } from "next";
import { WishlistClient } from "@/components/store/WishlistClient";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  return <WishlistClient products={await getProducts()} />;
}
