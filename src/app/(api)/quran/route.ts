import { NextResponse } from "next/server";
import { getQuranDb } from "@/lib/mongo/connect/connectQuran";
import { methodNotFound } from "@/lib/api/methodNotFound";
import errorResponse from "@/lib/api/errorResponse";

export async function GET() {
  try {
    const db = await getQuranDb();
    const collection = db.collection("metadata");
    const data = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();

    if (!data.length) {
      return errorResponse("Metadata not found", 404);
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "X-Cache-Note": "24h CDN cache, 1h stale allowed",
      },
    });
  } catch (error) {
    console.error("Error fetching Quran metadata:", error);
    return errorResponse(`Internal Server Error: ${error}`, 500);
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
