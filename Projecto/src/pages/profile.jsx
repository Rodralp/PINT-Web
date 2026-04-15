import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import {
  Award,
  Flame,
  Clock3,
  Trophy,
  AlertCircle,
  Search,
  TimerReset,
  Sparkles,
  GraduationCap,
  ChevronsRight,
  ArrowRight,
  Crown,
  Edit3,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import '../css/Consultor/Dashboard_C.css';
import '../css/profile.css';

const timelineValues = [3, 2, 5, 4, 6, 3, 7, 5, 8, 4, 6, 9];

const buildTimelineData = (values, locale) => {
  const today = new Date();

  return values.map((value, index) => {
    const daysOffset = values.length - 1 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - daysOffset);

    return {
      value,
      label: date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' }),
    };
  });
};

const calculateVisibleTimelinePoints = (containerWidth, totalPoints) => {
  const minColumnWidth = 42;
  const maxPointsByWidth = Math.floor(containerWidth / minColumnWidth);
  return Math.max(4, Math.min(totalPoints, maxPointsByWidth));
};

const profileStats = [
  { titleKey: 'dashboard_stat_badges_title', value: '12', noteKey: 'dashboard_stat_badges_note', icon: Award, tone: 'gold' },
  { titleKey: 'dashboard_stat_streak_title', value: '4', noteKey: 'dashboard_stat_streak_note', icon: Flame, tone: 'fire' },
  { titleKey: 'dashboard_stat_requests_title', value: '5', noteKey: 'dashboard_stat_requests_note', icon: Clock3, tone: 'blue' },
  { titleKey: 'dashboard_stat_ranking_title', value: '#15', noteKey: 'dashboard_stat_ranking_note', icon: Crown, tone: 'rank' },
];

