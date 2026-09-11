"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, ChevronLeft, X, ShoppingBag } from "lucide-react";

const currency = (naira) => `₦${naira.toLocaleString("en-NG")}`;

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const products = data.products || [];
        setAllProducts(products);
        const found = products.find((p) => p.id === params.id);
        setProduct(found || null);
        if (found) {
          setSelectedColor(found.colors && found.colors.length > 0 ? found.colors[0] : null);
          const sameCategory = products.filter(
            (p) => p.category === found.category && p.id !== found.id
          );
          setRelated(sameCategory.slice(0, 8));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#F5F5F4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8A8F98", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", minHeight: "100vh", background: "#F5F5F4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <p style={{ color: "#8A8F98", fontSize: 14 }}>Product not found.</p>
        <button onClick={() => router.push("/")} style={{ background: "#1E1B8F", color: "#fff", border: "none", padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Back to store
        </button>
      </div>
    );
  }

  const hue = { phones: "#4A5568", laptops: "#1E1B8F", tablets: "#6B7280", accessories: "#1A1B1E" }[product.category] || "#4A5568";
  const isUnlimited = product.stock >= 999;
  const gallery = product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#F5F5F4", minHeight: "100vh", color: "#1E1B8F" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        .btn { cursor: pointer; border: none; transition: opacity 0.15s ease, transform 0.1s ease; }
        .btn:active { transform: scale(0.97); }
        .btn:hover { opacity: 0.88; }
      `}</style>

      <header style={{ borderBottom: "1px solid #E2E1DE", position: "sticky", top: 0, background: "#F5F5F4", zIndex: 20 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn" onClick={() => router.push("/")} style={{ background: "none", display: "flex", alignItems: "center", gap: 6, color: "#1E1B8F", fontSize: 14, fontWeight: 600 }}>
            <ChevronLeft size={18} /> Back to store
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, background: "#FFFFFF", padding: 24, border: "1px solid #EDE9E0" }}>
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column" }}>
            {gallery.length > 0 ? (
              <img src={gallery[activeImage]} alt={product.name} style={{ width: "100%", minHeight: 300, maxHeight: 420, objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", minHeight: 300, background: `linear-gradient(160deg, ${hue}, #1E1B8F)` }} />
            )}
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: 6, padding: "10px 0", overflowX: "auto" }}>
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    className="btn"
                    onClick={() => setActiveImage(i)}
                    style={{ padding: 0, background: "none", flexShrink: 0, border: i === activeImage ? "2px solid #1E1B8F" : "2px solid transparent" }}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: 52, height: 52, objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 320px" }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1E1B8F", textTransform: "capitalize" }}>{product.category}</span>
            <h1 style={{ fontSize: 26, margin: "8px 0 4px", fontWeight: 700 }}>{product.name}</h1>
            <p style={{ fontSize: 13.5, color: "#8A8F98", marginBottom: 12 }}>{product.spec}</p>
            <p style={{ fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>{currency(product.price)}</p>

            <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
              {product.specs.map((s, i) => (
                <li key={i} style={{ fontSize: 13.5, color: "#3E4147", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <ChevronRight size={14} color="#1E1B8F" style={{ marginTop: 2, flexShrink: 0 }} />
                  {s}
                </li>
              ))}
            </ul>

            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1E1B8F", marginBottom: 8 }}>Color: {selectedColor}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      className="btn"
                      onClick={() => setSelectedColor(c)}
                      style={{
                        padding: "7px 14px",
                        fontSize: 12.5,
                        fontWeight: 600,
                        border: c === selectedColor ? "2px solid #1E1B8F" : "1px solid #D5D4CF",
                        background: c === selectedColor ? "#1E1B8F" : "#FFFFFF",
                        color: c === selectedColor ? "#FFFFFF" : "#1E1B8F",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isUnlimited && (
              <p style={{ fontSize: 12.5, color: "#8A8F98", marginBottom: 20 }}>{product.stock} in stock</p>
            )}

            <a
              href={`https://wa.me/2348147684917?text=${encodeURIComponent("Hi, I'm interested in the " + product.name + " (" + product.spec + (selectedColor ? ", " + selectedColor + " color" : "") + "). Is it available?")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", textAlign: "center", background: "#25D366", color: "#fff", padding: "14px", fontSize: 14.5, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 4.99L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.19 3.03 14.7 2 12.04 2zm0 18.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.82-1.26-4.38 0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42 1.56 1.56 2.41 3.63 2.41 5.83 0 4.55-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
              Ask about this phone on WhatsApp
            </a>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>You may also like</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {related.map((p) => (
                <button
                  key={p.id}
                  className="btn"
                  onClick={() => router.push(`/product/${p.id}`)}
                  style={{ background: "#FFFFFF", border: "1px solid #EDE9E0", padding: 10, textAlign: "left", display: "flex", flexDirection: "column" }}
                >
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", marginBottom: 8 }} />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "1 / 1", background: `linear-gradient(160deg, ${{ phones: "#4A5568", laptops: "#1E1B8F", tablets: "#6B7280", accessories: "#1A1B1E" }[p.category] || "#4A5568"}, #1E1B8F)`, marginBottom: 8 }} />
                  )}
                  <p style={{ fontSize: 12.5, fontWeight: 700, margin: "0 0 2px", color: "#1E1B8F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{currency(p.price)}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
