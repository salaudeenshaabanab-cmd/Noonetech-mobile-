"use client";
import { useState } from "react";

export default function AddProductsPage() {
  const [key, setKey] = useState("");
  const [json, setJson] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    try {
      const parsed = JSON.parse(json);
      const res = await fetch(`/api/add-products?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data });
    } catch (err) {
      setResult({ ok: false, data: { error: "Invalid JSON: " + err.message } });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Add Products</h1>

      <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Secret key</label>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Your SEED_SECRET"
        style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #ccc", fontSize: 14 }}
      />

      <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Product JSON (paste array here)</label>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder='[{"name": "...", "category": "phones", "price": 100000, "spec": "...", "description": "...", "specs": ["..."], "stock": 999}]'
        rows={12}
        style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #ccc", fontSize: 13, fontFamily: "monospace" }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !key || !json}
        style={{ width: "100%", padding: 14, background: "#1E1B8F", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {result && (
        <pre style={{ marginTop: 16, padding: 12, background: result.ok ? "#EAFBEA" : "#FEECEC", fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
