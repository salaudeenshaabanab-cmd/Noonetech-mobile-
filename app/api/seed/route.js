const { prisma } = require("../../../lib/prisma");
const { NextResponse } = require("next/server");

const PRODUCTS = [
  {
    name: "Aria Phone 14 Pro",
    category: "phones",
    price: 99900,
    spec: '6.7" OLED · 256GB · 5G',
    description: "Flagship phone with the largest display in the lineup and pro camera system.",
    specs: JSON.stringify([
      '6.7" Super Retina OLED, 120Hz',
      "256GB storage",
      "A18 chip, 8-core",
      "48MP triple camera",
      "5G, all-day battery",
    ]),
    stock: 14,
  },
  {
    name: "Aria Phone 14",
    category: "phones",
    price: 79900,
    spec: '6.1" OLED · 128GB · 5G',
    description: "The everyday flagship — same core chip, smaller size, lower price.",
    specs: JSON.stringify([
      '6.1" Super Retina OLED, 60Hz',
      "128GB storage",
      "A18 chip, 6-core",
      "12MP dual camera",
      "5G, 20hr battery",
    ]),
    stock: 22,
  },
  {
    name: "Vantage Book 15",
    category: "laptops",
    price: 149900,
    spec: '15.6" · 16GB RAM · 1TB SSD',
    description: "A well-balanced 15-inch laptop for work and everyday computing.",
    specs: JSON.stringify([
      '15.6" QHD 165Hz display',
      "16GB DDR5 RAM",
      "1TB NVMe SSD",
      "12-core processor",
      "18hr battery life",
    ]),
    stock: 8,
  },
  {
    name: "Vantage Air 13",
    category: "laptops",
    price: 109900,
    spec: '13.3" · 8GB RAM · 512GB SSD',
    description: "Thin, light, and built for portability without sacrificing battery life.",
    specs: JSON.stringify([
      '13.3" Retina display',
      "8GB unified memory",
      "512GB SSD",
      "10-core processor",
      "22hr battery life",
    ]),
    stock: 17,
  },
  {
    name: "Slate Tab Pro 11",
    category: "tablets",
    price: 64900,
    spec: '11" Liquid Retina · 128GB',
    description: "Pro-level tablet that supports stylus and keyboard accessories.",
    specs: JSON.stringify([
      '11" Liquid Retina display, 120Hz',
      "128GB storage",
      "Supports stylus + keyboard",
      "Front + rear camera",
      "10hr battery",
    ]),
    stock: 19,
  },
  {
    name: "Pulse Wireless Earbuds",
    category: "accessories",
    price: 17900,
    spec: "ANC · 30hr total battery",
    description: "Noise-cancelling earbuds with all-day battery via the charging case.",
    specs: JSON.stringify([
      "Active noise cancellation",
      "30hr battery with case",
      "IPX4 water resistance",
      "Wireless charging case",
      "Bluetooth 5.3",
    ]),
    stock: 41,
  },
  {
    name: "Flux 100W Fast Charger",
    category: "accessories",
    price: 4900,
    spec: "100W GaN · 3-port",
    description: "Charge a laptop and phone at the same time from one compact block.",
    specs: JSON.stringify([
      "100W total output",
      "3 ports: 2x USB-C, 1x USB-A",
      "GaN technology, compact size",
      "Charges laptop + phone simultaneously",
    ]),
    stock: 63,
  },
];

async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "price" INTEGER NOT NULL,
        "spec" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "specs" TEXT NOT NULL,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "imageUrl" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "customerName" TEXT NOT NULL,
        "customerEmail" TEXT NOT NULL,
        "shippingAddress" TEXT NOT NULL,
        "shippingCity" TEXT NOT NULL,
        "shippingZip" TEXT NOT NULL,
        "subtotal" INTEGER NOT NULL,
        "shipping" INTEGER NOT NULL,
        "tax" INTEGER NOT NULL,
        "total" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "stripeSessionId" TEXT UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "priceAtPurchase" INTEGER NOT NULL,
        FOREIGN KEY ("orderId") REFERENCES "Order"("id"),
        FOREIGN KEY ("productId") REFERENCES "Product"("id")
      );
    `);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create tables", detail: String(err) },
      { status: 500 }
    );
  }

  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    return NextResponse.json({
      message: `Database already has ${existingCount} products. Seed skipped to avoid duplicates.`,
    });
  }

  for (const p of PRODUCTS) {
    await prisma.product.create({ data: p });
  }

  return NextResponse.json({
    message: `Successfully created tables and added ${PRODUCTS.length} products.`,
  });
}

module.exports = { GET };
