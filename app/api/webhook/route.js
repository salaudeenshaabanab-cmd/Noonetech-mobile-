const { prisma } = require("../../../lib/prisma");
const { stripe } = require("../../../lib/stripe");
const { NextResponse } = require("next/server");

async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (order && order.status !== "paid") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "paid" },
        });

        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        console.log(`Order ${orderId} marked as paid, stock updated.`);
      }
    }
  }

  return NextResponse.json({ received: true });
}

module.exports = { POST };
