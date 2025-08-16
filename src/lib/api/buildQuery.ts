function buildQuery(chapter?: string, verse?: string) {
  const query: Record<string, any> = {};
  if (chapter) query.chapter = parseInt(chapter, 10);
  if (verse) query.verse = parseInt(verse, 10);
  return query;
}
export default buildQuery;
