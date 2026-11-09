import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/store/PageHero";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Returns & exchanges" };

export default function ReturnsPage() {
  return (
    <>
      <PageHero eyebrow="Policy" title="Returns & exchanges" text="Easy 7-day returns and free exchanges on size — because it should fit just right." />
      <Reveal className="container prose-store max-w-3xl py-14">
        <h2>Our promise</h2>
        <p>If something isn&apos;t right, you can return or exchange it within 7 days of delivery. We arrange a free reverse pickup from your doorstep across most pincodes in India.</p>
        <h2>What can be returned</h2>
        <ul>
          <li>Unused, unwashed items with original tags and packaging intact.</li>
          <li>Sarees with the fall and pico not yet attached.</li>
          <li>Items bought on sale are eligible for exchange or store credit.</li>
        </ul>
        <h2>What can&apos;t be returned</h2>
        <ul>
          <li>Customised or altered pieces, including stitched blouses.</li>
          <li>Innerwear, masks and accessories for hygiene reasons.</li>
        </ul>
        <h2>How refunds work</h2>
        <p>Once your return passes a quick quality check, refunds are issued within 5–7 working days to the original payment method. Cash on delivery orders are refunded by bank transfer or UPI.</p>
        <h2>Start a return</h2>
        <p>
          Message us on WhatsApp or through our <Link href="/contact" className="font-semibold text-brand">contact page</Link> with your order ID. You can find it on your bill or on the <Link href="/track" className="font-semibold text-brand">tracking page</Link>.
        </p>
      </Reveal>
    </>
  );
}
