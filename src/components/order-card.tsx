"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CouponRecord, ProductRecord } from "@/db/schema";
import { formatPrice } from "@/lib/money";

type OrderCardProps = {
  product: ProductRecord;
  shopAddress: string;
  shopPhone: string;
  coupons: CouponRecord[];
  onClose: () => void;
};

type AppliedCoupon = {
  code: string;
  label: string;
  discountAmount: number;
  total: number;
};

type ReceiptResult = {
  receiptNumber: string;
  receiptToken: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string;
};

const emptyForm = { name: "", phone: "", email: "", city: "", address: "", notes: "", website: "" };

export default function OrderCard({ product, shopAddress, shopPhone, coupons, onClose }: OrderCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [receipt, setReceipt] = useState<ReceiptResult | null>(null);

  const unitPrice = product.price ?? 0;
  const subtotal = unitPrice * quantity;
  const total = appliedCoupon?.total ?? subtotal;
  const featuredCoupon = coupons[0];
  const quoteLink = `https://wa.me/${shopPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in the ${product.name}. Please confirm its current price and availability.`)}`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function changeQuantity(next: number) {
    setQuantity(Math.max(1, Math.min(5, next)));
    setAppliedCoupon(null);
    setCouponMessage(couponInput ? "Reapply the coupon for the new quantity." : "");
  }

  async function applyCoupon(codeOverride?: string) {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();
    if (!code) {
      setCouponMessage("Enter a coupon code.");
      return;
    }
    setCouponInput(code);
    setCouponLoading(true);
    setCouponMessage("");
    setAppliedCoupon(null);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "That coupon could not be applied.");
      setAppliedCoupon({ code: result.code, label: result.label, discountAmount: result.discountAmount, total: result.total });
      setCouponMessage(result.message);
    } catch (error) {
      setCouponMessage(error instanceof Error ? error.message : "That coupon could not be applied.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          fulfillment,
          couponCode: appliedCoupon?.code || "",
          ...form,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not place that order just now.");
      setReceipt(result as ReceiptResult);
      setStatus("success");
      setMessage("Order received. SYS will confirm availability and next steps shortly.");
      setForm(emptyForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="order-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="order-sheet" role="dialog" aria-modal="true" aria-labelledby="order-sheet-title">
        <button className="order-sheet-close" type="button" onClick={onClose} aria-label="Close order card">×</button>
        <div className="order-sheet-media">
          <div className="order-sheet-image">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={`${product.name} laptop`} />
            ) : <div className="product-image-placeholder"><span>SYS</span></div>}
            <span className="product-badge">{product.badge}</span>
            <span className="product-status-tags">
              {product.isNewArrival && <span className="status-tag status-tag-new">New arrival</span>}
              {product.isTrending && <span className="status-tag status-tag-trending">Trending</span>}
            </span>
          </div>
          <div className="order-sheet-summary">
            <div className="product-meta"><span>{product.brand}</span><i />{product.category}</div>
            <h2 id="order-sheet-title">{product.name}</h2>
            <p>{product.description || `${product.processor} · ${product.memory} · ${product.storage}`}</p>
            <ul className="order-spec-list">
              <li><span>Processor</span><strong>{product.processor}</strong></li>
              <li><span>Memory</span><strong>{product.memory}</strong></li>
              <li><span>Storage</span><strong>{product.storage}</strong></li>
              <li><span>Graphics</span><strong>{product.graphics}</strong></li>
              <li><span>Display</span><strong>{product.display}</strong></li>
              <li><span>Condition</span><strong>{product.conditionLabel}</strong></li>
            </ul>
            <div className="order-price-block"><span>UNIT PRICE</span><strong>{formatPrice(product.price)}</strong></div>
          </div>
        </div>
        <div className="order-sheet-form">
          {status === "success" && receipt ? (
            <div className="order-success">
              <span className="order-success-mark">✓</span>
              <span className="receipt-number-chip">{receipt.receiptNumber}</span>
              <h3>Order placed.</h3>
              <p>{message}</p>
              <div className="success-total"><span>Final total</span><strong>{formatPrice(receipt.totalAmount)}</strong></div>
              {receipt.discountAmount > 0 && <p className="order-success-meta">Coupon {receipt.couponCode} saved you {formatPrice(receipt.discountAmount)}.</p>}
              <div className="order-success-actions">
                <a className="button button-dark" href={`/receipt/${receipt.receiptToken}`}>View receipt</a>
                <button className="button order-secondary-button" type="button" onClick={onClose}>Continue shopping</button>
              </div>
            </div>
          ) : product.price === null ? (
            <div className="order-form-heading">
              <span>PRICE ON REQUEST</span>
              <h3>Place your order request.</h3>
              <p>Message SYS to confirm the current price and availability before your order is finalized.</p>
              <a className="button button-dark" href={quoteLink} target="_blank" rel="noopener noreferrer">
                Place order
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9" /></svg>
              </a>
            </div>
          ) : (
            <>
              <div className="order-form-heading"><span>PLACE YOUR ORDER ON THE SITE</span><h3>Tell us how to get this laptop to you.</h3><p>Submit this card and SYS will confirm your order.</p></div>
              <form onSubmit={submitOrder}>
                <div className="order-form-fields">
                <div className="order-qty-row"><span>Quantity</span><div className="qty-stepper"><button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity">−</button><strong>{quantity}</strong><button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div></div>
                <div className="fulfillment-toggle" role="group" aria-label="How would you like to receive this laptop?"><button type="button" className={fulfillment === "pickup" ? "fulfillment-active" : ""} onClick={() => setFulfillment("pickup")}>Shop pickup</button><button type="button" className={fulfillment === "delivery" ? "fulfillment-active" : ""} onClick={() => setFulfillment("delivery")}>Delivery</button></div>
                <p className="fulfillment-hint">{fulfillment === "pickup" ? `Collect from ${shopAddress}.` : "We’ll arrange delivery after confirming your order."}</p>

                <div className="coupon-box">
                  <div className="coupon-box-heading"><span>COUPON</span>{featuredCoupon && <button type="button" onClick={() => void applyCoupon(featuredCoupon.code)}>Use {featuredCoupon.code}</button>}</div>
                  <div className="coupon-input-row"><input maxLength={40} value={couponInput} onChange={(event) => { setCouponInput(event.target.value.toUpperCase()); setAppliedCoupon(null); }} placeholder="Enter code" /><button type="button" disabled={couponLoading} onClick={() => void applyCoupon()}>{couponLoading ? "Checking…" : "Apply"}</button></div>
                  {couponMessage && <p className={appliedCoupon ? "coupon-message coupon-message-valid" : "coupon-message"}>{couponMessage}</p>}
                </div>

                <div className="form-row"><label>Your name<input required minLength={2} maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Ayesha Khan" /></label><label>Phone number<input required minLength={7} maxLength={60} type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+92 3XX XXXXXXX" /></label></div>
                <label>Email <span className="optional-label">OPTIONAL</span><input maxLength={180} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
                <label>City<input maxLength={120} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Rawalpindi" /></label>
                <label>Delivery address {fulfillment === "delivery" ? "" : <span className="optional-label">OPTIONAL</span>}<textarea required={fulfillment === "delivery"} minLength={fulfillment === "delivery" ? 8 : 0} maxLength={500} rows={2} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder={fulfillment === "delivery" ? "House / street, area, city" : "Only needed if you want delivery"} /></label>
                <label>Notes <span className="optional-label">OPTIONAL</span><textarea maxLength={2000} rows={2} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Anything we should know before confirming?" /></label>
                <label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
                </div>
                <div className="order-form-actions">
                  <div className="order-total-breakdown"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>{appliedCoupon && <div className="order-discount-line"><span>{appliedCoupon.code}</span><strong>− {formatPrice(appliedCoupon.discountAmount)}</strong></div>}<div className="order-total-row"><span>Order total</span><strong>{formatPrice(total)}</strong></div></div>
                  <button className="button button-dark form-submit" type="submit" disabled={status === "sending" || !product.isAvailable}>{status === "sending" ? "Placing your order…" : "Place order"}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12m-5-5 5 5-5 5" /></svg></button>
                  {message && status === "error" && <p className="form-feedback form-feedback-error" role="alert">{message}</p>}
                  <span className="form-privacy">Your details are only used to confirm this order.</span>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
