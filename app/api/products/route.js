const { prisma } = require("../../../lib/prisma");
const { NextResponse } = require("next/server");

const dynamic = "force-dynamic";
const revalidate = 0;

async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => ({
      ...p,
      specs: JSON.parse(p.specs),
    }));

    return NextResponse.json(
      { products: formatted },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

module.exports = { GET, dynamic, revalidate };
