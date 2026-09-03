async function getOrder(orderId) {
  const { prisma } = require("../../../lib/prisma");
  if (!orderId) return null;
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
}

export default async function SuccessPage({ searchParams }) {
  const orderId = searchParams?.order;
  const order = await getOrder(orderId);

  return (
    <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, background: "#1E1B8F", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "white", fontSize: 28 }}>✓</span>
      </div>
      <h1 style={{ fontSize: 26, marginBottom: 12, color: "#1E1B8F" }}>Thank you for your order.</h1>
      {order ? (
        <>
          <p style={{ color: "#5C6068", fontSize: 15, marginBottom: 24 }}>
            Order #{order.id.slice(-8).toUpperCase()} — a confirmation has been sent to {order.customerEmail}.
          </p>
          <div style={{ textAlign: "left", border: "1px solid #E2E1DE", padding: 20, marginBottom: 24 }}>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
                <span>{item.product.name} × {item.quantity}</span>
                <span>${((item.priceAtPurchase * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 8, borderTop: "1px solid #E2E1DE", fontWeight: 700 }}>
              <span>Total</span>
              <span>${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: "#5C6068", fontSize: 15, marginBottom: 24 }}>
          Your payment was received. Check your email for confirmation details.
        </p>
      )}
      <a href="/" style={{ display: "inline-block", background: "#1E1B8F", color: "white", padding: "12px 24px", textDecoration: "none", fontWeight: 600 }}>
        Continue shopping
      </a>
    </div>
  );
}