const skillsItems = [
  { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_specialist', accent: 'warning' },
  { title: 'JavaScript', subtitleKey: 'badge_level_senior', accent: 'yellow' },
  { title: 'React', subtitleKey: 'badge_level_intermediate', accent: 'info' },
];

const certificationsItems = [
  { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_knowledge_lead', accent: 'success' },
  { title: 'Cloud Architecture', subtitleKey: 'badge_level_specialist', accent: 'violet' },
  { title: 'C++ Mastery', subtitleKey: 'badge_level_senior', accent: 'amber' },
];

function Profile() {
  const { t, i18n } = useTranslation();
  const timelineChartRef = useRef(null);
  const locale = i18n.language?.startsWith('es') ? 'es-ES' : i18n.language?.startsWith('en') ? 'en-GB' : 'pt-PT';
  const timelineData = useMemo(() => buildTimelineData(timelineValues, locale), [locale]);
  const [visibleTimelinePoints, setVisibleTimelinePoints] = useState(timelineData.length);

  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  const loginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const userName = loginData?.nome || t('app_user_default');
  const userEmail = loginData?.email || 'user@example.com';

  const visibleTimelineData = timelineData.slice(-visibleTimelinePoints);
  const maxVisibleValue = Math.max(...visibleTimelineData.map(({ value }) => value));
  const yAxisStep = Math.max(1, Math.ceil(maxVisibleValue / 3));
  const chartMaxValue = yAxisStep * 3;
  const yAxisTicks = [0, 1, 2, 3].map((multiplier) => yAxisStep * multiplier);

  return (
    <Layout>
      <div className="dashboard-consultor-page">
        <div className="dashboard-consultor-header">
          <h1>{t('profile_title')}</h1>
        </div>

        <section className="dashboard-card dashboard-profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <img src={`https://i.pravatar.cc/150?u=${userName}`} alt="Profile Avatar" />
            </div>
            <div className="profile-info">
              <h2>{userName}</h2>
              <p className="profile-role">{t('profile_type')}</p>
              <div className="profile-meta">
                <span><Mail size={16} /> {userEmail}</span>
                <span><MapPin size={16} /> Portugal</span>
                <span><Calendar size={16} /> Joined 2023</span>
              </div>
            </div>
            <button className="profile-edit-btn">
              <Edit3 size={18} /> {t('profile_edit')}
            </button>
          </div>
        </section>

        <div className="dashboard-consultor-grid">
          <div className="dashboard-stats-grid">
            {profileStats.map(({ titleKey, value, noteKey, icon: Icon, tone }) => (
              <section key={titleKey} className={`dashboard-card dashboard-stat-card tone-${tone}`}>
                <div className="dashboard-card-title">{t(titleKey)}</div>
                <div className="dashboard-stat-body">
                  <span className="dashboard-stat-icon">
                    <Icon size={36} strokeWidth={2} />
                  </span>
                  <strong>{value}</strong>
                </div>
                <div className="dashboard-stat-note">{t(noteKey)}</div>
              </section>
            ))}
          </div>

          <section className="dashboard-card dashboard-timeline-card">
            <div className="dashboard-card-title">{t('profile_activity_timeline')}</div>
            <div className="timeline-chart-shell">
              <div className="timeline-axis" aria-hidden="true">
                {yAxisTicks.slice().reverse().map((tick) => (
                  <span key={tick} className="timeline-axis-label">
                    {tick}
                  </span>
                ))}
              </div>

              <div
                ref={timelineChartRef}
                className="timeline-chart"
                aria-label={t('profile_activity_timeline')}
                style={{ gridTemplateColumns: `repeat(${visibleTimelineData.length}, minmax(0, 1fr))` }}
              >
                <div className="timeline-grid-lines" aria-hidden="true">
                  {yAxisTicks.map((tick) => (
                    <span
                      key={tick}
                      className="timeline-grid-line"
                      style={{ bottom: `${(tick / chartMaxValue) * 100}%` }}
                    />
                  ))}
                </div>

                {visibleTimelineData.map(({ value, label }) => (
                  <div key={label} className="timeline-column">
                    <div className="timeline-bar-track">
                      <div
                        className="timeline-bar"
                        style={{ height: `${(value / chartMaxValue) * 100}%` }}
                      />
                    </div>
                    <span className="timeline-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dashboard-card dashboard-panel-card">
            <div className="dashboard-panel-header">
              <h2>{t('profile_skills')}</h2>
              <a href="#ver-todos-skills" onClick={(event) => event.preventDefault()}>
                {t('dashboard_view_all')} <ArrowRight size={16} />
              </a>
            </div>

            <div className="dashboard-list">
              {skillsItems.map(({ title, subtitleKey, accent }) => (
                <article key={`${title}-${subtitleKey}`} className="dashboard-list-item">
                  <div className={`dashboard-list-badge accent-${accent}`}>
                    <Award size={18} strokeWidth={2} />
                  </div>
                  <div className="dashboard-list-content">
                    <strong>{title}</strong>
                    <span>{t(subtitleKey)}</span>
                  </div>
                  <ChevronsRight className="dashboard-item-chevron" size={18} />
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-card dashboard-panel-card">
            <div className="dashboard-panel-header">
              <h2>{t('profile_certifications')}</h2>
              <a href="#ver-todos-certificacoes" onClick={(event) => event.preventDefault()}>
                {t('dashboard_view_all')} <ArrowRight size={16} />
              </a>
            </div>

            <div className="dashboard-list">
              {certificationsItems.map(({ title, subtitleKey, accent }) => (
                <article key={`${title}-${subtitleKey}`} className="dashboard-list-item">
                  <div className={`dashboard-list-badge accent-${accent}`}>
                    <GraduationCap size={18} strokeWidth={2} />
                  </div>
                  <div className="dashboard-list-content">
                    <strong>{title}</strong>
                    <span>{t(subtitleKey)}</span>
                  </div>
                  <ChevronsRight className="dashboard-item-chevron" size={18} />
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;