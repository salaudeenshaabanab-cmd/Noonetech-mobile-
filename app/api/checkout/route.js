const { prisma } = require("../../../lib/prisma");
const { stripe } = require("../../../lib/stripe");
const { NextResponse } = require("next/server");

async function POST(request) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customer || !customer.email || !customer.name) {
      return NextResponse.json(
        { error: "Missing customer details" },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const lineItems = [];
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}` },
          { status: 400 }
        );
      }

      subtotal += product.price * item.quantity;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      });

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const shipping = subtotal >= 20000 ? 0 : 1200;
    const tax = Math.round(subtotal * 0.0825);
    const total = subtotal + shipping + tax;

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: shipping,
        },
        quantity: 1,
      });
    }
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Estimated tax" },
        unit_amount: tax,
      },
      quantity: 1,
    });

    const order = await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        shippingAddress: customer.address || "",
        shippingCity: customer.city || "",
        shippingZip: customer.zip || "",
        subtotal,
        shipping,
        tax,
        total,
        status: "pending",
        items: { create: orderItemsData },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customer.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?checkout=cancelled`,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

module.exports = { POST };
