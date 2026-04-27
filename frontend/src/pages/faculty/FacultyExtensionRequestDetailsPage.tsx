import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, FileText, Send, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../../components/faculty/FacultyLayout';
import { extensionRequestService } from '../../services/extensionRequestService';
import type { FacultyExtensionRequest } from '../../types/faculty-extension-request.types';

const formatDate = (value?: string | null) => {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatStatus = (status?: string) => {
  if (!status) return 'Pending';

  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

type LocationState = {
  extensionRequest?: FacultyExtensionRequest;
};

export default function FacultyExtensionRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const [request, setRequest] = useState<FacultyExtensionRequest | null>(locationState?.extensionRequest ?? null);
  const [loading, setLoading] = useState(() => !locationState?.extensionRequest);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Extension request not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    void extensionRequestService.getForFaculty(id)
      .then((data) => {
        setRequest(data);
      })
      .catch((err) => {
        setRequest(null);
        setError(err instanceof Error ? err.message : 'Unable to load extension request details right now.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const currentRevisionDueDate = useMemo(
    () => formatDate(request?.thesis?.revision_due_at),
    [request?.thesis?.revision_due_at],
  );

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!request || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await extensionRequestService.decide(request.id, status);
      navigate('/faculty/manage-thesis/review', {
        replace: true,
        state: {
          extensionRequestId: request.id,
          successMessage: status === 'approved'
            ? 'Extension request approved successfully.'
            : 'Extension request rejected successfully.',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this extension request right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FacultyLayout
      title="Extension Request"
      description="Review the student request and decide whether to extend the revision deadline."
    >
      <div className="faculty-submission-details-shell">
        <div className="faculty-submission-details-topbar">
          <Link to="/faculty/manage-thesis/review" className="faculty-submission-back-link">
            <ArrowLeft size={16} />
            <span>Back to Review Queue</span>
          </Link>
        </div>

        {error ? <div className="vpaa-banner-error">{error}</div> : null}

        {loading ? (
          <div className="vpaa-card faculty-submission-details-loading">Loading extension request...</div>
        ) : !request ? (
          <div className="vpaa-card faculty-submission-details-loading">No extension request details were found.</div>
        ) : (
          <div className="faculty-submission-details-grid">
            <section className="vpaa-card faculty-submission-hero-card">
              <div className="faculty-submission-hero-header">
                <div className="faculty-submission-title-block">
                  <span className="faculty-submission-eyebrow">Student Extension Request</span>
                  <h2>{request.thesis?.title || 'Untitled thesis'}</h2>
                  <p className="faculty-submission-hero-copy">
                    Review the requested revision extension and decide whether to update the student&apos;s deadline.
                  </p>
                </div>
                <span className={`faculty-submission-status-pill status-${request.status}`}>
                  {formatStatus(request.status)}
                </span>
              </div>

              <div className="faculty-submission-meta-chips">
                <span><UserRound size={14} /> {request.student?.name || 'Student'}</span>
                <span><CalendarDays size={14} /> Current Due {currentRevisionDueDate}</span>
                <span><CalendarDays size={14} /> Requested {formatDate(request.requested_deadline)}</span>
                <span><FileText size={14} /> Thesis Status {formatStatus(request.thesis?.status)}</span>
              </div>

              <div className="faculty-submission-metrics">
                <article>
                  <span>Student Email</span>
                  <strong>{request.student?.email || 'Not available'}</strong>
                </article>
                <article>
                  <span>Request Status</span>
                  <strong>{formatStatus(request.status)}</strong>
                </article>
                <article>
                  <span>Submitted On</span>
                  <strong>{formatDate(request.created_at)}</strong>
                </article>
              </div>

              <div className="faculty-submission-section">
                <h3>Reason for Extension</h3>
                <p>{request.reason}</p>
              </div>
            </section>

            <aside className="faculty-submission-side-panel">
              <section className="vpaa-card faculty-submission-manuscript-card">
                <div className="faculty-submission-manuscript-header">
                  <div>
                    <h3>Decision</h3>
                    <p className="faculty-submission-manuscript-copy">
                      Approving this request updates the thesis revision due date to the student&apos;s requested deadline.
                    </p>
                  </div>
                  <span className="faculty-submission-manuscript-icon">
                    <Send size={20} />
                  </span>
                </div>

                <div className="faculty-submission-review-panel">
                  <div className="faculty-submission-review-head">
                    <div>
                      <span className="faculty-submission-eyebrow">Faculty Decision</span>
                      <h3>Approve or Reject</h3>
                    </div>
                  </div>

                  <div className="student-upload-note">
                    Current revision due date: <strong>{currentRevisionDueDate}</strong><br />
                    Requested new deadline: <strong>{formatDate(request.requested_deadline)}</strong>
                  </div>

                  <div className="faculty-submission-review-actions">
                    <button
                      type="button"
                      className="faculty-submission-review-button reject"
                      onClick={() => void handleDecision('rejected')}
                      disabled={submitting || request.status !== 'pending'}
                    >
                      {submitting ? 'Saving...' : 'Reject Request'}
                    </button>
                    <button
                      type="button"
                      className="faculty-submission-review-button approve"
                      onClick={() => void handleDecision('approved')}
                      disabled={submitting || request.status !== 'pending'}
                    >
                      {submitting ? 'Saving...' : 'Approve Request'}
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
