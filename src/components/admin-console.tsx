"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CouponRecord, InquiryRecord, OrderRecord, ProductRecord, SiteSettingsRecord } from "@/db/schema";
import { formatPrice } from "@/lib/money";
import { Logo } from "@/components/logo";
import AdminCoupons from "@/components/admin-coupons";

type AdminTab = "inventory" | "coupons" | "orders" | "inquiries" | "website";
type ProductForm = {
  name: string; brand: string; category: string; processor: string; memory: string; storage: string;
  graphics: string; display: string; conditionLabel: string; badge: string; promotionLabel: string; imageUrl: string;
  description: string; price: string; isFeatured: boolean; isNewArrival: boolean; isTrending: boolean; isAvailable: boolean; sortOrder: string;
};
type Notice = { kind: "success" | "error"; text: string } | null;

function emptyProduct(): ProductForm {
  return {
    name: "", brand: "", category: "Business", processor: "", memory: "", storage: "",
    graphics: "Integrated graphics", display: "", conditionLabel: "Quality checked", badge: "Verified stock", promotionLabel: "",
    imageUrl: "", description: "", price: "", isFeatured: false, isNewArrival: false, isTrending: false, isAvailable: true, sortOrder: "100",
  };
}

function productToForm(product: ProductRecord): ProductForm {
  return {
    name: product.name, brand: product.brand, category: product.category, processor: product.processor,
    memory: product.memory, storage: product.storage, graphics: product.graphics, display: product.display,
    conditionLabel: product.conditionLabel, badge: product.badge, promotionLabel: product.promotionLabel, imageUrl: product.imageUrl,
    description: product.description, price: product.price === null ? "" : String(product.price),
    isFeatured: product.isFeatured, isNewArrival: product.isNewArrival, isTrending: product.isTrending, isAvailable: product.isAvailable, sortOrder: String(product.sortOrder),
  };
}

