// app/api/quran/[...slug]/route.ts
import { NextResponse } from "next/server";
import { getQuranDb } from "@/lib/mongo/connect/connectQuran";
import { methodNotFound } from "@/lib/api/methodNotFound";
import errorResponse from "@/lib/api/errorResponse";
import validateLowercase from "@/lib/api/validateLowercase";
import buildQuery from "@/lib/api/buildQuery";
import validateNumber from "@/lib/api/validateNumber";
import { buildQuranCollectionName } from "@/lib/api/buildCollectionName";
import findQuranicLangVersion from "@/lib/api/findVersion";
import findQuranicLanguage from "@/lib/api/findLanguage";

interface RouteParams {
  params: { slug: string[] };
}

export async function GET(req: Request, { params }: RouteParams) {
  let maximumSlugLength: number = 4;
  const slug = (await params.slug) || [];

  if (slug.length > maximumSlugLength) {
    return errorResponse("Too many parameters", 400);
  }

  try {
    const languageParam = slug[0];
    validateLowercase(languageParam, "Language");

    const actualLanguage = findQuranicLanguage(languageParam);
    let actualVersion: string | undefined;
    let chapterParam: string | undefined;
    let verseParam: string | undefined;

    if (slug[1] && isNaN(Number(slug[1]))) {
      // version provided, slug[2] is chapter
      actualVersion = findQuranicLangVersion(actualLanguage, slug[1]);
      chapterParam = slug[2];
      verseParam = slug[3];
      maximumSlugLength = 4;
    } else {
      // no version, slug[1] is chapter
      chapterParam = slug[1];
      verseParam = slug[2];
      maximumSlugLength = 3;
    }

    validateNumber(chapterParam, "Chapter");
    validateNumber(verseParam, "Verse");

    const collectionName = buildQuranCollectionName(
      actualLanguage,
      actualVersion
    );
    const query = buildQuery(chapterParam);

    const db = await getQuranDb();
    const collection = db.collection(collectionName);
    const data = await collection
      .find(query, { projection: { _id: 0 } })
      .toArray();

    if (!data.length) return errorResponse("No data found", 404);

    if (verseParam) {
      const verseIndex = parseInt(verseParam, 10) - 1;
      if (verseIndex < 0 || verseIndex >= data[0].verses.length) {
        return errorResponse("Verse not found", 404);
      }
      return NextResponse.json([
        {
          chapter: data[0].chapter,
          verse: parseInt(verseParam, 10),
          text: data[0].verses[verseIndex],
        },
      ]);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    if (err?.status) return errorResponse(err.message, err.status);
    console.error("Error fetching Quran data:", err);
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
