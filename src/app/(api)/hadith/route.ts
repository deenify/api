import { NextResponse } from "next/server";
import { methodNotFound } from "@/lib/api/methodNotFound";
import { getHadithBookwiseDb } from "@/lib/mongo/connect/connectHadithBookwise";

export async function GET() {
  try {
    const db = await getHadithBookwiseDb();
    const collection = db.collection("metadata");
    const data = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();

    if (!data.length) {
      return NextResponse.json(
        { error: "Metadata not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "X-Cache-Note": "24h CDN cache, 1h stale allowed",
      },
    });
  } catch (error) {
    console.error("Error fetching Hadith metadata:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

export {
  methodNotFound as POST,
  methodNotFound as PUT,
  methodNotFound as PATCH,
  methodNotFound as DELETE,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
