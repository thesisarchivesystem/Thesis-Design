import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VpaaLayout from '../../components/vpaa/VpaaLayout';
import { vpaaProfileService } from '../../services/vpaaProfileService';

type ProfileForm = {
  employeeId: string;
  email: string;
  office: string;
  areaOfOversight: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  officeHours: string;
};

const emptyProfile: ProfileForm = {
  employeeId: '',
  email: '',
  office: '',
  areaOfOversight: '',
  firstName: '',
  lastName: '',
  fullName: '',
  role: '',
  officeHours: '',
};

const formatUpdatedLabel = (date: Date) =>
  `Last updated: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

export default function VpaaProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [loadedProfile, setLoadedProfile] = useState<ProfileForm>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Last updated: February 9, 2026');
  const [savedMessage, setSavedMessage] = useState('');
  const [error, setError] = useState('');

  const initials = useMemo(
    () => (form.fullName || `${form.firstName} ${form.lastName}` || user?.name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
    [form.fullName, user?.name],
  );

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (savedMessage) setSavedMessage('');
  };

  useEffect(() => {
    let mounted = true;

    void vpaaProfileService.getProfile()
      .then((profile) => {
        if (!mounted) return;
        const nextProfile = {
          employeeId: profile.employee_id,
          email: profile.email || '',
          office: profile.office || '',
          areaOfOversight: profile.area_of_oversight || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          fullName: profile.full_name || '',
          role: profile.role_title || '',
          officeHours: profile.office_hours || '',
        };
        setForm(nextProfile);
        setLoadedProfile(nextProfile);
        setLastUpdated(profile.updated_at ? formatUpdatedLabel(new Date(profile.updated_at)) : 'Last updated: February 9, 2026');
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load VPAA profile.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage('');
    setError('');

    try {
      const profile = await vpaaProfileService.updateProfile({
        email: form.email,
        office: form.office,
        area_of_oversight: form.areaOfOversight,
        first_name: form.firstName,
        last_name: form.lastName,
        role_title: form.role,
        office_hours: form.officeHours,
      });

      const nextFullName = `${form.firstName} ${form.lastName}`.trim();
      const nextProfile = {
        ...form,
        fullName: nextFullName,
      };

      setForm(nextProfile);
      setLoadedProfile(nextProfile);
      updateUser({
        first_name: form.firstName,
        last_name: form.lastName,
        name: nextFullName || user?.name || 'VPAA User',
        email: form.email,
      });
      setLastUpdated(profile.updated_at ? formatUpdatedLabel(new Date(profile.updated_at)) : formatUpdatedLabel(new Date()));
      setSavedMessage('Profile changes were saved!.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save VPAA profile.');
    }
  };

  const handleReset = () => {
    setForm(loadedProfile);
    setSavedMessage('');
  };

  return (
    <VpaaLayout
      title="VPAA Profile"
      description="Review executive account details, oversight assignments, and profile access settings for the Office of the VPAA."
    >
      <div className="vpaa-profile-page-shell">
        {error ? <div className="vpaa-banner-error">{error}</div> : null}
        {savedMessage ? <div className="vpaa-banner-success">{savedMessage}</div> : null}

        {isLoading ? <div className="vpaa-card vpaa-profile-loading">Loading VPAA profile...</div> : null}

        {!isLoading ? (
        <div className="vpaa-profile-page-grid">
          <section className="vpaa-profile-page-panel vpaa-profile-summary-card">
            <div className="vpaa-profile-hero-avatar avatar-tone-vpaa">{initials || 'VP'}</div>
            <div>
              <div className="vpaa-profile-display-name">{form.fullName}</div>
              <div className="vpaa-profile-display-role">{form.role}</div>
            </div>
            <div className="vpaa-profile-display-badge">VPAA Account</div>
            <div className="vpaa-profile-display-notice">
              Editing is enabled for VPAA profiles and administrative records.
            </div>
          </section>

          <form className="vpaa-profile-page-panel vpaa-profile-details-card" onSubmit={handleSave}>
            <div className="vpaa-profile-section-block">
              <div className="vpaa-profile-section-heading">Account Information</div>
              <div className="vpaa-profile-form-grid">
                <label className="vpaa-profile-form-field">
                  <span>Employee ID</span>
                  <input value={form.employeeId} readOnly />
                </label>
                <label className="vpaa-profile-form-field">
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} />
                </label>
                <label className="vpaa-profile-form-field">
                  <span>Office</span>
                  <input value={form.office} onChange={(event) => handleChange('office', event.target.value)} />
                </label>
                <label className="vpaa-profile-form-field">
                  <span>Area of Oversight</span>
                  <input value={form.areaOfOversight} onChange={(event) => handleChange('areaOfOversight', event.target.value)} />
                </label>
              </div>
            </div>

            <div className="vpaa-profile-section-block">
              <div className="vpaa-profile-section-heading">Administrative Details</div>
              <div className="vpaa-profile-form-grid">
                <label className="vpaa-profile-form-field">
                  <span>First Name</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => {
                      const firstName = event.target.value;
                      setForm((current) => ({
                        ...current,
                        firstName,
                        fullName: `${firstName} ${current.lastName}`.trim(),
                      }));
                    }}
                  />
                </label>
                <label className="vpaa-profile-form-field">
                  <span>Last Name</span>
                  <input
                    value={form.lastName}
                    onChange={(event) => {
                      const lastName = event.target.value;
                      setForm((current) => ({
                        ...current,
                        lastName,
                        fullName: `${current.firstName} ${lastName}`.trim(),
                      }));
                    }}
                  />
                </label>
                <label className="vpaa-profile-form-field">
                  <span>Role</span>
                  <input value={form.role} onChange={(event) => handleChange('role', event.target.value)} />
                </label>
                <label className="vpaa-profile-form-field">
                  <span>Office Hours</span>
                  <input value={form.officeHours} onChange={(event) => handleChange('officeHours', event.target.value)} />
                </label>
              </div>
            </div>

            <div className="vpaa-profile-section-block">
              <div className="vpaa-profile-section-heading">Access and Permissions</div>
              <div className="vpaa-profile-meta-row">
                <span>Profile status: Editable</span>
                <span>Editable by: VPAA</span>
                <span>{lastUpdated}</span>
              </div>
            </div>

            <div className="vpaa-profile-form-actions">
              <button type="submit" className="vpaa-profile-page-btn primary">Save Changes</button>
              <button type="button" className="vpaa-profile-page-btn secondary" onClick={handleReset}>Reset</button>
            </div>
          </form>
        </div>
        ) : null}
      </div>
    </VpaaLayout>
  );
}
