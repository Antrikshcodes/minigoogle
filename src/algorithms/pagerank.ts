import type { SearchPage } from '../data/pages';

export const DAMPING_FACTOR = 0.85;
export const CONVERGENCE_THRESHOLD = 0.000001;

/**
 * Iterative PageRank over the active directed graph. Links to inactive pages
 * are ignored, and dangling rank is redistributed evenly to every active page.
 */
export function calculatePageRank(
  pages: SearchPage[],
  damping = DAMPING_FACTOR,
  threshold = CONVERGENCE_THRESHOLD,
): Map<number, number> {
  const count = pages.length;
  if (count === 0) return new Map();

  const activeIds = new Set(pages.map((page) => page.id));
  const initial = 1 / count;
  let scores = new Map(pages.map((page) => [page.id, initial]));

  for (let iteration = 0; iteration < 10_000; iteration += 1) {
    const danglingRank = pages.reduce((sum, page) => {
      const outDegree = page.linksTo.filter((id) => activeIds.has(id)).length;
      return sum + (outDegree === 0 ? (scores.get(page.id) ?? 0) : 0);
    }, 0);

    const next = new Map<number, number>();
    let difference = 0;

    for (const target of pages) {
      let incoming = 0;
      for (const source of pages) {
        const outgoing = source.linksTo.filter((id) => activeIds.has(id));
        if (outgoing.includes(target.id)) {
          incoming += (scores.get(source.id) ?? 0) / outgoing.length;
        }
      }
      const rank = (1 - damping) / count + damping * (incoming + danglingRank / count);
      next.set(target.id, rank);
      difference += Math.abs(rank - (scores.get(target.id) ?? 0));
    }

    scores = next;
    if (difference < threshold) break;
  }

  return scores;
}
