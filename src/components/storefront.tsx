"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { CouponRecord, ProductRecord, SiteSettingsRecord } from "@/db/schema";
import OrderCard from "@/components/order-card";
import { Logo } from "@/components/logo";
import SocialDock from "@/components/social-dock";
import { formatPrice } from "@/lib/money";

type StorefrontProps = {
  products: ProductRecord[];
  settings: SiteSettingsRecord;
  coupons: CouponRecord[];
};

const socialLinks = [
  { name: "Instagram", handle: "@syssolutionspk", href: "/connect/instagram", label: "New arrivals & everyday tech" },
  { name: "TikTok", handle: "@sys.solutionspk", href: "/connect/tiktok", label: "See the latest from our shop" },
  { name: "Facebook", handle: "SYS Solutions", href: "/connect/facebook", label: "Follow along with SYS" },
  { name: "WhatsApp catalogue", handle: "Browse the catalogue", href: "/connect/whatsapp-catalog", label: "Explore products on WhatsApp" },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9" /></svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12m-5-5 5 5-5 5" /></svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="whatsapp-icon">
      <path d="M20.5 11.7a8.45 8.45 0 0 1-12.5 7.4L4 20l.9-3.8a8.45 8.45 0 1 1 15.6-4.5Z" />
      <path d="M9 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4 0 .5l-.5.7c-.2.2-.2.4 0 .6a7 7 0 0 0 1.3 1.4c.5.4 1 .7 1.6.9.2.1.4.1.5-.1l.8-.9c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.5 0 .5-.3 1.3-.8 1.7-.5.5-1.2.7-2 .6-.9-.1-2.1-.6-3.4-1.5a12.7 12.7 0 0 1-3.5-3.8c-.6-1-.9-1.8-.9-2.5 0-.8.4-1.4.8-1.8Z" />
    </svg>
  );
}

