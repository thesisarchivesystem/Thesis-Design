import { Building2, CalendarDays, Cpu } from 'lucide-react';

type ThesisCoverCategory = {
  id?: string;
  name: string;
  slug?: string;
};

type ThesisArchiveCoverProps = {
  title: string;
  college?: string | null;
  department?: string | null;
  author?: string | null;
  authors?: string[];
  year?: string | number | null;
  categories?: ThesisCoverCategory[];
  className?: string;
  compact?: boolean;
};

const formatAuthorLine = (author?: string | null, authors?: string[]) => {
  const authorList = (authors?.filter(Boolean).length ? authors : (author ?? '').split(','))
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!authorList.length) return 'Unknown author';
  if (authorList.length === 1) return authorList[0];
  return `${authorList[0]}, ${authorList[1]}${authorList.length > 2 ? ' et al.' : ''}`;
};

export default function ThesisArchiveCover({
  title,
  college,
  department,
  author,
  authors,
  year,
  categories = [],
  className = '',
  compact = false,
}: ThesisArchiveCoverProps) {
  const visibleCategories = categories.filter((category) => category?.name).slice(0, 2);
  const authorLine = formatAuthorLine(author, authors);
  const displayCollege = college || department || 'Archive Collection';

  return (
    <div className={`thesis-archive-cover${compact ? ' compact' : ''} ${className}`.trim()}>
      <div className="thesis-archive-cover-frame">
        <div className="thesis-archive-cover-inner">
          <div className="thesis-archive-cover-header">
            <div className="thesis-archive-cover-school">TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES</div>
            <div className="thesis-archive-cover-college">{displayCollege}</div>
          </div>

          <div className="thesis-archive-cover-divider" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          <div className="thesis-archive-cover-title">{title}</div>

          <div className="thesis-archive-cover-divider thesis-archive-cover-divider-bottom" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>

          <div className="thesis-archive-cover-author">{authorLine}</div>

          <div className="thesis-archive-cover-year">
            <CalendarDays size={14} />
            <span>{year || 'N/A'}</span>
          </div>

          <div className="thesis-archive-cover-wave" aria-hidden="true" />

          <div className="thesis-archive-cover-tags">
            {visibleCategories.map((category) => (
              <span key={category.id ?? category.name} className="thesis-archive-cover-tag">
                <Cpu size={14} />
                <span>{category.name}</span>
              </span>
            ))}
            <span className="thesis-archive-cover-tag">
              <Building2 size={14} />
              <span>{department || 'No department'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
