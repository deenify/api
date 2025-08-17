const QURAN_COLLECTION_PREFIX = "edition_";
const QURAN_COLLECTION_SUFFIX = "_array";

const HADITH_COLLECTION_PREFIX = "book";
const HADITH_COLLECTION_META_SUFFIX = "metadata";
const HADITH_COLLECTION_CHAPTER_SUFFIX = "chapter";

// Quranic collection helper
export function buildQuranCollectionName(language: string, version?: string) {
  return `${QURAN_COLLECTION_PREFIX}${language}${QURAN_COLLECTION_SUFFIX}${
    version ? `_${version}` : ""
  }`;
}

// Hadith collection helper
export function buildHadithCollectionName(
  book: string,
  lang?: string,
  chapter?: number | string
): string {
  if (!book)
    throw new Error(
      "Book name is required in buildHadithCollectionName helper"
    );

  if (lang && chapter) {
    return `${HADITH_COLLECTION_PREFIX}_${book}_${lang}_${HADITH_COLLECTION_CHAPTER_SUFFIX}${chapter}`;
  }

  if (lang) {
    return `${HADITH_COLLECTION_PREFIX}_${book}_${lang}`;
  }

  return `${HADITH_COLLECTION_PREFIX}_${book}_${HADITH_COLLECTION_META_SUFFIX}`;
}
