# MiniGoogle 1998

A small classroom search engine that compares keyword frequency with link based ranking. The six page records and directed links are kept in `src/data/pages.ts`; the algorithms are independent of the React ui.

Made by Antriksh.

## Run it

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## How the rankings work

- **Old Way:** count whole word matches in each page's title, URL, and content, then sort by frequency.
- **PageRank Way:** run iterative PageRank on the active directed graph with damping factor `0.85`, initial rank `1/N`, dangling rank redistribution, and a `0.000001` convergence threshold. Results with no query match are excluded. The displayed blend is `0.30 × normalized keyword frequency + 0.70 × normalized PageRank` among matching pages.
- **Fake page review:** flag a page when a word appears at least 8 times and accounts for at least 60% of its content words. Flagged records remain in the original dataset; removing one only changes the active index. Reset restores all six pages.

The graph always shows all six original pages. Removed pages are dimmed; PageRank ignores inactive pages and their links, then recalculates.
