"use client";
import { useState } from "react";

export default function DeleteProductsPage() {
  const [key, setKey] = useState("");
  const [names, setNames] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    try {
      const list = names.split("\n").map((n) => n.trim()).filter(Boolean);
      const res = await fetch(`/api/delete-products?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data });
    } catch (err) {
      setResult({ ok: false, data: { error: err.message } });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Delete Products</h1>

      <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Secret key</label>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Your SEED_SECRET"
        style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #ccc", fontSize: 14 }}
      />

      <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Product names to delete (one per line, exact match, deletes ALL matching)</label>
      <textarea
        value={names}
        onChange={(e) => setNames(e.target.value)}
        placeholder={"Diagnostic Test Phone\nDiagnostic Test Phone 2\nAria Phone 14\nAria Phone 14 Pro"}
        rows={10}
        style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #ccc", fontSize: 13, fontFamily: "monospace" }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !key || !names}
        style={{ width: "100%", padding: 14, background: "#B91C1C", color: "#fff", border: "none", fontSize: 15, fontWeight: 600 }}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {result && (
        <pre style={{ marginTop: 16, padding: 12, background: result.ok ? "#EAFBEA" : "#FEECEC", fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
