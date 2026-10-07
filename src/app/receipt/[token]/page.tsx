import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import ReceiptActions from "@/components/receipt-actions";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getStoreSettings } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order receipt | SYS Solutions",
  robots: { index: false, follow: false },
};

type ReceiptPageProps = { params: Promise<{ token: string }> };

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const [[order], settings] = await Promise.all([
    db.select().from(orders).where(eq(orders.receiptToken, token)).limit(1),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  const subtotal = order.subtotal || order.productPrice * order.quantity;
  const total = order.totalAmount || Math.max(0, subtotal - order.discountAmount);

  return (
    <main className="receipt-page">
      <section className="receipt-paper">
        <header className="receipt-header">
          <Logo />
          <div><span>ORDER RECEIPT</span><strong>{order.receiptNumber || `SYS-${order.id}`}</strong></div>
        </header>

        <div className="receipt-status"><i /> Order received <span>{new Date(order.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" })}</span></div>

        <div className="receipt-parties">
          <div><span>BILLED TO</span><strong>{order.name}</strong><p>{order.phone}<br />{order.email || "Email not provided"}</p></div>
          <div><span>FULFILMENT</span><strong>{order.fulfillment === "delivery" ? "Delivery" : "Shop pickup"}</strong><p>{order.fulfillment === "delivery" ? [order.address, order.city].filter(Boolean).join(", ") : settings.address}</p></div>
        </div>

        <div className="receipt-table">
          <div className="receipt-table-head"><span>ITEM</span><span>QTY</span><span>UNIT PRICE</span><span>AMOUNT</span></div>
          <div className="receipt-table-row"><span><strong>{order.productName}</strong><small>Quality-checked laptop</small></span><span>{order.quantity}</span><span>{formatPrice(order.productPrice)}</span><span>{formatPrice(subtotal)}</span></div>
        </div>

        <div className="receipt-summary">
          <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          {order.discountAmount > 0 && <div className="receipt-discount"><span>Coupon {order.couponCode}</span><strong>− {formatPrice(order.discountAmount)}</strong></div>}
          <div className="receipt-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
        </div>

        {order.notes && <div className="receipt-notes"><span>ORDER NOTES</span><p>{order.notes}</p></div>}
        <footer className="receipt-footer"><p>Thank you for choosing SYS Solutions. Our team will contact you to confirm availability and fulfilment.</p><div><span>{settings.phone}</span><span>{settings.email}</span></div></footer>
      </section>
      <ReceiptActions />
    </main>
  );
}
