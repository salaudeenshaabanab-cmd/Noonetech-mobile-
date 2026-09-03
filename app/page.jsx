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

const currency = (cents) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

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
  const shipping = subtotal > 0 && subtotal < 20000 ? 1200 : 0;
  const tax = Math.round(subtotal * 0.0825);
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
        input:focus, button
