"use client";

import { useState, type FormEvent } from "react";
import type { CouponRecord } from "@/db/schema";
import { formatPrice } from "@/lib/money";

type CouponForm = {
  code: string;
  label: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minimumOrder: string;
  maximumDiscount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

function emptyForm(): CouponForm {
  return { code: "", label: "", description: "", discountType: "percent", discountValue: "5", minimumOrder: "0", maximumDiscount: "", usageLimit: "", startsAt: "", expiresAt: "", isActive: true };
}

function localDateInput(value: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function toForm(coupon: CouponRecord): CouponForm {
  return {
    code: coupon.code,
    label: coupon.label,
    description: coupon.description,
    discountType: coupon.discountType === "fixed" ? "fixed" : "percent",
    discountValue: String(coupon.discountValue),
    minimumOrder: String(coupon.minimumOrder),
    maximumDiscount: coupon.maximumDiscount === null ? "" : String(coupon.maximumDiscount),
    usageLimit: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
    startsAt: localDateInput(coupon.startsAt),
    expiresAt: localDateInput(coupon.expiresAt),
    isActive: coupon.isActive,
  };
}

export default function AdminCoupons({ initialCoupons, accessToken }: { initialCoupons: CouponRecord[]; accessToken?: string }) {
  const [coupons, setCoupons] = useState(initialCoupons);

  function adminHeaders(includeJson = true): HeadersInit {
    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }
  const [editing, setEditing] = useState<CouponRecord | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function openNew() {
    setEditing(null);
    setForm(emptyForm());
    setMessage(null);
    setOpen(true);
  }

  function openEdit(coupon: CouponRecord) {
    setEditing(coupon);
    setForm(toForm(coupon));
    setMessage(null);
    setOpen(true);
  }

  async function saveCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      discountValue: Number(form.discountValue),
      minimumOrder: Number(form.minimumOrder || 0),
      maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
    };
    try {
      const response = await fetch(editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons", {
        method: editing ? "PATCH" : "POST",
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the coupon.");
      setCoupons((current) => editing ? current.map((coupon) => coupon.id === result.id ? result : coupon) : [result, ...current]);
      setOpen(false);
      setMessage({ kind: "success", text: editing ? "Coupon updated." : "Coupon created and ready to use." });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Could not save the coupon." });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCoupon(coupon: CouponRecord) {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE", headers: adminHeaders(false) });
    const result = await response.json();
    if (!response.ok) {
      setMessage({ kind: "error", text: result.error || "Could not delete the coupon." });
      return;
    }
    setCoupons((current) => current.filter((item) => item.id !== coupon.id));
    setMessage({ kind: "success", text: `${coupon.code} deleted.` });
  }

  return (
    <>
      {message && <div className={`admin-notice admin-notice-${message.kind}`} role="status"><span>{message.kind === "success" ? "✓" : "!"}</span>{message.text}<button type="button" onClick={() => setMessage(null)}>×</button></div>}
      <section className="admin-work-card">
        <div className="admin-card-heading"><div><span className="admin-eyebrow">PROMOTIONS</span><h2>Coupon campaigns <span>{coupons.length}</span></h2></div><button className="admin-primary-button" type="button" onClick={openNew}><span>+</span> New coupon</button></div>
        {coupons.length ? <div className="coupon-admin-list">{coupons.map((coupon) => {
          const discount = coupon.discountType === "fixed" ? formatPrice(coupon.discountValue) : `${coupon.discountValue}%`;
          return <article className="coupon-admin-card" key={coupon.id}>
            <div className="coupon-admin-code"><span>{coupon.code}</span><small>{coupon.isActive ? "ACTIVE" : "PAUSED"}</small></div>
            <div className="coupon-admin-info"><strong>{coupon.label}</strong><p>{coupon.description || `${discount} discount`}</p><span>{discount} off · Min. {formatPrice(coupon.minimumOrder)}{coupon.maximumDiscount ? ` · Cap ${formatPrice(coupon.maximumDiscount)}` : ""}</span></div>
            <div className="coupon-admin-usage"><span>USES</span><strong>{coupon.timesUsed}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</strong></div>
            <div className="admin-row-actions"><button type="button" onClick={() => openEdit(coupon)}>Edit</button><button className="admin-delete-button" type="button" onClick={() => void deleteCoupon(coupon)}>×</button></div>
          </article>;
        })}</div> : <div className="admin-empty-state"><span>%</span><h3>No coupon campaigns yet.</h3><p>Create one to offer a discount at checkout.</p></div>}
      </section>

      {open && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="coupon-dialog-title">
          <div className="admin-modal-header"><div><span className="admin-eyebrow">COUPON CAMPAIGN</span><h2 id="coupon-dialog-title">{editing ? "Edit coupon" : "Create a coupon"}</h2><p>Discounts are always recalculated securely on the server.</p></div><button type="button" className="admin-modal-close" onClick={() => setOpen(false)}>×</button></div>
          <form className="admin-product-form" onSubmit={saveCoupon}>
            <div className="admin-product-form-grid">
              <label>Coupon code<input required maxLength={40} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s/g, "") })} placeholder="WELCOME5" /></label>
              <label>Customer label<input required maxLength={100} value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder="5% welcome discount" /></label>
              <label className="form-field-wide">Description<textarea rows={2} maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <label>Discount type<select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as "percent" | "fixed" })}><option value="percent">Percentage</option><option value="fixed">Fixed PKR amount</option></select></label>
              <label>Discount value<input required type="number" min="1" max={form.discountType === "percent" ? 100 : undefined} value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} /></label>
              <label>Minimum order (PKR)<input type="number" min="0" value={form.minimumOrder} onChange={(event) => setForm({ ...form, minimumOrder: event.target.value })} /></label>
              <label>Maximum discount <span className="optional-label">OPTIONAL</span><input type="number" min="1" value={form.maximumDiscount} onChange={(event) => setForm({ ...form, maximumDiscount: event.target.value })} /></label>
              <label>Starts <span className="optional-label">OPTIONAL</span><input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label>
              <label>Expires <span className="optional-label">OPTIONAL</span><input type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} /></label>
              <label>Usage limit <span className="optional-label">OPTIONAL</span><input type="number" min="1" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} /></label>
            </div>
            <div className="admin-form-toggles"><label><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><span className="toggle-visual" /> Coupon is active</label></div>
            {message?.kind === "error" && <p className="admin-form-error">{message.text}</p>}
            <div className="admin-modal-actions"><button className="admin-modal-cancel" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save coupon"}<span>→</span></button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
