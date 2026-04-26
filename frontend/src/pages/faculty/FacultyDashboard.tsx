import { useEffect, useMemo, useState } from 'react';
import { Activity, FilePlus2, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  facultyDashboardService,
  type FacultyDashboardThesis,
  type FacultyDailyQuote,
} from '../../services/facultyDashboardService';

export default function FacultyDashboard() {
  const DISPLAY_LIMIT = 10;
  const { user } = useAuth();
  const [recentTheses, setRecentTheses] = useState<FacultyDashboardThesis[]>([]);
  const [topSearches, setTopSearches] = useState<FacultyDashboardThesis[]>([]);
  const [quote, setQuote] = useState<FacultyDailyQuote | null>(null);
  const [recentlyAddedExpanded, setRecentlyAddedExpanded] = useState(false);
  const [topSearchesExpanded, setTopSearchesExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'faculty') return;

    setLoading(true);
    setError(null);

    void facultyDashboardService.getDashboard()
      .then((dashboardResponse) => {
        setRecentTheses(dashboardResponse.recent_theses ?? []);
        setTopSearches(dashboardResponse.top_searches ?? []);
        setQuote(dashboardResponse.daily_quote ?? null);
      })
      .catch((err) => {
        setRecentTheses([]);
        setTopSearches([]);
        setQuote(null);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.role]);

  const recentCards = useMemo(() => recentTheses.slice(0, 4), [recentTheses]);
  const recentlyAddedCards = useMemo(
    () => (recentlyAddedExpanded ? recentTheses : recentTheses.slice(0, DISPLAY_LIMIT)),
    [recentTheses, recentlyAddedExpanded, DISPLAY_LIMIT],
  );
  const topSearchCards = useMemo(
    () => (topSearchesExpanded ? topSearches : topSearches.slice(0, DISPLAY_LIMIT)),
    [topSearches, topSearchesExpanded, DISPLAY_LIMIT],
  );

  const thesisHref = (item: FacultyDashboardThesis) => `/faculty/theses/${encodeURIComponent(item.id)}`;
  const truncateTitle = (title: string, maxWords = 6) => {
    const words = title.trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return title;
    return `${words.slice(0, maxWords).join(' ')}...`;
  };
  const formatAuthorLine = (item: FacultyDashboardThesis) => {
    const rawAuthor = item.author || item.submitter_name || 'Student';
    const authors = rawAuthor
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const compactAuthor = authors.length > 1 ? `${authors[0]} et al.` : authors[0] || rawAuthor;

    return item.year ? `${compactAuthor} · ${item.year}` : compactAuthor;
  };

  const renderDashboardCard = (item: FacultyDashboardThesis) => {
    const tags = (item.keywords?.length ? item.keywords : [item.category, item.department]).filter(Boolean).slice(0, 2);

    return (
      <Link
        className="vpaa-category-thesis-card"
        key={item.id}
        to={thesisHref(item)}
        state={{ thesis: item }}
      >
        <div className="vpaa-cover vpaa-category-thesis-cover">
          <div className="vpaa-cover-meta">Technological University of the Philippines</div>
          <div className="vpaa-cover-meta">{item.department || item.category || 'Thesis Archive'}</div>
        </div>

        <div className="vpaa-category-thesis-body">
          <h3>{truncateTitle(item.title)}</h3>
          <p>{formatAuthorLine(item)}</p>
          <div className="vpaa-category-tags">
            {tags.map((tag) => (
              <span className="vpaa-pill vpaa-category-tag" key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </Link>
    );
  };

  const renderRecentlyAddedCard = (item: FacultyDashboardThesis) => {
    const tags = (item.keywords?.length ? item.keywords : [item.category, item.department]).filter(Boolean).slice(0, 2);

    return (
      <Link
        className="recent-added-card"
        key={item.id}
        to={thesisHref(item)}
        state={{ thesis: item }}
      >
        <div className="recent-added-card-cover">
          <div className="recent-added-card-cover-meta">TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES</div>
          <div className="recent-added-card-cover-meta">{item.department || item.category || 'THESIS ARCHIVE'}</div>
        </div>

        <div className="recent-added-card-body">
          <h4>{truncateTitle(item.title)}</h4>
          <p>{formatAuthorLine(item)}</p>
          <div className="recent-added-card-tags">
            {tags.map((tag) => (
              <span className="recent-added-card-tag" key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <FacultyLayout
      title={<><span>Welcome back, </span><em>{user?.first_name || user?.name || 'Faculty'}</em>!</>}
      description="Here&apos;s an overview of thesis submissions, pending reviews, and department activity."
      hidePageIntro
    >
      <div className="vpaa-page-intro">
        <h1><span>Welcome back, </span><em>{user?.first_name || user?.name || 'Faculty'}</em> !</h1>
        <p>Here&apos;s an overview of thesis submissions, pending reviews, and department activity.</p>
      </div>

      {loading ? (
        <div className="vpaa-card" style={{ display: 'grid', placeItems: 'center', minHeight: 280, gap: 12 }}>
          <LoaderCircle size={28} className="animate-spin" />
          <p className="vpaa-loading-copy">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="vpaa-banner-error">{error}</div>
      ) : (
        <>
          <div className="vpaa-hero-row">
            <div className="vpaa-quote-banner">
              <div className="vpaa-quote-title">Today&apos;s Quote</div>
              {quote ? (
                <>
                  <p className="vpaa-quote-body">&quot;{quote.body}&quot;</p>
                  <span>- {quote.author}</span>
                </>
              ) : (
                <p className="vpaa-quote-body">No quote available.</p>
              )}
            </div>

            <div className="vpaa-cover-strip">
              <div className="vpaa-cover-strip-label">Continue Reading</div>
              <div className="vpaa-cover-scroll">
                {recentCards.map((item) => (
                  <Link className="continue-reading-card" key={item.id} to={thesisHref(item)} state={{ thesis: item }}>
                    <div className="continue-reading-card-head">
                      <div className="continue-reading-card-meta">TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES</div>
                      <div className="continue-reading-card-meta">{item.department || 'COMPUTER STUDIES DEPARTMENT'}</div>
                    </div>
                    <div className="continue-reading-card-body">
                      <h4>{truncateTitle(item.title)}</h4>
                      <p>{item.author || item.submitter_name || 'Student'}{item.year ? `, ${item.year}` : ''}</p>
                    </div>
                  </Link>
                ))}
                {!recentCards.length ? (
                  <div className="continue-reading-card" aria-hidden="true">
                    <div className="continue-reading-card-head">
                      <div className="continue-reading-card-meta">TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES</div>
                      <div className="continue-reading-card-meta">FACULTY WORKSPACE</div>
                    </div>
                    <div className="continue-reading-card-body">
                      <h4>No recent submissions yet</h4>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="vpaa-card vpaa-dashboard-panel">
            <div className="vpaa-dashboard-head">
              <h3><FilePlus2 size={16} /> Recently Added</h3>
              {recentTheses.length > DISPLAY_LIMIT ? (
                <button
                  type="button"
                  className="vpaa-dashboard-toggle"
                  onClick={() => setRecentlyAddedExpanded((current) => !current)}
                >
                  {recentlyAddedExpanded ? 'Show Less' : 'Show All'}
                </button>
              ) : null}
            </div>
            {recentlyAddedCards.length ? (
              <div className="recent-added-grid">
                {recentlyAddedCards.map(renderRecentlyAddedCard)}
              </div>
            ) : (
              <div className="vpaa-dashboard-empty">No recently added theses are available yet.</div>
            )}
          </div>

          <div className="vpaa-card vpaa-dashboard-panel">
            <div className="vpaa-dashboard-head">
              <h3><Activity size={16} /> Top Searches</h3>
              {topSearches.length > DISPLAY_LIMIT ? (
                <button
                  type="button"
                  className="vpaa-dashboard-toggle"
                  onClick={() => setTopSearchesExpanded((current) => !current)}
                >
                  {topSearchesExpanded ? 'Show Less' : 'Show All'}
                </button>
              ) : null}
            </div>
            {topSearchCards.length ? (
              <div className="vpaa-grid-4">
                {topSearchCards.map(renderDashboardCard)}
              </div>
            ) : (
              <div className="vpaa-dashboard-empty">No top searches are available yet.</div>
            )}
          </div>
        </>
      )}
    </FacultyLayout>
  );
}
