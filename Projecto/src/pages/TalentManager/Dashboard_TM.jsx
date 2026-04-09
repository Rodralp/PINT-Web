import { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, Award, TrendingUp, Code, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/TalentManager/Dashboard_TM.css';

const badgesTimelineValues = [3, 4, 3.5, 6, 4, 8, 6, 7, 5, 9, 8, 10];
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
    title: 'Badge especial "Ranking Up" conquistado',
    timeframe: 'Há 2 dias',
    points: '+100 pts',
    icon: Award,
  },
  {
    id: 2,
    title: 'Badge "Cloud Architecture - Líder de Conhecimento" conquistada',
    timeframe: 'Há 5 dias',
    points: '+150 pts',
    icon: Trophy,
  },
  {
    id: 3,
    title: 'Subiu 2 posições no ranking',
    timeframe: 'Há 2 dias',
    icon: TrendingUp,
  },
  {
    id: 4,
    title: 'Badge "LowCode (Outsystem) - Júnior" conquistado',
    timeframe: 'Há 5 semana',
    points: '+100 pts',
    icon: Code,
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

const calculateVisibleLineChartPoints = (containerWidth, totalPoints) => {
  const minColumnWidth = 82;
  const maxPointsByWidth = Math.floor(containerWidth / minColumnWidth);
  return Math.max(4, Math.min(totalPoints, maxPointsByWidth, 4));
};

const buildChartScale = (data) => {
  const maxVisibleValue = Math.max(...data.map(({ value }) => value));
  const yAxisStep = Math.max(1, Math.ceil(maxVisibleValue / 4));
  const chartMaxValue = yAxisStep * 4;
  const yAxisTicks = [1, 2, 3, 4].map((multiplier) => yAxisStep * multiplier);

  return { chartMaxValue, yAxisTicks };
};

function DashboardTM() {
  const badgesChartRef = useRef(null);
  const novosConsultoresChartRef = useRef(null);
  const badgesTimelineData = useMemo(() => buildDailyTimelineData(badgesTimelineValues), []);
  const novosConsultoresData = useMemo(() => buildDailyTimelineData(novosConsultoresValues, 'day-month'), []);
  const [visibleBadgesPoints, setVisibleBadgesPoints] = useState(badgesTimelineData.length);
  const [visibleNovosConsultoresPoints, setVisibleNovosConsultoresPoints] = useState(novosConsultoresData.length);

  useEffect(() => {
    const observers = [];

    if (badgesChartRef.current) {
      const updateBadgesPoints = (width) => {
        setVisibleBadgesPoints(calculateVisibleLineChartPoints(width, badgesTimelineData.length));
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
  const lineChartWidth = 320;
  const lineChartHeight = 180;
  const lineChartPadding = { top: 14, right: 8, bottom: 30, left: 8 };
  const lineChartInnerWidth = lineChartWidth - lineChartPadding.left - lineChartPadding.right;
  const lineChartInnerHeight = lineChartHeight - lineChartPadding.top - lineChartPadding.bottom;
  const badgesLinePoints = visibleBadgesData.map(({ value, label }, index) => {
    const x = lineChartPadding.left + (index / (visibleBadgesData.length - 1 || 1)) * lineChartInnerWidth;
    const y =
      lineChartPadding.top +
      ((badgesScale.chartMaxValue - value) / badgesScale.chartMaxValue) * lineChartInnerHeight;

    return { x, y, label };
  });

  return (
    <Layout>
      <div className="dashboard-tm">
        <header className="dashboard-tm-header">
          <h1>Dashboard Talent Manager</h1>
        </header>

        <div className="dashboard-tm-content">
          {/* Metrics Grid */}
          <div className="row g-3 align-items-stretch metrics-container">
            <div className="col-12 col-xl-4 d-flex">
              {/* Badges Timeline Card */}
              <section className="metric-card metric-card-large h-100 w-100">
                <div className="metric-card-title">Número de Pedidos de Badges</div>
                <div className="metric-subtitle">Últimos 12 dias</div>
                <div className="tm-chart-shell">
                  <div className="tm-chart-axis" aria-hidden="true">
                    {badgesScale.yAxisTicks.slice().reverse().map((tick) => (
                      <span key={tick} className="tm-chart-axis-label">{tick}</span>
                    ))}
                  </div>

                  <div ref={badgesChartRef} className="tm-line-chart-wrap">
                    <svg
                      className="tm-line-chart"
                      viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`}
                      preserveAspectRatio="none"
                    >
                      {badgesScale.yAxisTicks.map((tick) => {
                        const y =
                          lineChartPadding.top +
                          ((badgesScale.chartMaxValue - tick) / badgesScale.chartMaxValue) * lineChartInnerHeight;

                        return (
                          <line
                            key={`line-grid-${tick}`}
                            x1={lineChartPadding.left}
                            y1={y}
                            x2={lineChartWidth - lineChartPadding.right}
                            y2={y}
                            className="tm-line-grid"
                          />
                        );
                      })}

                      {badgesLinePoints.map(({ x }) => (
                        <line
                          key={`line-v-${x}`}
                          x1={x}
                          y1={lineChartPadding.top}
                          x2={x}
                          y2={lineChartHeight - lineChartPadding.bottom}
                          className="tm-line-grid-vertical"
                        />
                      ))}

                      <polyline
                        points={badgesLinePoints.map(({ x, y }) => `${x},${y}`).join(' ')}
                        className="tm-line-path"
                      />

                      {badgesLinePoints.map(({ x, y, label }) => (
                        <g key={`line-point-${label}-${x}`}>
                          <circle cx={x} cy={y} r="4" className="tm-line-point" />
                          <text x={x} y={lineChartHeight - 10} className="tm-line-label">{label}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
                <div className="metric-footer">
                  <div className="footer-item">
                    <span>● Pedidos realizados</span>
                  </div>
                  <div className="footer-value">54</div>
                  <div className="footer-item">
                    <span>Total no período</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-12 col-xl-4 d-flex">
              <div className="middle-stack w-100">
                <section className="metric-card metric-card-medium h-100 w-100">
                  <div className="metric-card-title">Utilizadores Online</div>
                  <div className="metric-value users-online">1302</div>
                  <div className="metric-note">Na Plataforma</div>
                </section>

                <section className="metric-card metric-card-medium h-100 w-100">
                  <div className="metric-card-title">Pedidos a Verificar</div>
                  <div className="metric-value pending">25</div>
                  <div className="metric-note">Na Plataforma</div>
                </section>
              </div>
            </div>

            <div className="col-12 col-xl-4 d-flex">
              {/* New Consultores Card */}
              <section className="metric-card metric-card-large h-100 w-100">
                <div className="metric-card-title">Novos Consultores</div>
                <div className="metric-subtitle">Últimos 10 dias</div>
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
            <div className="col-12 col-xl-6 d-flex">
              {/* Top Consultores Section */}
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

            <div className="col-12 col-xl-6 d-flex">
              {/* Recent Activities Section */}
              <section className="activities-section h-100 w-100">
                <div className="section-header">
                  <h2>Atividades Recentes (Talent Manager)</h2>
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

export default DashboardTM;
