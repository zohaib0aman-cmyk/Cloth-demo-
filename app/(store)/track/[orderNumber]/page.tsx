import type { Metadata } from "next";
import { TrackForm, TrackingTimeline } from "@/components/store/Tracking";
import { getOrderByNumber } from "@/lib/orders";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Tracking ${(await params).orderNumber.toUpperCase()}` };
}

export default async function TrackOrderPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  return (
    <div className="container max-w-5xl py-10 sm:py-14">
      <p className="eyebrow">Order tracking</p>
      <h1 className="section-title mt-2">Track your order</h1>
      {order ? (
        <div className="mt-8">
          <TrackingTimeline initial={order} />
        </div>
      ) : (
        <div className="card mt-8 p-8 text-center">
          <p className="font-serif text-2xl">We couldn&apos;t find order “{orderNumber.toUpperCase()}”</p>
          <p className="mt-2 text-sm text-ink-mute">Check the ID on your confirmation page or bill and try again.</p>
          <div className="mx-auto mt-6 max-w-lg">
            <TrackForm initial={orderNumber} />
          </div>
        </div>
      )}
    </div>
  );
}
