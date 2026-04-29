import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
  Calendar,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';
import { fetchProfileData } from '../services/consultorService';
import '../css/Consultor/Dashboard_C.css';
import '../css/profile.css';

const defaultTimelineValues = [3, 2, 5, 4, 6, 3, 7, 5, 8, 4, 6, 9];

const calculateVisibleTimelinePoints = (containerWidth, totalPoints) => {
  const minColumnWidth = 42;
  const maxPointsByWidth = Math.floor(containerWidth / minColumnWidth);
  return Math.max(4, Math.min(totalPoints, maxPointsByWidth));
};

const statIconMap = {
  award: Award,
  flame: Flame,
  clock: Clock3,
  crown: Crown,
};

const defaultProfileStats = [
  { titleKey: 'dashboard_stat_badges_title', value: '12', noteKey: 'dashboard_stat_badges_note', icon: Award, tone: 'gold' },
  { titleKey: 'dashboard_stat_streak_title', value: '4', noteKey: 'dashboard_stat_streak_note', icon: Flame, tone: 'fire' },
  { titleKey: 'dashboard_stat_requests_title', value: '5', noteKey: 'dashboard_stat_requests_note', icon: Clock3, tone: 'blue' },
  { titleKey: 'dashboard_stat_ranking_title', value: '#15', noteKey: 'dashboard_stat_ranking_note', icon: Crown, tone: 'rank' },
];

const defaultSkillsItems = [
  { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_specialist', accent: 'warning' },
  { title: 'JavaScript', subtitleKey: 'badge_level_senior', accent: 'yellow' },
  { title: 'React', subtitleKey: 'badge_level_intermediate', accent: 'info' },
];

const defaultCertificationsItems = [
  { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_knowledge_lead', accent: 'success' },
  { title: 'Cloud Architecture', subtitleKey: 'badge_level_specialist', accent: 'violet' },
  { title: 'C++ Mastery', subtitleKey: 'badge_level_senior', accent: 'amber' },
];

const defaultActivityItems = [
  { type: 'rank', description: 'Rose to rank #14', date: '5 days ago', icon: TrendingUp, color: 'yellow' },
  { type: 'skill', description: 'Added skill: JavaScript', date: '1 week ago', icon: Star, color: 'success' },
  { type: 'achievement', description: 'Completed 10 skill assessments', date: '2 weeks ago', icon: Trophy, color: 'violet' },
  { type: 'badge', description: 'Earned badge: React Senior', date: '3 weeks ago', icon: Award, color: 'info' },
  { type: 'streak', description: 'Achieved 7-day streak', date: '1 month ago', icon: Zap, color: 'amber' },
];

function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profileStats, setProfileStats] = useState(defaultProfileStats);
  const [skillsItems, setSkillsItems] = useState(defaultSkillsItems);
  const [certificationsItems, setCertificationsItems] = useState(defaultCertificationsItems);
  const [activityItems, setActivityItems] = useState(defaultActivityItems);
  const [profileLocation, setProfileLocation] = useState('Portugal');
  const [profileJoined, setProfileJoined] = useState('2023');
  const [statusMessage, setStatusMessage] = useState('');
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  const loginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const userName = loginData?.nome || t('app_user_default');
  const userEmail = loginData?.email || 'user@example.com';

  const initialSeed = String(loginData?.email || loginData?.nome || userName || '').toLowerCase().replace('@', '.');
  const initialAvatar = loginData?.avatar || `https://i.pravatar.cc/120?u=${encodeURIComponent(initialSeed)}`;

  const [profileAvatar, setProfileAvatar] = useState(initialAvatar);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await fetchProfileData();
        if (!isMounted) {
          return;
        }

        if (Array.isArray(data.stats) && data.stats.length > 0) {
          const mappedStats = data.stats.map((item) => ({
            ...item,
            icon: statIconMap[item.iconKey] || Award,
          }));
          setProfileStats(mappedStats);
        }

        if (Array.isArray(data.skillsItems) && data.skillsItems.length > 0) {
          setSkillsItems(data.skillsItems);
        }

        if (Array.isArray(data.certificationsItems) && data.certificationsItems.length > 0) {
          setCertificationsItems(data.certificationsItems);
        }

        if (Array.isArray(data.activityItems) && data.activityItems.length > 0) {
          setActivityItems(data.activityItems);
        }

        if (typeof data.location === 'string' && data.location) {
          setProfileLocation(data.location);
        }

        if (typeof data.joined === 'string' && data.joined) {
          setProfileJoined(data.joined);
        }

        if (typeof data.avatar === 'string' && data.avatar) {
          setProfileAvatar(data.avatar);
        }

        setStatusMessage('');
      } catch {
        if (isMounted) {
          setStatusMessage('');
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      <div className="dashboard-consultor-page">
        <div className="dashboard-consultor-header">
          <h1>{t('profile_title')}</h1>
        </div>

        {statusMessage && (
          <div className="alert alert-warning py-2" role="status">
            {statusMessage}
          </div>
        )}

        <section className="dashboard-card dashboard-profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <img src={profileAvatar} alt="Profile Avatar" />
            </div>
            <div className="profile-info">
              <h2>{userName}</h2>
              <p className="profile-role">{t('profile_type')}</p>
              <div className="profile-meta">
                <span><Mail size={16} /> {userEmail}</span>
                <span><MapPin size={16} /> {profileLocation}</span>
                <span><Calendar size={16} /> Joined {profileJoined}</span>
              </div>
            </div>
            <div className="profile-btn-space">
              <button className="profile-home-btn" onClick={() => navigate('/')}>
                {t('profile_pub')}
              </button>
              <button className="profile-edit-btn">
                <Edit3 size={18} /> {t('profile_edit')}
              </button>
            </div>
          </div>
        </section>

        <div className="dashboard-consultor-grid">
          <div className="dashboard-stats-grid">
            {profileStats.map((item) => {
              const StatIcon = item.icon;

              return (
                <section key={item.titleKey} className={`dashboard-card dashboard-stat-card tone-${item.tone}`}>
                  <div className="dashboard-card-title">{t(item.titleKey)}</div>
                  <div className="dashboard-stat-body">
                    <span className="dashboard-stat-icon">
                      <StatIcon size={36} strokeWidth={2} />
                    </span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="dashboard-stat-note">{t(item.noteKey)}</div>
                </section>
              );
            })}
          </div>

          <section className="dashboard-card dashboard-panel-card">
            <div className="dashboard-panel-header">
              <h2>{t('profile_activity_title', 'Recent Activity')}</h2>
              <a href="#ver-todos-activity" onClick={(event) => event.preventDefault()}>
                {t('dashboard_view_all')} <ArrowRight size={16} />
              </a>
            </div>

            <div className="dashboard-list-compact">
              {activityItems.map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={index} className="dashboard-list-item-compact">
                    <div className={`dashboard-list-badge accent-${activity.color}`}>
                      <ActivityIcon size={18} strokeWidth={2} />
                    </div>
                    <div className="dashboard-list-content">
                      <strong>{activity.description}</strong>
                      <span>{activity.date}</span>
                    </div>
                  </div>
                );
              })}
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