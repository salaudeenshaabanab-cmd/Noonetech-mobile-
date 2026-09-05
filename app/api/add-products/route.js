const { prisma } = require("../../../lib/prisma");
const { NextResponse } = require("next/server");

const dynamic = "force-dynamic";
const revalidate = 0;

async function POST(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let products;
  try {
    products = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "Body must be a JSON array" }, { status: 400 });
  }

  let created = 0;
  const errors = [];

  for (const p of products) {
    try {
      await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          price: p.price,
          spec: p.spec,
          description: p.description,
          specs: JSON.stringify(p.specs),
          stock: p.stock,
        },
      });
      created++;
    } catch (err) {
      errors.push({ name: p.name, error: String(err.message || err) });
    }
  }

  return NextResponse.json({
    message: `Created ${created} of ${products.length} products.`,
    errors: errors.length > 0 ? errors : undefined,
  });
}

module.exports = { POST, dynamic, revalidate };
