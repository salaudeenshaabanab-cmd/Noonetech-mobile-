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

  let names;
  try {
    names = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(names)) {
    return NextResponse.json({ error: "Body must be a JSON array of names" }, { status: 400 });
  }

  const result = await prisma.product.deleteMany({
    where: { name: { in: names } },
  });

  return NextResponse.json({
    message: `Deleted ${result.count} products matching the given names.`,
  });
}

module.exports = { POST, dynamic, revalidate };
