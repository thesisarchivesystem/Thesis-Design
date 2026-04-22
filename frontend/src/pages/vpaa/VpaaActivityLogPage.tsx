import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, RefreshCw, Search, SquareSplitVertical, Users2 } from 'lucide-react';
import VpaaLayout from '../../components/vpaa/VpaaLayout';
import { vpaaDashboardService, type VpaaActivityLogResponse, type VpaaActivityRow } from '../../services/vpaaDashboardService';

const ACTIVITY_LOG_CACHE_KEY = 'vpaa-activity-log-cache';
const ACTIVITY_PAGE_SIZE = 10;

const defaultSummary = {
  actions_today: 0,
  approvals: 0,
  account_updates: 0,
  last_activity: 'No recent activity',
};

const toneClassMap: Record<VpaaActivityRow['tone'], string> = {
  maroon: 'status-pending',
  sky: 'status-pending',
  sage: 'status-approved',
  terracotta: 'status-revision',
  gold: 'status-pending',
};

const formatRelativeTime = (timestamp: string) => {
  const itemDate = new Date(timestamp);
  if (Number.isNaN(itemDate.getTime())) return 'Just now';

  const seconds = Math.max(0, Math.floor((Date.now() - itemDate.getTime()) / 1000));
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return itemDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function VpaaActivityLogPage() {
  const [activityData, setActivityData] = useState<VpaaActivityLogResponse | null>(() => {
    if (typeof window === 'undefined') return null;

    const cached = window.localStorage.getItem(ACTIVITY_LOG_CACHE_KEY);
    if (!cached) return null;

    try {
      return JSON.parse(cached) as VpaaActivityLogResponse;
    } catch {
      return null;
    }
  });
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'week' | 'mine'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [, setTimeTick] = useState(Date.now());

  const loadActivityLog = async () => {
    setRefreshing(true);
    try {
      const response = await vpaaDashboardService.getActivityLog();
      setActivityData(response);
      window.localStorage.setItem(ACTIVITY_LOG_CACHE_KEY, JSON.stringify(response));
    } catch {
      setActivityData((current) => current);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadActivityLog();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeTick(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const activityOptions = useMemo(
    () => ['all', ...new Set((activityData?.logs ?? []).map((item) => item.badge))],
    [activityData],
  );

  const departmentOptions = useMemo(
    () => ['all', ...new Set((activityData?.logs ?? []).map((item) => item.department))],
    [activityData],
  );

  const filteredLogs = useMemo(() => {
    const logs = activityData?.logs ?? [];

    return logs.filter((item) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch = !normalizedSearch || [item.badge, item.request_record, item.account, item.department]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);

      const matchesActivity = activityFilter === 'all' || item.badge === activityFilter;
      const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter;

      const itemDate = new Date(item.timestamp);
      const now = new Date();
      const dayDiff = Number.isNaN(itemDate.getTime()) ? Number.POSITIVE_INFINITY : (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
      const matchesQuick = quickFilter === 'all'
        || (quickFilter === 'today' && dayDiff < 1)
        || (quickFilter === 'week' && dayDiff <= 7)
        || (quickFilter === 'mine' && item.account.toLowerCase().includes('vpaa'));

      return matchesSearch && matchesActivity && matchesDepartment && matchesQuick;
    });
  }, [activityData, search, activityFilter, departmentFilter, quickFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ACTIVITY_PAGE_SIZE));

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ACTIVITY_PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + ACTIVITY_PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activityFilter, departmentFilter, quickFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatRoleLabel = (role?: string) => {
    if (!role) return 'System';
    if (role.toLowerCase() === 'vpaa') return 'VPAA';
    if (role.toLowerCase() === 'system') return 'System';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const summaryCards = [
    { label: 'Actions Today', value: activityData?.summary.actions_today ?? defaultSummary.actions_today, icon: <Clock3 size={18} />, tone: 'phi-blue' },
    { label: 'Approvals', value: activityData?.summary.approvals ?? defaultSummary.approvals, icon: <CheckCircle2 size={18} />, tone: 'phi-green' },
    { label: 'Account Updates', value: activityData?.summary.account_updates ?? defaultSummary.account_updates, icon: <Users2 size={18} />, tone: 'phi-maroon' },
    { label: 'Last Activity', value: activityData?.summary.last_activity ?? defaultSummary.last_activity, icon: <Clock3 size={18} />, tone: 'phi-gold' },
  ];

  return (
    <VpaaLayout title="Activity Log" description="Track approvals, faculty account updates, and policy changes across departments.">
      <div className="vpaa-grid-4 student-submissions-stats vpaa-activity-summary-grid" style={{ marginBottom: 28 }}>
        {summaryCards.map((card) => (
          <article className="student-submissions-stat-card vpaa-card vpaa-activity-summary-card" key={card.label}>
            <div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
            <span className={`student-submissions-stat-icon ${card.tone}`}>{card.icon}</span>
          </article>
        ))}
      </div>

      <div className="review-panel">
        <div className="ra-header">
          <div className="ra-header-left">
            <span className="panel-header-icon phi-maroon"><SquareSplitVertical size={17} /></span>
            <h3 className="panel-title">Recent Activity</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" className="recent-see-all recent-refresh" onClick={() => void loadActivityLog()}>
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="vpaa-activity-search">
              <Search size={16} />
              <input
                className="filter-input"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by action, account, or department..."
              />
            </label>

            <select className="filter-select" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)}>
              {activityOptions.map((option) => (
                <option key={option} value={option}>{option === 'all' ? 'All Actions' : option}</option>
              ))}
            </select>

            <select className="filter-select" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>{option === 'all' ? 'All Departments' : option}</option>
              ))}
            </select>
          </div>

          <div className="filter-chips">
            {[
              ['all', 'All'],
              ['today', 'Today'],
              ['week', 'This Week'],
              ['mine', 'My Actions'],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`chip${quickFilter === value ? ' active' : ''}`}
                onClick={() => setQuickFilter(value as 'all' | 'today' | 'week' | 'mine')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="review-table-wrap">
          <table className="review-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Request / Record</th>
                <th>Account</th>
                <th>Role</th>
                <th>Department</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length ? paginatedLogs.map((entry) => (
                <tr key={entry.id}>
                  <td><span className={`status-badge ${toneClassMap[entry.tone]}`}>{entry.badge}</span></td>
                  <td className="rt-title">{entry.request_record}</td>
                  <td>{entry.account}</td>
                  <td>{formatRoleLabel(entry.role)}</td>
                  <td>{entry.department}</td>
                  <td>{formatRelativeTime(entry.timestamp)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="vpaa-activity-empty">No activity matched the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > ACTIVITY_PAGE_SIZE ? (
          <div className="vpaa-pagination">
            <div className="vpaa-pagination-actions">
              <button
                type="button"
                className="vpaa-pagination-arrow"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                &lt;
              </button>
              <span className="vpaa-pagination-page">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                className="vpaa-pagination-arrow"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </VpaaLayout>
  );
}
