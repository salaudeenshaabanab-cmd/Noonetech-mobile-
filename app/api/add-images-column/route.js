const { prisma } = require("../../../lib/prisma");
const { NextResponse } = require("next/server");

const dynamic = "force-dynamic";
const revalidate = 0;

async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "images" TEXT;
    `);
    return NextResponse.json({ message: "images column added (or already existed)." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

module.exports = { GET, dynamic, revalidate };
