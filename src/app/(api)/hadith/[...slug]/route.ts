// app/api/hadith/[...slug]/route.ts
import { NextResponse } from "next/server";
import { methodNotFound } from "@/lib/api/methodNotFound";
import { getHadithBookwiseDb } from "@/lib/mongo/connect/connectHadithBookwise";
import { getHadithChapterwiseABM_Db } from "@/lib/mongo/connect/connectHadithChapterwiseABM";
import { getHadithChapterwiseITN_Db } from "@/lib/mongo/connect/connectHadithChapterwiseITN";
import { buildHadithCollectionName } from "@/lib/api/buildCollectionName";
import { isInt } from "@/lib/utils/isIntigerUtils";
import errorResponse from "@/lib/api/errorResponse";
import { hadithBooks } from "@/lib/api/consts";
const ABM_BOOKS = hadithBooks.ABM_BOOKS;
const ITN_BOOKS = hadithBooks.ITN_BOOKS;

interface RouteParams {
  params: { slug: string[] };
}

async function getChapterwiseDb(book: string) {
  if (ABM_BOOKS.has(book)) return getHadithChapterwiseABM_Db();
  if (ITN_BOOKS.has(book)) return getHadithChapterwiseITN_Db();
  return getHadithChapterwiseABM_Db();
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const slug = (await params?.slug) ?? [];
    const [book, lang, chapter, verse] = slug;

    const url = new URL(req.url);
    const hadithQuery = url.searchParams.get("hadith");

    if (!lang) {
      const db = await getHadithBookwiseDb();
      const meta = await db
        .collection(buildHadithCollectionName(book))
        .findOne({}, { projection: { _id: 0 } });
      if (!meta) return errorResponse("Book metadata not found", 404);
      return NextResponse.json(meta);
    }

    if (hadithQuery && !chapter) {
      if (!isInt(hadithQuery)) {
        return errorResponse("hadith query must be integer", 400);
      }
      const hadithNum = parseInt(hadithQuery, 10);

      const db = await getChapterwiseDb(book);
      const meta = await db
        .collection(buildHadithCollectionName(book))
        .findOne({}, { projection: { _id: 0 } });
      if (!meta) {
        return errorResponse("Book metadata not found (getChapterwiseDb)", 404);
      }

      const chapterInfo = meta.all_chapters_detail.find(
        (ch: any) =>
          hadithNum >= ch.chapter_first_hadith &&
          hadithNum <= ch.chapter_last_hadith
      );
      if (!chapterInfo) {
        return errorResponse("Hadith not found in metadata", 404);
      }

      const chapterNum =
        String(chapterInfo.chapterNum) ??
        String(meta.all_chapters_detail.indexOf(chapterInfo) + 1);
      const chapterDoc = await db
        .collection(buildHadithCollectionName(book, lang, chapterNum))
        .findOne({}, { projection: { _id: 0 } });
      if (!chapterDoc) return errorResponse("Chapter not found", 404);

      const found = chapterDoc.hadith_list?.find(
        (h: any) => h.hadithNum_inBook === hadithNum
      );
      if (!found) return errorResponse("Hadith not found in chapter", 404);

      return NextResponse.json({
        ...found,
        book: meta.book_name_english,
        chapter: chapterInfo.chapter_title_english,
        chapterNum,
      });
    }

    if (!chapter) {
      const db = await getHadithBookwiseDb();
      const doc = await db
        .collection(buildHadithCollectionName(book, lang))
        .findOne({}, { projection: { _id: 0 } });
      if (!doc) return errorResponse("Book not found in this language", 404);
      return NextResponse.json(doc);
    }

    if (!isInt(chapter)) return errorResponse("Chapter must be integer", 400);
    const chapterNum = parseInt(chapter, 10);
    const dbChap = await getChapterwiseDb(book);
    const chapterDoc = await dbChap
      .collection(buildHadithCollectionName(book, lang, chapter))
      .findOne({}, { projection: { _id: 0 } });
    if (!chapterDoc) return errorResponse("Chapter not found", 404);

    if (verse) {
      if (!isInt(verse)) return errorResponse("Verse must be integer", 400);
      const verseNum = parseInt(verse, 10);

      const found = chapterDoc.hadith_list?.find(
        (h: any) =>
          h.hadithNum_inChapter === verseNum || h.hadithNum_inBook === verseNum
      );
      if (!found) return errorResponse("Hadith not found in chapter", 404);

      return NextResponse.json({
        ...found,
        book,
        chapter: chapterNum,
      });
    }

    return NextResponse.json(chapterDoc);
  } catch (err: any) {
    console.error("Hadith route error:", err);
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
