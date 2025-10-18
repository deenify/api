// app/(api)/dua/[...slug]/route.tsx
import { NextResponse } from "next/server";
import { methodNotFound } from "@/lib/api/methodNotFound";
import { getSupplicationDB } from "@/lib/mongo/connect/connectSupplication";
import errorResponse from "@/lib/api/errorResponse";

interface RouteParams {
  params: { slug: string[] };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const slug = params?.slug ?? [];
    const [group, supplication] = slug;

    if (slug.length > 2) {
      return errorResponse("Too many parameters.", 400);
    }

    const db = await getSupplicationDB();
    const collection = db.collection(group);

    const data = await collection.findOne({}, { projection: { _id: 0 } });
    if (!data) {
      return errorResponse(`No data found for group: ${group}`, 404);
    }

    // Specific dua by ID (e.g. /api/duas/prophetic/dl001)
    if (supplication) {
      const duaMatch = data.categories
        ?.flatMap((cat: any) => cat.supplications || [])
        .find(
          (d: any) => d?.dua_id?.toLowerCase() === supplication.toLowerCase()
        );

      if (!duaMatch) {
        return errorResponse(
          `Supplication ${supplication} not found in ${group}`,
          404
        );
      }

      return NextResponse.json(duaMatch, { status: 200 });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        "X-Cache-Note": "24h CDN cache, 1h stale allowed",
      },
    });
  } catch (error) {
    console.error("Error fetching supplication data:", error);
    return errorResponse("Internal Server Error", 500);
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
