import { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, Award, Users, FileCheck2, FileText, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/TalentManager/Dashboard_TM.css';
import '../../css/ServiceLineLeader/Dashboard_SLL.css';

const badgesTimelineValues = [3, 4, 3, 6, 4, 8, 6, 7, 5, 8, 8, 10];
const novosConsultoresValues = [2, 5, 4, 6, 3, 7, 5, 8, 4, 6];

const topConsultores = [
  {
    id: 1,
    name: 'João Gomes',
    email: 'joaogomes1234@softinsa.pt',
    icon: Trophy,
    points: 2450,
    badges: 17,
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@softinsa.pt',
    icon: Award,
    points: 2200,
    badges: 14,
  },
  {
    id: 3,
    name: 'Pedro Mendes',
    email: 'pedro.mendes@softinsa.pt',
    icon: Users,
    points: 1950,
    badges: 9,
  },
  {
    id: 4,
    name: 'João Gomes',
    email: 'joaogomes1234@softinsa.pt',
    icon: Trophy,
    points: 1900,
    badges: 11,
  },
];

const recentActivities = [
  {
    id: 1,
    title: 'Visualizado progresso de 5 consultores',
    timeframe: 'Há 1 hora',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Aprovado pedido de badge',
    timeframe: 'Há 3 horas',
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: 'Gerado relatório de badges da área Hybrid Cloud',
    timeframe: 'Ontem',
    icon: Trophy,
  },
  {
    id: 4,
    title: 'Consultado ranking de consultores da Service Line',
    timeframe: 'Há 2 dias',
    icon: Users,
  },
];

const buildDailyTimelineData = (values, labelFormat = 'day') => {
  const today = new Date();

  return values.map((value, index) => {
    const daysOffset = values.length - 1 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - daysOffset);

    const label =
      labelFormat === 'day-month'
        ? date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
        : date.toLocaleDateString('pt-PT', { day: '2-digit' });

    return {
      value,
      label,
    };
  });
};

const calculateVisibleTimelinePoints = (containerWidth, totalPoints) => {
  const minColumnWidth = 42;
  const maxPointsByWidth = Math.floor(containerWidth / minColumnWidth);
  return Math.max(4, Math.min(totalPoints, maxPointsByWidth));
};

const buildChartScale = (data) => {
  const maxVisibleValue = Math.max(...data.map(({ value }) => value));
  const yAxisStep = Math.max(1, Math.ceil(maxVisibleValue / 3));
  const chartMaxValue = yAxisStep * 3;
  const yAxisTicks = [0, 1, 2, 3].map((multiplier) => yAxisStep * multiplier);

  return { chartMaxValue, yAxisTicks };
};

