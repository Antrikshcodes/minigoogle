import type { SearchPage } from '../data/pages';

export type RankedResult = {
  page: SearchPage;
  frequency: number;
  pageRank: number;
  relevance: number;
  combinedScore: number;
};

export function countKeywordFrequency(page: SearchPage, query: string): number {
  const terms = query.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  if (terms.length === 0) return 0;
  const searchable = `${page.title} ${page.url} ${page.content}`.toLocaleLowerCase();
  return terms.reduce((total, term) => {
    const matches = searchable.match(new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}(?=$|[^\\p{L}\\p{N}])`, 'gu'));
    return total + (matches?.length ?? 0);
  }, 0);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function rankSearchResults(
  pages: SearchPage[],
  query: string,
  pageRanks: Map<number, number>,
): { oldWay: RankedResult[]; pageRankWay: RankedResult[] } {
  const matches = pages
    .map((page) => ({
      page,
      frequency: countKeywordFrequency(page, query),
      pageRank: pageRanks.get(page.id) ?? 0,
    }))
    .filter((result) => result.frequency > 0);

  const maxFrequency = Math.max(1, ...matches.map((result) => result.frequency));
  const maxRank = Math.max(1e-12, ...matches.map((result) => result.pageRank));
  const withScores = matches.map((result) => ({
    ...result,
    relevance: result.frequency / maxFrequency,
    // PageRank contributes 70%; normalized term frequency contributes 30%.
    // Relevance still gates inclusion, so a popular unrelated page never appears.
    combinedScore: 0.30 * (result.frequency / maxFrequency) + 0.70 * (result.pageRank / maxRank),
  }));

  return {
    oldWay: [...withScores].sort((a, b) => b.frequency - a.frequency || a.page.id - b.page.id),
    pageRankWay: [...withScores].sort((a, b) => b.combinedScore - a.combinedScore || b.pageRank - a.pageRank),
  };
}

export type FakePageFlag = { page: SearchPage; repeatedTerm: string; occurrences: number; words: number };

/** Transparent classroom heuristic: at least 8 copies of a word and ≥60% content share. */
export function findKeywordStuffedPages(pages: SearchPage[]): FakePageFlag[] {
  const flags: FakePageFlag[] = [];
  for (const page of pages) {
    const words = page.content.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
    if (words.length === 0) continue;
    const counts = new Map<string, number>();
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
    const mostRepeated = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (mostRepeated && mostRepeated[1] >= 8 && mostRepeated[1] / words.length >= 0.6) {
      flags.push({ page, repeatedTerm: mostRepeated[0], occurrences: mostRepeated[1], words: words.length });
    }
  }
  return flags;
}
