import type { Metadata } from "next";
import { PageHero } from "@/components/store/PageHero";
import { ContactClient } from "@/components/store/ContactClient";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="We're here to help" title="Get in touch" text="Questions about sizing, an order or a custom request? Reach us however suits you best." />
      <ContactClient />
    </>
  );
}