function DashboardSLL() {
  const badgesChartRef = useRef(null);
  const novosConsultoresChartRef = useRef(null);
  const badgesTimelineData = useMemo(() => buildDailyTimelineData(badgesTimelineValues, 'day-month'), []);
  const novosConsultoresData = useMemo(() => buildDailyTimelineData(novosConsultoresValues, 'day-month'), []);
  const [visibleBadgesPoints, setVisibleBadgesPoints] = useState(badgesTimelineData.length);
  const [visibleNovosConsultoresPoints, setVisibleNovosConsultoresPoints] = useState(novosConsultoresData.length);

  useEffect(() => {
    const observers = [];

    if (badgesChartRef.current) {
      const updateBadgesPoints = (width) => {
        setVisibleBadgesPoints(calculateVisibleTimelinePoints(width, badgesTimelineData.length));
      };

      const badgesObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          updateBadgesPoints(entry.contentRect.width);
        }
      });

      badgesObserver.observe(badgesChartRef.current);
      updateBadgesPoints(badgesChartRef.current.clientWidth);
      observers.push(badgesObserver);
    }

    if (novosConsultoresChartRef.current) {
      const updateNovosConsultoresPoints = (width) => {
        setVisibleNovosConsultoresPoints(calculateVisibleTimelinePoints(width, novosConsultoresData.length));
      };

      const novosConsultoresObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          updateNovosConsultoresPoints(entry.contentRect.width);
        }
      });

      novosConsultoresObserver.observe(novosConsultoresChartRef.current);
      updateNovosConsultoresPoints(novosConsultoresChartRef.current.clientWidth);
      observers.push(novosConsultoresObserver);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [badgesTimelineData, novosConsultoresData]);

  const visibleBadgesData = badgesTimelineData.slice(-visibleBadgesPoints);
  const visibleNovosConsultoresData = novosConsultoresData.slice(-visibleNovosConsultoresPoints);
  const badgesScale = buildChartScale(visibleBadgesData);
  const novosConsultoresScale = buildChartScale(visibleNovosConsultoresData);

  const badgesLinePoints = visibleBadgesData.map(({ value }, index) => {
    const xPercentage =
      visibleBadgesData.length === 1 ? 50 : ((index + 0.5) / visibleBadgesData.length) * 100;
    const yPercentage = 100 - (value / badgesScale.chartMaxValue) * 100;

    return { xPercentage, yPercentage };
  });

  return (
    <Layout>
      <div className="dashboard-tm dashboard-sll-theme">
        <header className="dashboard-tm-header">
          <h1>Dashboard Service Line Leader</h1>
        </header>

        <div className="dashboard-tm-content">
          <div className="row g-3 align-items-stretch metrics-container">
            <div className="col-12 col-lg-6 col-xl-5 d-flex tm-top-chart-col">
              <section className="metric-card metric-card-large h-100 w-100">
                <div className="metric-card-title">Número de Pedidos de Badges</div>
                <div className="tm-chart-shell">
                  <div className="tm-chart-axis" aria-hidden="true">
                    {badgesScale.yAxisTicks.slice().reverse().map((tick) => (
                      <span key={tick} className="tm-chart-axis-label">{tick}</span>
                    ))}
                  </div>

                  <div
                    ref={badgesChartRef}
                    className="tm-chart tm-line-chart-grid"
                    style={{ gridTemplateColumns: `repeat(${visibleBadgesData.length}, minmax(0, 1fr))` }}
                  >
                    <div className="tm-chart-grid-lines" aria-hidden="true">
                      {badgesScale.yAxisTicks.map((tick) => (
                        <span
                          key={tick}
                          className="tm-chart-grid-line"
                          style={{ bottom: `${(tick / badgesScale.chartMaxValue) * 100}%` }}
                        />
                      ))}
                    </div>

                    <svg
                      className="tm-line-path-svg"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <polyline
                        points={badgesLinePoints.map((_, index) => {
                          const xPoint = badgesLinePoints[index].xPercentage;
                          const yPoint = badgesLinePoints[index].yPercentage;
                          return `${xPoint},${yPoint}`;
                        }).join(' ')}
                        className="tm-line-polyline"
                      />
                    </svg>

                    {visibleBadgesData.map(({ label }, index) => (
                      <div key={`${label}-${index}`} className="tm-chart-column">
                        <div className="tm-line-value-track" aria-hidden="true" />
                        <span className="tm-chart-label tm-line-day-label">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="col-12 col-lg-6 col-xl-2 d-flex tm-top-grid-col">
              <div className="tm-stats-grid w-100">
                <section className="metric-card metric-card-stat">
                  <div className="metric-card-title">Utilizadores Online</div>
                  <div className="metric-stat-body">
                    <span className="metric-stat-icon">
                      <Users size={36} strokeWidth={2} />
                    </span>
                    <strong>1302</strong>
                  </div>
                  <div className="metric-note">Na Plataforma</div>
                </section>

                <section className="metric-card metric-card-stat">
                  <div className="metric-card-title">Pedidos a Verificar</div>
                  <div className="metric-stat-body">
                    <span className="metric-stat-icon">
                      <FileCheck2 size={36} strokeWidth={2} />
                    </span>
                    <strong>25</strong>
                  </div>
                  <div className="metric-note">Na Plataforma</div>
                </section>
              </div>
            </div>

            <div className="col-12 col-lg-12 col-xl-5 d-flex tm-top-chart-col">
              <section className="metric-card metric-card-large h-100 w-100">
                <div className="metric-card-title">Novos Consultores</div>
                <div className="tm-chart-shell">
                  <div className="tm-chart-axis" aria-hidden="true">
                    {novosConsultoresScale.yAxisTicks.slice().reverse().map((tick) => (
                      <span key={tick} className="tm-chart-axis-label">{tick}</span>
                    ))}
                  </div>

                  <div
                    ref={novosConsultoresChartRef}
                    className="tm-chart"
                    style={{ gridTemplateColumns: `repeat(${visibleNovosConsultoresData.length}, minmax(0, 1fr))` }}
                  >
                    <div className="tm-chart-grid-lines" aria-hidden="true">
                      {novosConsultoresScale.yAxisTicks.map((tick) => (
                        <span
                          key={tick}
                          className="tm-chart-grid-line"
                          style={{ bottom: `${(tick / novosConsultoresScale.chartMaxValue) * 100}%` }}
                        />
                      ))}
                    </div>

                    {visibleNovosConsultoresData.map(({ value, label }) => (
                      <div key={label} className="tm-chart-column">
                        <div className="tm-chart-bar-track">
                          <div
                            className="tm-chart-bar"
                            style={{ height: `${(value / novosConsultoresScale.chartMaxValue) * 100}%` }}
                          />
                        </div>
                        <span className="tm-chart-label">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="row g-3 align-items-stretch tm-lower-grid">
            <div className="col-12 col-lg-6 d-flex">
              <section className="consultores-section h-100 w-100">
                <div className="section-header">
                  <h2>Top Consultores</h2>
                  <a href="#consultores" onClick={(e) => e.preventDefault()}>Ver todos</a>
                </div>
                <div className="consultores-grid">
                  {topConsultores.map((consultor) => {
                    const IconComponent = consultor.icon;
                    return (
                      <div key={consultor.id} className="consultor-card">
                        <div className="consultor-header">
                          <div className="consultor-avatar">
                            <IconComponent size={24} className="icon-color" />
                          </div>
                          <div className="consultor-info">
                            <div className="consultor-name">{consultor.name}</div>
                            <div className="consultor-email">{consultor.email}</div>
                          </div>
                        </div>
                        <div className="consultor-stats">
                          <div className="stat">
                            <span className="stat-label">Pontos</span>
                            <span className="stat-value">{consultor.points}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Badges</span>
                            <span className="stat-value">{consultor.badges}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="col-12 col-lg-6 d-flex">
              <section className="activities-section h-100 w-100">
                <div className="section-header">
                  <h2>Atividades Recentes (Service Line Leader)</h2>
                  <a href="#atividades" onClick={(e) => e.preventDefault()}>Ver todos</a>
                </div>
                <div className="activities-list">
                  {recentActivities.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          <IconComponent size={20} />
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-time">{activity.timeframe}</div>
                        </div>
                        {activity.points && <div className="activity-points">{activity.points}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardSLL;