function AdminIcon({ name }: { name: "grid" | "ticket" | "bag" | "inbox" | "settings" }) {
  if (name === "grid") return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="12" y="3" width="5" height="5" rx="1" /><rect x="3" y="12" width="5" height="5" rx="1" /><rect x="12" y="12" width="5" height="5" rx="1" /></svg>;
  if (name === "ticket") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V6Z" /><path d="M10 7.5v1m0 2v1m0 2v1" /></svg>;
  if (name === "bag") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7h10l-.8 9H5.8L5 7Zm3-1.5A2 2 0 0 1 10 3.5 2 2 0 0 1 12 5.5" /></svg>;
  if (name === "inbox") return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4h14v12H3zM3 11h4l1 2h4l1-2h4" /></svg>;
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3" /><path d="m16 11 1.1 1.7-1.4 2.4-2 .1-1.1 1.4h-2.8l-1.1-1.4-2-.1-1.4-2.4L6.4 11l-.1-2L5 7.3l1.4-2.4 2-.1L9.5 3.4h2.8l1.1 1.4 2 .1 1.4 2.4L15.7 9z" /></svg>;
}

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      setPassword("");
      if (typeof result.session !== "string") throw new Error("Admin session could not be created.");
      window.location.assign(`/admin?session=${encodeURIComponent(result.session)}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-back-link" href="/"><span>←</span> Back to SYS Solutions</a>
      <div className="admin-login-card">
        <div className="admin-login-brand"><Logo /></div>
        <div className="admin-lock-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" /></svg></div>
        <span className="admin-kicker">PRIVATE WORKSPACE</span>
        <h1>Welcome back.</h1>
        <p className="admin-login-desc">Sign in to manage the SYS Solutions website, inventory and customer messages.</p>
        <form onSubmit={signIn} className="admin-login-form">
          <label htmlFor="admin-password">Admin password</label>
          <input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button className="admin-primary-button admin-login-submit" type="submit" disabled={loading}>{loading ? "Checking access…" : "Sign in securely"}<span>→</span></button>
        </form>
        <div className="admin-login-secure"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="1.5" /><path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7" /></svg><span>Private, secure admin access</span></div>
        <p className="admin-setup-hint">First time here? Configure <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> in your server environment. See <a href="/admin-setup.html">admin setup</a>.</p>
      </div>
      <span className="admin-login-footer">SYS SOLUTIONS <i /> RAWALPINDI, PAKISTAN</span>
    </main>
  );
}

export function AdminConsole({
  initialProducts,
  initialInquiries,
  initialOrders,
  initialCoupons,
  settings,
  accessToken,
}: {
  initialProducts: ProductRecord[];
  initialInquiries: InquiryRecord[];
  initialOrders: OrderRecord[];
  initialCoupons: CouponRecord[];
  settings: SiteSettingsRecord;
  accessToken?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("inventory");
  const [products, setProducts] = useState(initialProducts);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [settingsForm, setSettingsForm] = useState({
    announcement: settings.announcement, headline: settings.headline, subheadline: settings.subheadline,
    phone: settings.phone, email: settings.email, address: settings.address,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<Notice>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [updatingInquiry, setUpdatingInquiry] = useState<number | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  function adminHeaders(includeJson = true): HeadersInit {
    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => !query || `${product.name} ${product.brand} ${product.category} ${product.processor}`.toLowerCase().includes(query));
  }, [products, search]);
  const availableCount = products.filter((product) => product.isAvailable).length;
  const newInquiryCount = inquiries.filter((inquiry) => inquiry.status === "new").length;
  const newOrderCount = orders.filter((order) => order.status === "new").length;

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm(emptyProduct());
    setProductError("");
    setDialogOpen(true);
  }

  function openEditProduct(product: ProductRecord) {
    setEditingProduct(product);
    setProductForm(productToForm(product));
    setProductError("");
    setDialogOpen(true);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductSaving(true);
    setProductError("");
    const payload = { ...productForm, price: productForm.price.trim() ? Number(productForm.price) : null, sortOrder: Number(productForm.sortOrder) };
    try {
      const response = await fetch(editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products", {
        method: editingProduct ? "PATCH" : "POST",
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this laptop.");
      const saved = result as ProductRecord;
      setProducts((current) => editingProduct ? current.map((product) => product.id === saved.id ? saved : product) : [...current, saved].sort((a, b) => a.sortOrder - b.sortOrder));
      setDialogOpen(false);
      setNotice({ kind: "success", text: editingProduct ? "Laptop details updated." : "Laptop added to your inventory." });
      router.refresh();
    } catch (requestError) {
      setProductError(requestError instanceof Error ? requestError.message : "Could not save this laptop.");
    } finally {
      setProductSaving(false);
    }
  }

  async function removeProduct(product: ProductRecord) {
    if (!window.confirm(`Remove ${product.name} from the inventory?`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE", headers: adminHeaders(false) });
    const result = await response.json();
    if (!response.ok) {
      setNotice({ kind: "error", text: result.error || "Could not remove that laptop." });
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice({ kind: "success", text: `${product.name} removed from the inventory.` });
    router.refresh();
  }

  async function updateOrderStatus(id: number, status: string) {
    setUpdatingOrder(id);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH", headers: adminHeaders(), body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this order.");
      setOrders((current) => current.map((order) => order.id === id ? result as OrderRecord : order));
    } catch (requestError) {
      setNotice({ kind: "error", text: requestError instanceof Error ? requestError.message : "Could not update this order." });
    } finally {
      setUpdatingOrder(null);
    }
  }

  async function updateInquiryStatus(id: number, status: string) {
    setUpdatingInquiry(id);
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "PATCH", headers: adminHeaders(), body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this inquiry.");
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? result as InquiryRecord : inquiry));
    } catch (requestError) {
      setNotice({ kind: "error", text: requestError instanceof Error ? requestError.message : "Could not update this inquiry." });
    } finally {
      setUpdatingInquiry(null);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsSaving(true);
    setSettingsNotice(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT", headers: adminHeaders(), body: JSON.stringify(settingsForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save site settings.");
      setSettingsNotice({ kind: "success", text: "Your website details are saved and live." });
      router.refresh();
    } catch (requestError) {
      setSettingsNotice({ kind: "error", text: requestError instanceof Error ? requestError.message : "Could not save site settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function signOut() {
    setLogoutLoading(true);
    await fetch("/api/admin/logout", { method: "POST", headers: adminHeaders(false) });
    window.location.assign("/admin");
  }

  const sectionTitles: Record<AdminTab, { title: string; eyebrow: string; description: string }> = {
    inventory: { title: "Your inventory", eyebrow: "PRODUCTS", description: "Keep your live laptop collection clear, current and easy to shop." },
    coupons: { title: "Coupons & offers", eyebrow: "PROMOTIONS", description: "Create and manage discount campaigns for website checkout." },
    orders: { title: "Website orders", eyebrow: "ORDERS", description: "Orders placed from product cards on the storefront." },
    inquiries: { title: "Customer inquiries", eyebrow: "INBOX", description: "Every message from the website, in one place." },
    website: { title: "Website details", eyebrow: "CONTENT", description: "Update the key details customers see across the storefront." },
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-sidebar-brand" href="/" aria-label="SYS Solutions storefront"><Logo /></a>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <nav className="admin-side-nav" aria-label="Admin navigation">
          <button type="button" className={activeTab === "inventory" ? "admin-nav-item admin-nav-active" : "admin-nav-item"} onClick={() => setActiveTab("inventory")}><AdminIcon name="grid" /><span>Inventory</span><small>{products.length}</small></button>
          <button type="button" className={activeTab === "coupons" ? "admin-nav-item admin-nav-active" : "admin-nav-item"} onClick={() => setActiveTab("coupons")}><AdminIcon name="ticket" /><span>Coupons</span><small>{initialCoupons.length}</small></button>
          <button type="button" className={activeTab === "orders" ? "admin-nav-item admin-nav-active" : "admin-nav-item"} onClick={() => setActiveTab("orders")}><AdminIcon name="bag" /><span>Orders</span>{newOrderCount > 0 && <small className="admin-nav-unread">{newOrderCount}</small>}</button>
          <button type="button" className={activeTab === "inquiries" ? "admin-nav-item admin-nav-active" : "admin-nav-item"} onClick={() => setActiveTab("inquiries")}><AdminIcon name="inbox" /><span>Inquiries</span>{newInquiryCount > 0 && <small className="admin-nav-unread">{newInquiryCount}</small>}</button>
          <button type="button" className={activeTab === "website" ? "admin-nav-item admin-nav-active" : "admin-nav-item"} onClick={() => setActiveTab("website")}><AdminIcon name="settings" /><span>Website details</span></button>
        </nav>
        <div className="admin-sidebar-spacer" />
        <div className="admin-sidebar-status"><span className="sidebar-status-dot" /><span><strong>Storefront is live</strong><small>Changes sync to your website</small></span></div>
        <a className="admin-sidebar-store-link" href="/" target="_blank" rel="noreferrer">Open live storefront <span>↗</span></a>
        <div className="admin-sidebar-user"><span className="admin-avatar">S</span><span><strong>Store admin</strong><small>SYS Solutions</small></span><button type="button" onClick={signOut} title="Sign out" aria-label="Sign out" disabled={logoutLoading}>↗</button></div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar"><div className="admin-breadcrumb"><span>SYS SOLUTIONS</span><i>/</i><strong>{sectionTitles[activeTab].eyebrow}</strong></div><div className="admin-topbar-actions"><span className="admin-secure-label"><i /> Secure admin</span><a className="admin-preview-link" href="/" target="_blank" rel="noreferrer">Preview site <span>↗</span></a><button className="admin-signout-mobile" type="button" onClick={signOut} disabled={logoutLoading}>Sign out</button></div></header>
        <main className="admin-content">
          <div className="admin-page-heading"><div><span className="admin-eyebrow">{sectionTitles[activeTab].eyebrow} <i /> SYS CONTROL DESK</span><h1>{sectionTitles[activeTab].title}</h1><p>{sectionTitles[activeTab].description}</p></div><span className="admin-live-pill"><i /> LIVE WEBSITE</span></div>

          <div className="admin-metrics">
            <div className="admin-metric-card"><span className="admin-metric-label">TOTAL LISTINGS</span><strong>{products.length.toString().padStart(2, "0")}</strong><span className="admin-metric-foot">Across your inventory</span><span className="admin-metric-icon">▤</span></div>
            <div className="admin-metric-card"><span className="admin-metric-label">LIVE STOCK</span><strong>{availableCount.toString().padStart(2, "0")}</strong><span className="admin-metric-foot">Visible on the storefront</span><span className="admin-metric-icon admin-metric-green">●</span></div>
            <div className="admin-metric-card"><span className="admin-metric-label">NEW ORDERS</span><strong>{newOrderCount.toString().padStart(2, "0")}</strong><span className="admin-metric-foot">Placed on the website</span><span className="admin-metric-icon admin-metric-inbox">✳</span></div>
          </div>

          {notice && <div className={`admin-notice admin-notice-${notice.kind}`} role="status"><span>{notice.kind === "success" ? "✓" : "!"}</span>{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button></div>}

          {activeTab === "inventory" && <section className="admin-work-card">
            <div className="admin-card-heading"><div><span className="admin-eyebrow">THE COLLECTION</span><h2>Product inventory <span>{products.length}</span></h2></div><button className="admin-primary-button" type="button" onClick={openAddProduct}><span>+</span> Add a laptop</button></div>
            <div className="admin-table-toolbar"><label className="admin-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="m13 13 4 4" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search models, brands or specs" /><kbd>/</kbd></label><span>{visibleProducts.length} of {products.length} laptops</span></div>
            <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>LAPTOP</th><th>KEY SPECS</th><th>PRICE</th><th>STATUS</th><th>FEATURED</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
              {visibleProducts.map((product) => <tr key={product.id}>
                <td><div className="admin-product-cell"><div className="admin-product-thumb">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>SYS</span>}</div><span><strong>{product.name}</strong><small>{product.brand} · {product.category}</small></span></div></td>
                <td><span className="admin-spec-cell">{product.processor}</span><small className="admin-spec-sub">{product.memory} · {product.storage}</small></td>
                <td><strong className="admin-price">{formatPrice(product.price)}</strong></td>
                <td><span className={product.isAvailable ? "admin-status admin-status-live" : "admin-status admin-status-hidden"}><i />{product.isAvailable ? "Live" : "Hidden"}</span></td>
                <td><span className={product.isFeatured ? "admin-featured admin-featured-yes" : "admin-featured"}>{product.isFeatured ? "★ Featured" : "—"}</span></td>
                <td><div className="admin-row-actions"><button type="button" onClick={() => openEditProduct(product)}>Edit</button><button className="admin-delete-button" type="button" onClick={() => void removeProduct(product)} aria-label={`Remove ${product.name}`}>×</button></div></td>
              </tr>)}
              {!visibleProducts.length && <tr><td className="admin-empty-cell" colSpan={6}>No laptops match that search. Try a model or brand.</td></tr>}
            </tbody></table></div>
            <div className="admin-table-footer"><span><i /> Inventory saved to Supabase PostgreSQL</span><span>Every listing needs a PKR price before it can be ordered</span></div>
          </section>}

          {activeTab === "coupons" && <AdminCoupons initialCoupons={initialCoupons} />}

          {activeTab === "orders" && <section className="admin-work-card">
            <div className="admin-card-heading"><div><span className="admin-eyebrow">FROM PRODUCT CARDS</span><h2>Website orders <span>{orders.length}</span></h2></div><span className="admin-inbox-tip">Customers order on the site, not WhatsApp</span></div>
            {orders.length ? <div className="admin-inquiry-list">{orders.map((order) => <article className="admin-inquiry" key={order.id}>
              <div className="inquiry-avatar">{order.name.trim().charAt(0).toUpperCase()}</div>
              <div className="inquiry-body">
                <div className="inquiry-topline"><strong>{order.name}</strong><span>{new Date(order.createdAt).toISOString().slice(0, 10)}</span><span className={`admin-status-dot admin-status-dot-${order.status}`}>{order.status}</span></div>
                <p className="inquiry-interest">{order.productName} · Qty {order.quantity} · {order.fulfillment === "delivery" ? "Delivery" : "Shop pickup"}</p>
                <p className="inquiry-message">{formatPrice(order.totalAmount || order.productPrice * order.quantity)}{order.couponCode ? ` · Coupon ${order.couponCode} saved ${formatPrice(order.discountAmount)}` : ""}{order.receiptNumber ? ` · ${order.receiptNumber}` : ""}{order.city ? ` · ${order.city}` : ""}{order.address ? ` · ${order.address}` : ""}{order.notes ? ` · ${order.notes}` : ""}</p>
                <div className="inquiry-contact-links"><a href={`tel:${order.phone.replace(/\s/g, "")}`}>☎ {order.phone}</a>{order.email && <a href={`mailto:${order.email}`}>✉ {order.email}</a>}{order.receiptToken && <a href={`/receipt/${order.receiptToken}`} target="_blank" rel="noreferrer">▤ Receipt</a>}</div>
              </div>
              <label className="inquiry-status-control"><span>STATUS</span><select value={order.status} disabled={updatingOrder === order.id} onChange={(event) => void updateOrderStatus(order.id, event.target.value)}><option value="new">New</option><option value="confirmed">Confirmed</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option></select></label>
            </article>)}</div> : <div className="admin-empty-state"><span>▤</span><h3>No website orders yet.</h3><p>When a customer clicks a laptop and places an order, it will appear here.</p></div>}
          </section>}

          {activeTab === "inquiries" && <section className="admin-work-card">
            <div className="admin-card-heading"><div><span className="admin-eyebrow">FROM YOUR STOREFRONT</span><h2>Customer messages <span>{inquiries.length}</span></h2></div><span className="admin-inbox-tip">New requests are saved automatically</span></div>
            {inquiries.length ? <div className="admin-inquiry-list">{inquiries.map((inquiry) => <article className="admin-inquiry" key={inquiry.id}>
              <div className="inquiry-avatar">{inquiry.name.trim().charAt(0).toUpperCase()}</div>
              <div className="inquiry-body"><div className="inquiry-topline"><strong>{inquiry.name}</strong><span>{new Date(inquiry.createdAt).toISOString().slice(0, 10)}</span><span className={`admin-status-dot admin-status-dot-${inquiry.status}`}>{inquiry.status}</span></div><p className="inquiry-interest">{inquiry.interest}</p><p className="inquiry-message">{inquiry.message}</p><div className="inquiry-contact-links"><a href={`tel:${inquiry.phone.replace(/\s/g, "")}`}>☎ {inquiry.phone}</a>{inquiry.email && <a href={`mailto:${inquiry.email}`}>✉ {inquiry.email}</a>}</div></div>
              <label className="inquiry-status-control"><span>STATUS</span><select value={inquiry.status} disabled={updatingInquiry === inquiry.id} onChange={(event) => void updateInquiryStatus(inquiry.id, event.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option></select></label>
            </article>)}</div> : <div className="admin-empty-state"><span>✳</span><h3>Your inbox is clear.</h3><p>Website inquiries will show up here as soon as a customer reaches out.</p></div>}
          </section>}

          {activeTab === "website" && <section className="admin-work-card admin-settings-card">
            <div className="admin-card-heading"><div><span className="admin-eyebrow">SHOWN ON YOUR STOREFRONT</span><h2>Storefront content</h2></div><span className="admin-edit-note">Edit the copy and contact details visitors see.</span></div>
            <form className="admin-settings-form" onSubmit={saveSettings}>
              <div className="admin-settings-group"><div><span className="settings-group-number">01</span><div><h3>Homepage introduction</h3><p>The announcement strip and main hero copy.</p></div></div><div className="admin-settings-fields"><label>Announcement bar<input required maxLength={240} value={settingsForm.announcement} onChange={(event) => setSettingsForm({ ...settingsForm, announcement: event.target.value })} /></label><label>Hero headline<textarea required maxLength={200} rows={2} value={settingsForm.headline} onChange={(event) => setSettingsForm({ ...settingsForm, headline: event.target.value })} /><small>Use a new line to control where the headline breaks.</small></label><label>Hero description<textarea required maxLength={1000} rows={3} value={settingsForm.subheadline} onChange={(event) => setSettingsForm({ ...settingsForm, subheadline: event.target.value })} /></label></div></div>
              <div className="admin-settings-group"><div><span className="settings-group-number">02</span><div><h3>Contact details</h3><p>Displayed across the website and order links.</p></div></div><div className="admin-settings-fields settings-fields-two"><label>WhatsApp / phone<input required maxLength={80} value={settingsForm.phone} onChange={(event) => setSettingsForm({ ...settingsForm, phone: event.target.value })} /></label><label>Business email<input required maxLength={180} type="email" value={settingsForm.email} onChange={(event) => setSettingsForm({ ...settingsForm, email: event.target.value })} /></label><label className="settings-field-wide">Shop address<input required maxLength={500} value={settingsForm.address} onChange={(event) => setSettingsForm({ ...settingsForm, address: event.target.value })} /></label></div></div>
              {settingsNotice && <p className={`admin-settings-feedback admin-settings-feedback-${settingsNotice.kind}`} role="status">{settingsNotice.text}</p>}
              <div className="admin-settings-actions"><span>Changes are published to the live site when saved.</span><button className="admin-primary-button" type="submit" disabled={settingsSaving}>{settingsSaving ? "Saving changes…" : "Save website details"}<span>→</span></button></div>
            </form>
            <div className="admin-social-note"><span>↗</span><p>Social profile links are connected to the official SYS Solutions Instagram, TikTok, Facebook and WhatsApp catalogue.</p></div>
          </section>}

          <div className="admin-footnote"><span>SYS CONTROL DESK <i /> v1.0</span><span>Need a hand? <a href={`mailto:${settings.email}`}>Contact the site team</a></span></div>
        </main>
      </div>

      {dialogOpen && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}>
        <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
          <div className="admin-modal-header"><div><span className="admin-eyebrow">INVENTORY MANAGEMENT</span><h2 id="product-dialog-title">{editingProduct ? "Edit laptop" : "Add a laptop"}</h2><p>Enter clear details so customers can find their fit.</p></div><button type="button" className="admin-modal-close" onClick={() => setDialogOpen(false)} aria-label="Close editor">×</button></div>
          <form className="admin-product-form" onSubmit={saveProduct}>
            <div className="admin-product-form-grid">
              <label className="form-field-wide">Laptop name<input required maxLength={180} value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} placeholder="e.g. Lenovo ThinkPad X13" /></label>
              <label>Brand<input required maxLength={80} value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} placeholder="Lenovo" /></label>
              <label>Category<input required maxLength={80} value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} placeholder="Business" /></label>
              <label className="form-field-wide">Processor<input required maxLength={180} value={productForm.processor} onChange={(event) => setProductForm({ ...productForm, processor: event.target.value })} placeholder="Intel Core i7-1265U" /></label>
              <label>Memory<input required maxLength={100} value={productForm.memory} onChange={(event) => setProductForm({ ...productForm, memory: event.target.value })} placeholder="16GB DDR5" /></label>
              <label>Storage<input required maxLength={100} value={productForm.storage} onChange={(event) => setProductForm({ ...productForm, storage: event.target.value })} placeholder="512GB SSD" /></label>
              <label>Graphics<input maxLength={180} value={productForm.graphics} onChange={(event) => setProductForm({ ...productForm, graphics: event.target.value })} placeholder="Integrated graphics" /></label>
              <label>Display<input required maxLength={140} value={productForm.display} onChange={(event) => setProductForm({ ...productForm, display: event.target.value })} placeholder="14 inch Full HD" /></label>
              <label>Condition label<input maxLength={100} value={productForm.conditionLabel} onChange={(event) => setProductForm({ ...productForm, conditionLabel: event.target.value })} placeholder="Quality checked" /></label>
              <label>Product badge<input maxLength={80} value={productForm.badge} onChange={(event) => setProductForm({ ...productForm, badge: event.target.value })} placeholder="Business ready" /></label>
              <label>Promotion tag <span className="optional-label">OPTIONAL</span><input maxLength={80} value={productForm.promotionLabel} onChange={(event) => setProductForm({ ...productForm, promotionLabel: event.target.value.toUpperCase() })} placeholder="LIMITED STOCK" /></label>
              <label>Price in PKR<input required type="number" min="1" step="1" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} placeholder="e.g. 199000" /></label>
              <label>Display order<input type="number" min="0" step="1" value={productForm.sortOrder} onChange={(event) => setProductForm({ ...productForm, sortOrder: event.target.value })} /></label>
              <label className="form-field-wide">Image URL <span className="optional-label">OPTIONAL</span><input type="url" maxLength={1200} value={productForm.imageUrl} onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })} placeholder="https://…" /></label>
              <label className="form-field-wide">Short description<textarea rows={3} maxLength={2000} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="What makes this laptop a good fit?" /></label>
            </div>
            <div className="admin-form-toggles"><label><input type="checkbox" checked={productForm.isAvailable} onChange={(event) => setProductForm({ ...productForm, isAvailable: event.target.checked })} /><span className="toggle-visual" /> Visible on storefront</label><label><input type="checkbox" checked={productForm.isFeatured} onChange={(event) => setProductForm({ ...productForm, isFeatured: event.target.checked })} /><span className="toggle-visual" /> Featured</label><label><input type="checkbox" checked={productForm.isNewArrival} onChange={(event) => setProductForm({ ...productForm, isNewArrival: event.target.checked })} /><span className="toggle-visual" /> New arrival</label><label><input type="checkbox" checked={productForm.isTrending} onChange={(event) => setProductForm({ ...productForm, isTrending: event.target.checked })} /><span className="toggle-visual" /> Trending</label></div>
            {productError && <p className="admin-form-error" role="alert">{productError}</p>}
            <div className="admin-modal-actions"><button className="admin-modal-cancel" type="button" onClick={() => setDialogOpen(false)}>Cancel</button><button className="admin-primary-button" type="submit" disabled={productSaving}>{productSaving ? "Saving…" : editingProduct ? "Save laptop" : "Add to inventory"}<span>→</span></button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
