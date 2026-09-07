"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search, ShoppingBag, X, Plus, Minus, Check, Package, Smartphone, Laptop, Tablet, Headphones, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "phones", label: "Phones", icon: Smartphone },
  { id: "laptops", label: "Laptops", icon: Laptop },
  { id: "tablets", label: "Tablets", icon: Tablet },
  { id: "accessories", label: "Accessories", icon: Headphones },
];

const currency = (naira) => `₦${naira.toLocaleString("en-NG")}`;

export default function NooneTech() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(null);
  const [selected, setSelected] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

   useEffect(() => {
    if (selected || cartOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.dataset.scrollY = String(scrollY);
    } else {
      const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    }
  }, [selected, cartOpen]);


  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchQuery = query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, query, sort]);

  const cartItems = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.id) })).filter((c) => c.product);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cartItems.reduce((s, c) => s + c.product.price * c.qty, 0);
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  function addToCart(id) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id, qty: 1 }];
    });
    setCartOpen(true);
  }

  function updateQty(id, delta) {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0));
  }

  async function completeCheckout(e) {
    e.preventDefault();
    setSubmitting(true);
    setCheckoutError(null);

    const form = e.target;
    const customer = {
      name: form.name.value,
      email: form.email.value,
      address: form.address.value,
      city: form.city.value,
      zip: form.zip.value,
    };
    const items = cart.map((c) => ({ productId: c.id, quantity: c.qty }));

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err.message);
      setSubmitting(false);
    }
  }

  function closeEverything() {
    setCartOpen(false);
    setCheckoutStep(null);
    setCheckoutError(null);
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#F5F5F4", minHeight: "100vh", color: "#1E1B8F" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .btn { cursor: pointer; border: none; transition: opacity 0.15s ease, transform 0.1s ease; }
        .btn:active { transform: scale(0.97); }
        .btn:hover { opacity: 0.88; }
        input:focus, button:focus-visible, select:focus-visible { outline: 2px solid #1E1B8F; outline-offset: 2px; }
        .prod-row:hover { background: #FAFAF9; }
      `}</style>

      <header style={{ borderBottom: "1px solid #E2E1DE", position: "sticky", top: 0, background: "#F5F5F4", zIndex: 20 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => { setCategory("all"); setQuery(""); }} style={{ background: "none", padding: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <img src="https://i.ibb.co/V53147L/514-AA084-FDAE-423-F-9-AFE-532248-E27467.png" alt="NOONETECH" style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1E1B8F" }}>NOONETECH</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "#1E1B8F", letterSpacing: "0.12em" }}>MOBILE STORE</span>
            </span>
          </button>

          <div style={{ flex: 1, maxWidth: 420, position: "relative", minWidth: 160 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A8F98" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones, laptops, tablets..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", border: "1px solid #E2E1DE", background: "#FFFFFF", fontSize: 13.5, color: "#1E1B8F" }}
            />
          </div>

          <button className="btn" onClick={() => setCartOpen(true)} style={{ marginLeft: "auto", position: "relative", background: "#1E1B8F", color: "#F5F5F4", padding: "10px 16px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={15} /> Cart
            {cartCount > 0 && (
              <span style={{ background: "#FFFFFF", color: "#1E1B8F", borderRadius: 999, fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className="btn"
              onClick={() => setCategory(c.id)}
              style={{
                background: category === c.id ? "#1E1B8F" : "transparent",
                color: category === c.id ? "#F5F5F4" : "#1E1B8F",
                border: category === c.id ? "none" : "1px solid #D5D4CF",
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {c.icon && <c.icon size={13} />}
              {c.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ background: "#EAEAE7", padding: "10px 20px", textAlign: "center", fontSize: 12.5, color: "#3E4147" }}>
        🚚 Same-day delivery in Lagos, Oyo, Ekiti, Osun & Ondo · Nationwide delivery available · Contact us for delivery to other states
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 80px" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", color: "#8A8F98" }}>Loading products...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8A8F98" }}>
            <p style={{ fontSize: 14.5 }}>No products in the database yet.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: "#8A8F98" }}>{filtered.length} {filtered.length === 1 ? "product" : "products"}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: "1px solid #D5D4CF", background: "#FFFFFF", padding: "7px 10px", fontSize: 13, color: "#1E1B8F" }}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 1, background: "#E2E1DE", border: "1px solid #E2E1DE" }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} onSelect={setSelected} />
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={(id) => { addToCart(id); setSelected(null); }} />
      )}

      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40 }}>
          <div onClick={closeEverything} style={{ position: "absolute", inset: 0, background: "rgba(14,15,18,0.45)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(440px, 100%)", background: "#F5F5F4", boxShadow: "-8px 0 24px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #E2E1DE", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {checkoutStep === "form" ? "Checkout" : "Your cart"}
              </h2>
              <button className="btn" onClick={closeEverything} style={{ background: "none", padding: 4, color: "#1E1B8F" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
              {checkoutStep === "form" ? (
                <form onSubmit={completeCheckout} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <Field name="name" label="Full name" placeholder="Jordan Blake" required />
                  <Field name="email" label="Email" type="email" placeholder="jordan@example.com" required />
                  <Field name="address" label="Shipping address" placeholder="118 Main Street" required />
                  <div style={{ display: "flex", gap: 10 }}>
                    <Field name="city" label="City" placeholder="Lagos" required />
                    <Field name="zip" label="ZIP" placeholder="100001" required />
                  </div>
                  <div style={{ marginTop: 6, padding: 12, background: "#EAEAE7", fontSize: 12.5, color: "#5C6068" }}>
                    You'll enter payment details on the secure checkout page next.
                  </div>
                  {checkoutError && (
                    <div style={{ padding: 12, background: "#FEECEC", color: "#B91C1C", fontSize: 13 }}>{checkoutError}</div>
                  )}
                  <button type="submit" className="btn" disabled={submitting} style={{ marginTop: 4, background: "#1E1B8F", color: "#fff", padding: "13px", fontSize: 14.5, fontWeight: 700, opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? "Redirecting to payment..." : `Continue to payment — ${currency(total)}`}
                  </button>
                </form>
              ) : cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#8A8F98" }}>
                  <Package size={30} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p style={{ fontSize: 13.5 }}>Your cart is empty.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {cartItems.map(({ id, qty, product }) => (
                    <div key={id} style={{ display: "flex", gap: 12 }}>
                      <ProductThumb product={product} size={60} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{product.name}</p>
                        <p style={{ margin: "2px 0 8px", fontSize: 12, color: "#8A8F98" }}>{product.spec}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #D5D4CF" }}>
                            <button className="btn" onClick={() => updateQty(id, -1)} style={{ background: "none", padding: "4px 8px", color: "#1E1B8F" }}><Minus size={12} /></button>
                            <span style={{ fontSize: 12.5, minWidth: 14, textAlign: "center" }}>{qty}</span>
                            <button className="btn" onClick={() => updateQty(id, 1)} style={{ background: "none", padding: "4px 8px", color: "#1E1B8F" }}><Plus size={12} /></button>
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{currency(product.price * qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && checkoutStep !== "form" && (
              <div style={{ padding: 22, borderTop: "1px solid #E2E1DE" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 15, fontWeight: 700, paddingTop: 10 }}>
                  <span>Total</span><span>{currency(total)}</span>
                </div>
                <button className="btn" onClick={() => setCheckoutStep("form")} style={{ width: "100%", background: "#1E1B8F", color: "#F5F5F4", padding: "14px", fontSize: 14.5, fontWeight: 700 }}>
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductThumb({ product, size = 80 }) {
  const hue = { phones: "#4A5568", laptops: "#1E1B8F", tablets: "#6B7280", accessories: "#1A1B1E" }[product.category] || "#4A5568";
  return <div style={{ width: size, height: size, background: `linear-gradient(160deg, ${hue}, #1E1B8F)`, flexShrink: 0 }} />;
}

function ProductCard({ product, onAdd, onSelect }) {
  const hue = { phones: "#4A5568", laptops: "#1E1B8F", tablets: "#6B7280", accessories: "#1A1B1E" }[product.category] || "#4A5568";
  const isUnlimited = product.stock >= 999;
  const lowStock = !isUnlimited && product.stock > 0 && product.stock <= 8;
  const outOfStock = product.stock <= 0;
  return (
    <div className="prod-row" style={{ background: "#FFFFFF", padding: 16, display: "flex", flexDirection: "column" }}>
      <button className="btn" onClick={() => onSelect(product)} style={{ display: "block", width: "100%", padding: 0, background: "none", marginBottom: 12 }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ height: 130, background: `linear-gradient(160deg, ${hue}, #1E1B8F)` }} />
        )}
      </button>
      <button className="btn" onClick={() => onSelect(product)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", padding: 0, marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{product.name}</p>
      </button>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#8A8F98" }}>{product.spec}</p>
      {outOfStock ? (
        <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "#B91C1C", fontWeight: 600 }}>Out of stock</p>
      ) : lowStock ? (
        <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "#B45309", fontWeight: 600 }}>Only {product.stock} left</p>
      ) : null}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{currency(product.price)}</span>
        <button
          className="btn"
          onClick={() => onAdd(product.id)}
          disabled={outOfStock}
          style={{ background: outOfStock ? "#D5D4CF" : "#1E1B8F", color: "#F5F5F4", padding: "7px 12px", fontSize: 12, fontWeight: 600 }}
        >
          {outOfStock ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const hue = { phones: "#4A5568", laptops: "#1E1B8F", tablets: "#6B7280", accessories: "#1A1B1E" }[product.category] || "#4A5568";
  const isUnlimited = product.stock >= 999;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(14,15,18,0.5)" }} />
      <div style={{ position: "relative", background: "#F5F5F4", maxWidth: 780, width: "100%", maxHeight: "88vh", overflow: "hidden", display: "flex", flexWrap: "wrap" }}>
        <button className="btn" onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.9)", padding: 8, zIndex: 2, color: "#1E1B8F" }}>
          <X size={18} />
        </button>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ flex: "1 1 320px", minHeight: 300, objectFit: "cover", width: "100%" }} />
        ) : (
          <div style={{ flex: "1 1 320px", minHeight: 300, background: `linear-gradient(160deg, ${hue}, #1E1B8F)` }} />
        )}
        <div style={{ flex: "1 1 320px", padding: 32, overflowY: "auto", minHeight: 0, maxHeight: "88vh" }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1E1B8F", textTransform: "capitalize" }}>{product.category}</span>
          <h2 style={{ fontSize: 24, margin: "8px 0 4px", fontWeight: 700 }}>{product.name}</h2>
          <p style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 20px" }}>{currency(product.price)}</p>
          <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
            {product.specs.map((s, i) => (
              <li key={i} style={{ fontSize: 13.5, color: "#3E4147", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ChevronRight size={14} color="#1E1B8F" style={{ marginTop: 2, flexShrink: 0 }} />
                {s}
              </li>
            ))}
          </ul>
          {!isUnlimited && (
            <p style={{ fontSize: 12.5, color: "#8A8F98", marginBottom: 20 }}>{product.stock} in stock</p>
          )}
          <button
            className="btn"
            onClick={() => onAdd(product.id)}
            disabled={product.stock <= 0}
            style={{ width: "100%", background: product.stock <= 0 ? "#D5D4CF" : "#1E1B8F", color: "#fff", padding: "14px", fontSize: 14.5, fontWeight: 700 }}
          >
            {product.stock <= 0 ? "Unavailable" : "Add to cart"}
          </button>
          <a
            href={`https://wa.me/2348147684917?text=${encodeURIComponent("Hi, I'm interested in the " + product.name + " (" + product.spec + "). Is it available?")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", textAlign: "center", background: "#25D366", color: "#fff", padding: "14px", fontSize: 14.5, fontWeight: 700, marginTop: 10, textDecoration: "none", boxSizing: "border-box" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 4.99L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.19 3.03 14.7 2 12.04 2zm0 18.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.82-1.26-4.38 0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42 1.56 1.56 2.41 3.63 2.41 5.83 0 4.55-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
            Ask about this phone on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", placeholder, required }) {
  return (
    <label style={{ flex: 1, display: "block", fontSize: 12, color: "#5C6068", fontWeight: 500 }}>
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 11px", border: "1px solid #D5D4CF", background: "#FFFFFF", fontSize: 13.5, color: "#1E1B8F" }}
      />
    </label>
  );
}
