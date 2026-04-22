import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import { fetchCatalogBadges, fetchRankingConsultores } from './services/consultorService';
import './css/GaleriaPublica.css';

const fallbackBadges = [
  { id: 'cloud-junior', area: 'Cloud Architecture', levelLabel: 'Junior', points: 100, badgeImage: '/badges/J%C3%BAnior.png' },
  { id: 'cloud-intermediate', area: 'Cloud Architecture', levelLabel: 'Intermedio', points: 150, badgeImage: '/badges/Interm%C3%A9dio.png' },
  { id: 'cloud-senior', area: 'Cloud Architecture', levelLabel: 'Senior', points: 200, badgeImage: '/badges/S%C3%A9nior.png' },
  { id: 'lowcode-specialist', area: 'LowCode (Outsystems)', levelLabel: 'Especialista', points: 250, badgeImage: '/badges/Especialista.png' },
  { id: 'lowcode-lead', area: 'LowCode (Outsystems)', levelLabel: 'Lider de Conhecimento', points: 300, badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png' },
];

const fallbackConsultores = [
  { id: 1, name: 'Joao Gomes', email: 'joaogomes1234@softinsa.pt', serviceLine: 'Cloud', points: 2450, badges: 12 },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@softinsa.pt', serviceLine: 'Data & AI', points: 2200, badges: 10 },
  { id: 3, name: 'Pedro Mendes', email: 'pedro.mendes@softinsa.pt', serviceLine: 'Cloud', points: 1950, badges: 9 },
  { id: 4, name: 'Ana Costa', email: 'ana.costa@softinsa.pt', serviceLine: 'LowCode', points: 1700, badges: 8 },
  { id: 5, name: 'Carlos Ferreira', email: 'carlos.ferreira@softinsa.pt', serviceLine: 'Cybersecurity', points: 1500, badges: 7 },
  { id: 6, name: 'Rita Oliveira', email: 'rita.oliveira@softinsa.pt', serviceLine: 'Data & AI', points: 1450, badges: 7 },
];

const resolveBadgeLevel = (item) => {
  const byKey = {
    badge_level_junior: 'Junior',
    badge_level_intermediate: 'Intermedio',
    badge_level_senior: 'Senior',
    badge_level_specialist: 'Especialista',
    badge_level_knowledge_lead: 'Lider de Conhecimento',
  };

  return item.levelLabel || byKey[item.levelKey] || 'Intermedio';
};

const normalizeBadges = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackBadges;
  }

  return items.map((item, index) => ({
    id: item.id || `${item.area || 'badge'}-${index}`,
    area: item.area || 'Area Tecnica',
    levelLabel: resolveBadgeLevel(item),
    points: Number(item.points) || 0,
    badgeImage: item.badgeImage || '/badges/Interm%C3%A9dio.png',
  }));
};

const normalizeConsultores = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackConsultores;
  }

  return items.map((item, index) => ({
    id: item.id || index + 1,
    name: item.name || 'Consultor',
    email: item.email || 'sem-email@softinsa.pt',
    serviceLine: item.serviceLine || 'Service Line',
    points: Number(item.points) || 0,
    badges: Number(item.badges) || 0,
  }));
};

function GaleriaPublica() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('badges');
  const [badges, setBadges] = useState(fallbackBadges);
  const [consultores, setConsultores] = useState(fallbackConsultores);

  useEffect(() => {
    let isMounted = true;

    const loadPublicData = async () => {
      try {
        const [badgesData, consultoresData] = await Promise.all([
          fetchCatalogBadges(),
          fetchRankingConsultores(),
        ]);

        if (!isMounted) {
          return;
        }

        setBadges(normalizeBadges(badgesData));
        setConsultores(normalizeConsultores(consultoresData));
      } catch {
        if (!isMounted) {
          return;
        }

        setBadges(fallbackBadges);
        setConsultores(fallbackConsultores);
      }
    };

    loadPublicData();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedConsultores = useMemo(
    () => [...consultores].sort((a, b) => b.points - a.points),
    [consultores],
  );

  return (
    <div className="gp-root">
      <Navbar />

      <main className="gp-main">
        <section className="gp-shell">
          <header className="gp-header">
            <h1>{t('public_gallery_title')}</h1>
            <p>{t('public_gallery_subtitle')}</p>

            <div className="gp-tabs" role="tablist" aria-label={t('public_gallery_tab_aria')}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'badges'}
                className={`gp-tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
                onClick={() => setActiveTab('badges')}
              >
                {t('public_gallery_badges')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'consultores'}
                className={`gp-tab-btn ${activeTab === 'consultores' ? 'active' : ''}`}
                onClick={() => setActiveTab('consultores')}
              >
                {t('public_gallery_consultores')}
              </button>
            </div>
          </header>

          {activeTab === 'badges' ? (
            <section className="gp-grid" aria-label={t('public_gallery_badges')}>
              {badges.map((badge) => (
                <article key={badge.id} className="gp-card gp-badge-card">
                  <div className="gp-badge-image-wrap">
                    <img src={badge.badgeImage} alt={badge.levelLabel} className="gp-badge-image" />
                  </div>
                  <h2>{badge.area}</h2>
                  <p>{`${t('public_gallery_level')}: ${badge.levelLabel}`}</p>
                  <span>{`${badge.points} pts`}</span>
                </article>
              ))}
            </section>
          ) : (
            <section className="gp-grid" aria-label={t('public_gallery_consultores')}>
              {sortedConsultores.map((consultor, index) => (
                <article key={consultor.id} className="gp-card gp-consultor-card">
                  <strong className="gp-rank">#{index + 1}</strong>
                  <h2>{consultor.name}</h2>
                  <p>{consultor.email}</p>
                  <p>{consultor.serviceLine}</p>
                  <div className="gp-consultor-stats">
                    <span>{`${consultor.points} pts`}</span>
                    <span>{`${consultor.badges} badges`}</span>
                  </div>
                </article>
              ))}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default GaleriaPublica;