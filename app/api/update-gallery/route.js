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

  let updates;
  try {
    updates = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Body must be a JSON array" }, { status: 400 });
  }

  let updated = 0;
  const notFound = [];

  for (const u of updates) {
    const where = u.spec ? { name: u.name, spec: u.spec } : { name: u.name };
    const result = await prisma.product.updateMany({
      where,
      data: {
        images: JSON.stringify(u.images),
        imageUrl: u.images && u.images.length > 0 ? u.images[0] : undefined,
      },
    });
    if (result.count > 0) {
      updated += result.count;
    } else {
      notFound.push({ name: u.name, spec: u.spec });
    }
  }

  return NextResponse.json({
    message: `Updated ${updated} products.`,
    notFound: notFound.length > 0 ? notFound : undefined,
  });
}

module.exports = { POST, dynamic, revalidate };