function ProductCard({ product, onOpen }: { product: ProductRecord; onOpen: (product: ProductRecord) => void }) {
  return (
    <article className={`product-card${product.isFeatured ? " product-card-featured" : ""}`}>
      <button type="button" className="product-card-hit" onClick={() => onOpen(product)} aria-label={`Open ${product.name} and place an order`}>
        <div className="product-image">
          <div className="product-image-glow" />
          {product.imageUrl ? (
            // Product images are provided and maintained by the shop in its admin area.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.opacity = "0"; }} />
          ) : <div className="product-image-placeholder"><span>SYS</span></div>}
          <span className="product-badge">{product.badge}</span>
          <span className="product-status-tags">
            {product.isNewArrival && <span className="status-tag status-tag-new">New arrival</span>}
            {product.isTrending && <span className="status-tag status-tag-trending">Trending</span>}
          </span>
          {!product.isAvailable && <span className="stock-out-badge">Currently unavailable</span>}
          <span className="product-image-index">{String(product.sortOrder).padStart(2, "0")}</span>
        </div>
        <div className="product-content">
          <div className="product-meta"><span>{product.brand}</span><i />{product.category}</div>
          <h3>{product.name}</h3>
          <p className="product-description">{product.description || `${product.processor} · ${product.memory} · ${product.storage}`}</p>
          <div className="product-specs">
            <span>{product.memory}</span><span>{product.storage}</span><span>{product.display}</span>
          </div>
          {product.promotionLabel && <span className="product-promotion-tag">{product.promotionLabel}</span>}
          <div className="product-card-bottom">
            <div><span className="price-caption">PRICE</span><strong>{formatPrice(product.price)}</strong></div>
            <span className={`product-order${!product.isAvailable ? " product-order-muted" : ""}`}>
              <span>Order now</span><ArrowIcon />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

export default function Storefront({ products, settings, coupons }: StorefrontProps) {
  const [activeCategory, setActiveCategory] = useState("All laptops");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formState, setFormState] = useState({ name: "", phone: "", email: "", interest: "Laptop recommendation", message: "", website: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);

  const categories = useMemo(() => ["All laptops", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatches = activeCategory === "All laptops" || product.category === activeCategory;
      const searchable = [product.name, product.brand, product.category, product.processor, product.memory, product.storage, product.graphics].join(" ").toLowerCase();
      return categoryMatches && (!query || searchable.includes(query));
    });
  }, [activeCategory, products, search]);

  const whatsappLink = "/connect/whatsapp";
  const mapLink = `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`;

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus("sending");
    setFormMessage("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not send that just now.");
      setFormStatus("success");
      setFormMessage("Thanks — your message is with our team. We’ll get back to you soon.");
      setFormState({ name: "", phone: "", email: "", interest: "Laptop recommendation", message: "", website: "" });
    } catch (error) {
      setFormStatus("error");
      setFormMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  const faqs = [
    { question: "How do you check a laptop before it is listed?", answer: "Every device is carefully inspected and tested by the SYS team. Ask us about the exact laptop you are considering and we’ll walk you through its condition, specs and battery health." },
    { question: "Can you help me choose a laptop for my budget?", answer: "Absolutely. Tell us what you do, the software you use and your budget. We’ll recommend a sensible fit instead of pushing a spec sheet that does not suit you." },
    { question: "Do you offer repairs as well as laptops?", answer: "Yes. The team can help with common laptop hardware repairs, including screens, keyboards and batteries. Message us with the model and issue to discuss next steps." },
    { question: "Where are you located, and can you deliver?", answer: "Visit us at TechnoCity II on 6th Road in Rawalpindi. Fast delivery is available; message us to confirm delivery options for your area and the laptop you want." },
  ];

  return (
    <main className="storefront">
      <div className="announcement-bar">
        <span className="announcement-pulse" />
        <span>{settings.announcement}</span>
        <a href={whatsappLink} target="_blank" rel="noreferrer">Talk to our team <ArrowIcon diagonal /></a>
      </div>

      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#home" aria-label="SYS Solutions home" onClick={() => setMenuOpen(false)}>
            <Logo />
          </a>
          <nav className={`desktop-nav${menuOpen ? " nav-is-open" : ""}`} aria-label="Main navigation">
            <a href="#inventory" onClick={() => setMenuOpen(false)}>Shop laptops</a>
            <a href="#why-sys" onClick={() => setMenuOpen(false)}>Why SYS</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#visit" onClick={() => setMenuOpen(false)}>Visit us</a>
          </nav>
          <div className="header-actions">
            <a className="header-phone" href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
            <a className="button button-dark header-cta" href={whatsappLink} target="_blank" rel="noreferrer">Let’s talk <ArrowIcon diagonal /></a>
          </div>
          <button className={`mobile-menu-button${menuOpen ? " menu-button-open" : ""}`} type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <span /><span />
          </button>
        </div>
        {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#inventory" onClick={() => setMenuOpen(false)}>Shop laptops <ArrowIcon /></a>
          <a href="#why-sys" onClick={() => setMenuOpen(false)}>Why SYS <ArrowIcon /></a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services <ArrowIcon /></a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>Visit us <ArrowIcon /></a>
          <a className="button button-lime" href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Chat on WhatsApp <ArrowIcon diagonal /></a>
        </nav>}
      </header>

      <section className="hero-section page-gutter" id="home">
        <div className="hero-frame">
          {/* Hero photo asset should be bundled at this path. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-photo" src="/images/sys-hero.png" alt="Graphite laptop with a vivid green display" />
          <div className="hero-sheen" />
          <div className="hero-copy">
            <div className="eyebrow eyebrow-light"><span /> RAWALPINDI · TECH THAT WORKS</div>
            <h1>{settings.headline}</h1>
            <p>{settings.subheadline}</p>
            <div className="hero-actions">
              <a className="button button-lime" href="#inventory">Find your laptop <ArrowIcon /></a>
              <a className="button button-ghost" href={whatsappLink} target="_blank" rel="noreferrer"><WhatsAppIcon /> Chat with SYS</a>
            </div>
            <div className="hero-reassurance">
              <span className="reassurance-check"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg></span>
              <span><strong>A real person, not a product quiz.</strong><small>Get honest help before you buy.</small></span>
            </div>
          </div>
          <div className="hero-floating-card">
            <span className="hero-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.4c0 4.4 3.1 8.4 7.5 9.6 4.4-1.2 7.5-5.2 7.5-9.6V6L12 3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg></span>
            <span><strong>Checked by our team</strong><small>Quality first. Every time.</small></span>
          </div>
          <div className="hero-location">TECHNOCITY II <i /> RAWALPINDI, PK</div>
          <div className="hero-logo-plate" aria-label="SYS Solutions logo"><Logo variant="chip" /></div>
        </div>
        <div className="hero-underbar">
          <span><b>1000+</b> users trust SYS</span><i />
          <span>Carefully checked laptops</span><i />
          <span>Advice that starts with you</span>
          <a href="#inventory">Explore the collection <ArrowIcon /></a>
        </div>
      </section>

      <section className="trust-section page-gutter" aria-label="The SYS difference">
        <div className="trust-grid">
          <div className="trust-intro"><span className="eyebrow"><span /> THE SYS STANDARD</span><p>Good tech is only half the story.</p></div>
          <div className="trust-item"><span className="trust-number">01</span><strong>Checked before it ships</strong><small>We inspect each laptop before it reaches you.</small></div>
          <div className="trust-item"><span className="trust-number">02</span><strong>Specs made simple</strong><small>Clear, practical advice for your kind of work.</small></div>
          <div className="trust-item"><span className="trust-number">03</span><strong>Here when you need us</strong><small>Shop, delivery and repair help from one team.</small></div>
        </div>
      </section>

      <section className="inventory-section page-gutter" id="inventory">
        <div className="section-heading inventory-heading">
          <div>
            <span className="eyebrow"><span /> THE COLLECTION</span>
            <h2>Good options.<br /><em>No endless scrolling.</em></h2>
            <p>Real laptops, thoughtfully picked. Tell us what you need and we’ll help with the details.</p>
          </div>
          <span className="inventory-price-cue">{coupons[0] ? `${coupons[0].code} · ${coupons[0].label}` : "All prices shown in PKR"}<small>Click a laptop to order online.</small></span>
        </div>
        <div className="inventory-toolbar">
          <div className="category-filter" role="group" aria-label="Filter laptops by category">
            {categories.map((category) => <button key={category} type="button" className={activeCategory === category ? "category-chip category-chip-active" : "category-chip"} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div>
          <label className="search-field">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="m13 13 4 4" /></svg>
            <span className="visually-hidden">Search laptops</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by model or spec" />
            <kbd>/</kbd>
          </label>
        </div>
        <div className="inventory-count"><span>{filteredProducts.length} curated {filteredProducts.length === 1 ? "option" : "options"}</span><span>Every laptop is checked before it ships <i /></span></div>
        {filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />)}
          </div>
        ) : (
          <div className="empty-products"><span>⌕</span><h3>No laptops found just yet.</h3><p>Try another search, or send us a note and we’ll help you find a fit.</p><a className="button button-dark" href="#visit">Ask the SYS team <ArrowIcon /></a></div>
        )}
        <div className="inventory-note"><span className="note-dot" /><p>Stock moves quickly. Click a laptop to place your order on the website.</p><a href="#inventory">Browse the collection <ArrowIcon /></a></div>
      </section>

      <section className="why-section page-gutter" id="why-sys">
        <div className="why-panel">
          <div className="why-copy">
            <span className="eyebrow eyebrow-light"><span /> MORE THAN A LAPTOP SHOP</span>
            <h2>Buying tech should feel <em>easy.</em></h2>
            <p>We’re here to make a big decision a little simpler. Tell us what your day looks like; we’ll help you find a machine that makes sense for it.</p>
            <a className="button button-lime" href={whatsappLink} target="_blank" rel="noreferrer">Tell us what you need <ArrowIcon diagonal /></a>
            <div className="why-stats"><strong>1000<span>+</span></strong><span>users have trusted SYS<br />with their next laptop</span></div>
          </div>
          <div className="why-list">
            <div className="why-list-item"><span className="why-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.4c0 4.4 3.1 8.4 7.5 9.6 4.4-1.2 7.5-5.2 7.5-9.6V6L12 3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg></span><div><h3>Carefully checked</h3><p>Every laptop is tested before it is listed. No mystery specs.</p></div><span className="why-list-index">01</span></div>
            <div className="why-list-item"><span className="why-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 4v6m10-6v6M5 12h14v8H5z" /><path d="M8 16h3" /></svg></span><div><h3>Built around your work</h3><p>Student, studio, business or gaming — we’ll start with what matters to you.</p></div><span className="why-list-index">02</span></div>
            <div className="why-list-item"><span className="why-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-6h4M4 13h4v6H6a2 2 0 0 1-2-2v-4Z" /></svg></span><div><h3>People, not pressure</h3><p>Get the honest answer — even if the answer is “you don’t need that.”</p></div><span className="why-list-index">03</span></div>
          </div>
        </div>
      </section>

      <section className="services-section page-gutter" id="services">
        <div className="section-heading services-heading">
          <div><span className="eyebrow"><span /> HERE FOR THE WHOLE JOURNEY</span><h2>More ways to get<br /><em>your tech sorted.</em></h2></div>
          <p>From the first shortlist to the next repair, you’ve got a local team in your corner.</p>
        </div>
        <div className="service-grid">
          <article className="service-card service-card-lime"><span className="service-number">01 / ADVICE</span><span className="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2.5 19h19M9 16l-.8 3m6.6-3 .8 3" /></svg></span><h3>Find your next laptop</h3><p>Get a recommendation based on the work you do and the budget you have.</p><a href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Ask us for laptop advice">Ask us <ArrowIcon diagonal /></a></article>
          <article className="service-card"><span className="service-number">02 / REPAIR</span><span className="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6a5 5 0 0 0-6.7 6.7L3.5 16.5a2.1 2.1 0 0 0 3 3l3.8-3.8A5 5 0 0 0 17 9l-3 3-2-2 3-3Z" /></svg></span><h3>Laptop repairs</h3><p>Help with common hardware issues, including screens, keyboards and batteries.</p><a href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Ask about laptop repairs">Discuss a repair <ArrowIcon diagonal /></a></article>
          <article className="service-card"><span className="service-number">03 / DELIVERY</span><span className="service-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" /></svg></span><h3>Pickup & delivery</h3><p>Visit the shop in Rawalpindi or message us to check delivery to your area.</p><a href={mapLink} target="_blank" rel="noreferrer" aria-label="Get directions to SYS Solutions">Find the shop <ArrowIcon diagonal /></a></article>
        </div>
      </section>

      <section className="social-section page-gutter" aria-labelledby="social-title">
        <div className="social-header"><div><span className="eyebrow"><span /> A LITTLE MORE SYS</span><h2 id="social-title">Good tech, <em>good company.</em></h2></div><p>Catch new arrivals, shop moments and the gear we can’t stop talking about.</p></div>
        <div className="social-grid">
          {socialLinks.map((link, index) => <a className={`social-card social-card-${index + 1}`} href={link.href} target="_blank" rel="noopener noreferrer" key={link.name}>
            <span className="social-card-top"><span className="social-icon">{index === 0 ? "ig" : index === 1 ? "tk" : index === 2 ? "f" : <WhatsAppIcon />}</span><ArrowIcon diagonal /></span>
            <span className="social-name">{link.name}</span><strong>{link.handle}</strong><span className="social-caption">{link.label}</span>
          </a>)}
        </div>
      </section>

      <section className="faq-section page-gutter">
        <div className="faq-intro"><span className="eyebrow"><span /> GOOD TO KNOW</span><h2>Quick answers.<br /><em>Real people, too.</em></h2><p>Still wondering about something? Ask us directly — we’re happy to help.</p><a className="text-link" href={whatsappLink} target="_blank" rel="noreferrer">Ask a question <ArrowIcon diagonal /></a></div>
        <div className="faq-list">
          {faqs.map((faq, index) => <article className={`faq-item${openFaq === index ? " faq-item-open" : ""}`} key={faq.question}>
            <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq((current) => current === index ? null : index)}><span>{faq.question}</span><i>{openFaq === index ? "−" : "+"}</i></button>
            {openFaq === index && <p>{faq.answer}</p>}
          </article>)}
        </div>
      </section>

      <section className="contact-section page-gutter" id="visit">
        <div className="contact-panel">
          <div className="contact-copy">
            <span className="eyebrow eyebrow-light"><span /> LET’S FIND YOUR FIT</span>
            <h2>Big decision?<br /><em>Small first step.</em></h2>
            <p>Tell us a little about what you need. A real person from SYS will get back to you with a helpful next step.</p>
            <div className="contact-details">
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`}><span className="contact-detail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-7-7l3-2-2-5Z" /></svg></span><span><small>CALL OR WHATSAPP</small><strong>{settings.phone}</strong></span><ArrowIcon diagonal /></a>
              <a href={`mailto:${settings.email}`}><span className="contact-detail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg></span><span><small>SEND US AN EMAIL</small><strong>{settings.email}</strong></span><ArrowIcon diagonal /></a>
              <a href={mapLink} target="_blank" rel="noreferrer"><span className="contact-detail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></span><span><small>COME SAY HELLO</small><strong>{settings.address}</strong></span><ArrowIcon diagonal /></a>
            </div>
          </div>
          <div className="contact-form-card">
            <div className="contact-form-heading"><span>LET’S TALK TECH</span><h3>What can we help with?</h3><p>We usually reply as soon as we can during shop hours.</p></div>
            <form onSubmit={submitInquiry}>
              <div className="form-row"><label>Your name<input required minLength={2} maxLength={120} value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} placeholder="e.g. Ayesha Khan" /></label><label>Phone number<input required minLength={7} maxLength={60} type="tel" value={formState.phone} onChange={(event) => setFormState({ ...formState, phone: event.target.value })} placeholder="+92 3XX XXXXXXX" /></label></div>
              <label>Email <span className="optional-label">OPTIONAL</span><input maxLength={180} type="email" value={formState.email} onChange={(event) => setFormState({ ...formState, email: event.target.value })} placeholder="you@example.com" /></label>
              <label>What are you looking for?<select value={formState.interest} onChange={(event) => setFormState({ ...formState, interest: event.target.value })}><option>Laptop recommendation</option><option>Business laptop</option><option>Creator / workstation laptop</option><option>Gaming laptop</option><option>Laptop repair</option><option>Something else</option></select></label>
              <label>A little more detail<textarea required minLength={4} maxLength={3000} rows={3} value={formState.message} onChange={(event) => setFormState({ ...formState, message: event.target.value })} placeholder="Tell us what you need, your budget, or the model you have in mind..." /></label>
              <label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={formState.website} onChange={(event) => setFormState({ ...formState, website: event.target.value })} /></label>
              <button className="button button-dark form-submit" type="submit" disabled={formStatus === "sending"}>{formStatus === "sending" ? "Sending your note…" : "Send a note to SYS"}<ArrowIcon /></button>
              {formMessage && <p className={`form-feedback form-feedback-${formStatus}`} role="status">{formMessage}</p>}
              <span className="form-privacy">Your details are only used to reply to this request.</span>
            </form>
          </div>
        </div>
      </section>

      <footer className="site-footer page-gutter">
        <div className="footer-main">
          <div className="footer-brand-block"><a className="brand brand-footer" href="#home" aria-label="SYS Solutions home"><Logo /></a><p>Good laptops. Honest advice.<br />A local team that’s got your back.</p><a className="footer-location" href={mapLink} target="_blank" rel="noreferrer"><span className="footer-pin">↗</span> TechnoCity II, 6th Road<br />Rawalpindi, Pakistan</a></div>
          <div className="footer-links"><span>EXPLORE</span><a href="#inventory">Shop laptops</a><a href="#why-sys">Why SYS</a><a href="#services">Repairs & services</a><a href="#visit">Contact & location</a></div>
          <div className="footer-links footer-follow"><span>FOLLOW ALONG</span><a href={socialLinks[0].href} target="_blank" rel="noopener noreferrer">Instagram <ArrowIcon diagonal /></a><a href={socialLinks[1].href} target="_blank" rel="noopener noreferrer">TikTok <ArrowIcon diagonal /></a><a href={socialLinks[2].href} target="_blank" rel="noopener noreferrer">Facebook <ArrowIcon diagonal /></a><a href={socialLinks[3].href} target="_blank" rel="noopener noreferrer">WhatsApp catalogue <ArrowIcon diagonal /></a><SocialDock className="footer-dock" /></div>
          <div className="footer-cta"><span>NOT SURE WHERE TO START?</span><h3>Let’s figure it out together.</h3><a className="button button-lime" href={whatsappLink} target="_blank" rel="noreferrer">Chat with SYS <ArrowIcon diagonal /></a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} SYS Solutions. All rights reserved.</span><span>Thoughtful tech, from Rawalpindi.</span><a href="/admin">Admin access <ArrowIcon diagonal /></a></div>
      </footer>

      <SocialDock className="mobile-dock" />
      {selectedProduct && <OrderCard product={selectedProduct} shopAddress={settings.address} coupons={coupons} onClose={() => setSelectedProduct(null)} />}
    </main>
  );
}
