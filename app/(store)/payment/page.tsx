import type { Metadata } from "next";
import { PaymentGateway } from "@/components/store/PaymentGateway";

export const metadata: Metadata = { title: "Secure payment" };

export default function PaymentPage() {
  return <PaymentGateway />;
}
