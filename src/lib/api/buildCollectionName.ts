const COLLECTION_PREFIX = "edition_";
const COLLECTION_SUFFIX = "_array";

function buildCollectionName(language: string, version?: string) {
  return `${COLLECTION_PREFIX}${language}${COLLECTION_SUFFIX}${
    version ? `_${version}` : ""
  }`;
}
export default buildCollectionName;
