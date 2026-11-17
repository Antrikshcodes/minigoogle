import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDownRight,
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Network,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { ORIGINAL_PAGES, type SearchPage } from './data/pages';
import { calculatePageRank } from './algorithms/pagerank';
import { countKeywordFrequency, findKeywordStuffedPages, rankSearchResults, type RankedResult } from './algorithms/search';

const EXAMPLES = ['pizza', 'food', 'Pune', 'chai', 'dosa'];

export default function App() {
  const [pages, setPages] = useState<SearchPage[]>(ORIGINAL_PAGES);
  const [queryInput, setQueryInput] = useState('pizza');
  const [query, setQuery] = useState('pizza');
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [showFakeReview, setShowFakeReview] = useState(false);
  const [notice, setNotice] = useState('');

  const pageRanks = useMemo(() => calculatePageRank(pages), [pages]);
  const results = useMemo(() => rankSearchResults(pages, query, pageRanks), [pages, query, pageRanks]);
  const fakeFlags = useMemo(() => findKeywordStuffedPages(pages), [pages]);
  const selectedPage = ORIGINAL_PAGES.find((page) => page.id === selectedPageId) ?? null;
  const indexedIds = new Set(pages.map((page) => page.id));

  useEffect(() => {
    if (!selectedPageId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPageId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPageId]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(queryInput.trim());
    setNotice('');
  }

  function searchExample(example: string) {
    setQueryInput(example);
    setQuery(example);
    setNotice('');
  }

  function removePage(id: number) {
    const removed = pages.find((page) => page.id === id);
    setPages((current) => current.filter((page) => page.id !== id));
    setNotice(`${removed?.url ?? 'Page'} removed from the active index. PageRank has been recalculated.`);
  }

  function resetIndex() {
    setPages(ORIGINAL_PAGES);
    setQueryInput('pizza');
    setQuery('pizza');
    setSelectedPageId(null);
    setShowFakeReview(false);
    setNotice('All six original pages restored. PageRank has been recalculated.');
  }

  return (
    <main className="site-shell">
      <div className="topline">
        <span><span className="status-dot" /> THE WEB, CIRCA 1998</span>
        <span className="topline-index">{pages.length} of 6 pages indexed</span>
      </div>

      <header className="masthead">
        <div className="logo-lockup" aria-label="MiniGoogle 1998">
          <div className="wordmark" aria-hidden="true">
            <span className="blue">M</span><span className="red">i</span><span className="yellow">n</span><span className="blue">i</span><span className="green">G</span><span className="red">o</span><span className="blue">o</span><span className="yellow">g</span><span className="green">l</span><span className="red">e</span>
          </div>
          <span className="year-tag">1998</span>
        </div>
        <div className="masthead-note">A little search experiment<br />from the early web</div>
      </header>

      <section className="search-intro" aria-labelledby="search-heading">
        <div className="eyebrow"><span className="eyebrow-line" /> THE SEARCH LAB <span className="eyebrow-line" /></div>
        <h1 id="search-heading">Two ways to find a page.</h1>
        <p className="intro-copy">Try the old trick. Then see what changes when links count as votes.</p>
        <form className="search-form" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="search-input">Search the web</label>
          <Search className="search-icon" size={19} strokeWidth={1.8} aria-hidden="true" />
          <input
            id="search-input"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search the web..."
            autoComplete="off"
          />
          <button type="submit" className="search-button">Google Search <ChevronRight size={15} /></button>
        </form>
        <div className="example-row">
          <span>Try:</span>
          {EXAMPLES.map((example) => (
            <button type="button" className={query.toLowerCase() === example.toLowerCase() ? 'example-chip active' : 'example-chip'} key={example} onClick={() => searchExample(example)}>{example}</button>
          ))}
          <span className="example-tail">· or anything you like</span>
        </div>
      </section>

      <section className="results-section" aria-labelledby="results-heading">
        <div className="results-heading-row">
          <div>
            <div className="section-kicker">SEARCH RESULTS</div>
            <h2 id="results-heading">{query ? <>Results for <span className="query-highlight">“{query}”</span></> : 'Ready when you are'}</h2>
          </div>
          <div className="result-count"><strong>{results.oldWay.length}</strong> {results.oldWay.length === 1 ? 'page' : 'pages'} found <span>·</span> {pages.length} indexed</div>
        </div>

        {notice && <div className="notice" role="status"><Check size={15} />{notice}</div>}

        <div className="ranking-grid">
          <RankingColumn
            title="Old Way"
            subtitle="How many times the word appears."
            variant="old"
            results={results.oldWay}
            onOpen={setSelectedPageId}
          />
          <RankingColumn
            title="PageRank Way"
            subtitle="How important a page is to other pages."
            variant="rank"
            results={results.pageRankWay}
            onOpen={setSelectedPageId}
          />
        </div>

        {query && results.oldWay.length === 0 && (
          <div className="empty-state"><Search size={21} /><strong>No pages found for “{query}”.</strong><span>Try pizza, food, Pune, chai, or dosa.</span></div>
        )}

        <div className="takeaway"><span className="takeaway-mark">“</span><p>Old search engines could be manipulated by repeating keywords. <strong>PageRank changed the game by treating links as votes of confidence.</strong></p><span className="takeaway-source">THE BIG IDEA, 1998</span></div>
      </section>

      <section className="tool-grid" aria-label="Explore the index">
        <div className="tool-card fake-tool">
          <div className="tool-heading">
            <div className="tool-icon warning-icon"><ShieldAlert size={18} /></div>
            <div><div className="section-kicker">INDEX QUALITY</div><h2>Spot the keyword stuffing</h2></div>
          </div>
          <p>Repeated words can fool a frequency counter. Scan the active index to see which pages look suspicious.</p>
          <button className="secondary-button" type="button" onClick={() => setShowFakeReview((value) => !value)}>
            <ShieldAlert size={15} /> {showFakeReview ? 'Hide review' : 'Remove fake pages'} <ArrowDownRight size={14} />
          </button>
          {showFakeReview && <FakePageReview flags={fakeFlags} onRemove={removePage} />}
        </div>

        <div className="tool-card graph-tool">
          <div className="tool-heading">
            <div className="tool-icon graph-icon"><Network size={18} /></div>
            <div><div className="section-kicker">THE NEIGHBORHOOD</div><h2>Who links to whom?</h2></div>
          </div>
          <p>Each arrow is a vote. Tap a page node to explore it.</p>
          <LinkGraph indexedIds={indexedIds} onOpen={setSelectedPageId} />
          <div className="graph-caption"><span><i className="legend-dot active-dot" /> In active index</span><span><i className="legend-dot removed-dot" /> Removed from search</span></div>
        </div>
      </section>

      <section className="explainer">
        <div className="explainer-title">
          <div className="tool-icon book-icon"><BookOpen size={18} /></div>
          <div><div className="section-kicker">UNDER THE HOOD</div><h2>Links are little votes.</h2></div>
        </div>
        <div className="explainer-content">
          <p>In the old way, a page could climb the list just by repeating a search term. PageRank asks a different question: <em>who is pointing to this page?</em> A link from a well-connected page carries more weight than a link from an obscure one.</p>
          <div className="formula-card">
            <span className="formula-label">THE PAGE RANK RECIPE</span>
            <div className="formula">PR(A) = <span>(1 − d) / N</span> + d × <span>Σ PR(T) / C(T)</span></div>
            <div className="formula-note">d = 0.85 damping · N = active pages · T = pages linking here · C(T) = links sent by T</div>
          </div>
          <div className="score-note"><span className="score-dot" /> Search blend: <strong>30% keyword relevance + 70% normalized PageRank</strong>. Pages with no keyword match are left out.</div>
        </div>
      </section>

      <footer className="footer">
        <span>MINIGOOGLE 1998 <span className="footer-separator">/</span> A CLASSROOM SEARCH LAB</span>
        <span className="made-by">MADE BY ANTRIKSH</span>
        <button className="reset-button" type="button" onClick={resetIndex}><RotateCcw size={14} /> Reset all 6 pages</button>
      </footer>

      {selectedPage && <PageExplorer page={selectedPage} query={query} pageRank={pageRanks.get(selectedPage.id) ?? 0} isIndexed={indexedIds.has(selectedPage.id)} onClose={() => setSelectedPageId(null)} onOpen={setSelectedPageId} />}
    </main>
  );
}

function RankingColumn({
  title,
  subtitle,
  variant,
  results,
  onOpen,
}: {
  title: string;
  subtitle: string;
  variant: 'old' | 'rank';
  results: RankedResult[];
  onOpen: (id: number) => void;
}) {
  const maxBar = Math.max(1, ...results.map((result) => variant === 'old' ? result.frequency : result.combinedScore));
  return (
    <section className={`ranking-column ${variant}`} aria-label={`${title} search results`}>
      <div className="column-heading">
        <div className="column-title-line"><span className="column-symbol">{variant === 'old' ? '01' : '02'}</span><h3>{title}</h3></div>
        <p>{subtitle}</p>
      </div>
      {results.length === 0 ? (
        <div className="column-empty">Search a word to see how this method ranks the web.</div>
      ) : (
        <div className="result-list">
          {results.map((result, index) => {
            const score = variant === 'old' ? result.frequency : result.combinedScore;
            const width = Math.max(4, (score / maxBar) * 100);
            return (
              <button key={result.page.id} type="button" className="result-card" onClick={() => onOpen(result.page.id)} aria-label={`Open ${result.page.url} details`}>
                <div className="result-topline"><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><span className="result-domain">{result.page.url}</span><ExternalLink size={13} className="open-indicator" /></div>
                <h4>{result.page.title}</h4>
                <p className="result-description">{result.page.content}</p>
                <div className="score-row">
                  <span>{result.frequency} {result.frequency === 1 ? 'match' : 'matches'}</span>
                  {variant === 'rank' && <span className="pagerank-score">PR <strong>{result.pageRank.toFixed(4)}</strong></span>}
                  {variant === 'rank' && <span className="combined-score">BLEND <strong>{result.combinedScore.toFixed(2)}</strong></span>}
                  {variant === 'old' && <span className="method-score">FREQUENCY <strong>{result.frequency}</strong></span>}
                </div>
                <div className="score-track" aria-label={variant === 'old' ? `${result.frequency} keyword matches` : `Combined score ${result.combinedScore.toFixed(2)}`}><span style={{ width: `${width}%` }} /></div>
                <span className="card-hint">Explore page <ChevronRight size={12} /></span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FakePageReview({ flags, onRemove }: { flags: ReturnType<typeof findKeywordStuffedPages>; onRemove: (id: number) => void }) {
  if (flags.length === 0) {
    return <div className="fake-review empty-review"><Check size={15} /> No suspicious pages remain in the active index.</div>;
  }
  return (
    <div className="fake-review" aria-live="polite">
      <div className="heuristic-note">Flagged when one word appears <strong>8+ times</strong> and makes up <strong>60%+</strong> of page content.</div>
      {flags.map(({ page, repeatedTerm, occurrences, words }) => (
        <div className="fake-flag" key={page.id}>
          <div><strong>{page.url}</strong><span>“{repeatedTerm}” appears {occurrences} of {words} words ({Math.round((occurrences / words) * 100)}%).</span></div>
          <button type="button" onClick={() => onRemove(page.id)}>Remove <X size={13} /></button>
        </div>
      ))}
    </div>
  );
}

const graphNodes: Array<{ id: number; x: number; y: number; short: string }> = [
  { id: 1, x: 88, y: 104, short: 'PUNE FOOD' },
  { id: 2, x: 247, y: 66, short: 'BEST PIZZA' },
  { id: 3, x: 411, y: 108, short: 'CANTEEN' },
  { id: 4, x: 410, y: 231, short: 'RECIPES' },
  { id: 5, x: 246, y: 270, short: 'CHEAP EATS' },
  { id: 6, x: 79, y: 246, short: 'PIZZA ×10' },
];

const graphEdges = [
  { from: 1, to: 2, d: 'M 112 98 Q 171 71 222 67' },
  { from: 2, to: 1, d: 'M 222 79 Q 166 91 112 111' },
  { from: 2, to: 3, d: 'M 271 69 Q 334 74 386 100' },
  { from: 3, to: 2, d: 'M 386 113 Q 325 91 271 79' },
  { from: 3, to: 4, d: 'M 411 132 L 410 206' },
  { from: 4, to: 2, d: 'M 386 216 Q 323 150 262 89' },
  { from: 4, to: 5, d: 'M 386 239 Q 324 265 270 270' },
  { from: 5, to: 2, d: 'M 234 251 Q 218 162 234 91' },
  { from: 6, to: 1, d: 'M 86 222 Q 102 171 94 128' },
];

function LinkGraph({ indexedIds, onOpen }: { indexedIds: Set<number>; onOpen: (id: number) => void }) {
  return (
    <div className="graph-canvas">
      <svg viewBox="0 0 500 315" role="img" aria-label="Directed link graph of the six MiniGoogle pages">
        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#83a58a" /></marker>
          <marker id="inactive-arrowhead" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#d5d6cf" /></marker>
        </defs>
        {graphEdges.map((edge, index) => {
          const isActive = indexedIds.has(edge.from) && indexedIds.has(edge.to);
          return <path key={index} className={`graph-edge ${isActive ? '' : 'inactive-edge'}`} d={edge.d} markerEnd={`url(#${isActive ? 'arrowhead' : 'inactive-arrowhead'})`} />;
        })}
        {graphNodes.map((node) => {
          const isActive = indexedIds.has(node.id);
          return (
            <g key={node.id} className={`graph-node ${isActive ? '' : 'inactive-node'}`} role="button" tabIndex={0} aria-label={`Open page ${node.id}: ${node.short}`} onClick={() => onOpen(node.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpen(node.id); }}>
              <circle cx={node.x} cy={node.y} r="24" />
              <text x={node.x} y={node.y + 4} textAnchor="middle">{String(node.id).padStart(2, '0')}</text>
              <text className="node-label" x={node.x} y={node.y + 40} textAnchor="middle">{node.short}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PageExplorer({ page, query, pageRank, isIndexed, onClose, onOpen }: {
  page: SearchPage;
  query: string;
  pageRank: number;
  isIndexed: boolean;
  onClose: () => void;
  onOpen: (id: number) => void;
}) {
  const incoming = ORIGINAL_PAGES.filter((candidate) => candidate.linksTo.includes(page.id));
  const outgoing = page.linksTo.map((id) => ORIGINAL_PAGES.find((candidate) => candidate.id === id)).filter((candidate): candidate is SearchPage => Boolean(candidate));
  const frequency = isIndexed ? countKeywordFrequency(page, query) : 0;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="page-modal" role="dialog" aria-modal="true" aria-labelledby="page-modal-title">
        <div className="modal-topline"><span>{isIndexed ? 'PAGE EXPLORER' : 'REMOVED PAGE · ARCHIVE VIEW'}</span><button type="button" className="close-button" aria-label="Close page details" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-rank">PAGE {String(page.id).padStart(2, '0')} <span>·</span> {isIndexed ? 'IN ACTIVE INDEX' : 'NOT IN ACTIVE INDEX'}</div>
        <h2 id="page-modal-title">{page.title}</h2>
        <div className="modal-url">{page.url} <ExternalLink size={13} /></div>
        <div className="page-content-box"><span className="section-kicker">PAGE CONTENT</span><p>{page.content}</p></div>
        <div className="modal-metrics">
          <div><span>QUERY MATCHES</span><strong>{frequency}</strong></div>
          <div><span>PAGERANK</span><strong>{isIndexed ? pageRank.toFixed(4) : '—'}</strong></div>
        </div>
        <div className="link-columns">
          <div><h3>INCOMING VOTES <span>{incoming.length}</span></h3>{incoming.length ? incoming.map((link) => <button key={link.id} type="button" onClick={() => onOpen(link.id)}><span className="link-arrow incoming-arrow">↙</span>{link.url}<ChevronRight size={13} /></button>) : <p className="no-links">No incoming links.</p>}</div>
          <div><h3>OUTGOING LINKS <span>{outgoing.length}</span></h3>{outgoing.length ? outgoing.map((link) => <button key={link.id} type="button" onClick={() => onOpen(link.id)}><span className="link-arrow">↗</span>{link.url}<ChevronRight size={13} /></button>) : <p className="no-links">No outgoing links.</p>}</div>
        </div>
        <div className="modal-footnote"><Network size={14} /> {incoming.length} incoming {incoming.length === 1 ? 'link is' : 'links are'} counted as {incoming.length === 1 ? 'a vote' : 'votes'} toward this page.</div>
      </section>
    </div>
  );
}
