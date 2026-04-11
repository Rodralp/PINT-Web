import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, CheckCircle2, FileText, FileCheck2, Trophy, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/ServiceLineLeader/Dashboard_SLL.css';

const pedidosBadgesData = [
  { label: '26 NOV', value: 3 },
  { label: '27', value: 5 },
  { label: '28', value: 4 },
  { label: '29', value: 4 },
  { label: '30', value: 6 },
  { label: '01 DEZ', value: 5 },
  { label: '02', value: 7 },
  { label: '03', value: 6 },
  { label: '04', value: 8 },
];

const novosConsultoresData = [
  { label: 'Abr', value: 2 },
  { label: 'Mai', value: 5 },
  { label: 'Jun', value: 4 },
  { label: 'Jul', value: 6 },
  { label: 'Ago', value: 3 },
  { label: 'Set', value: 7 },
  { label: 'Out', value: 5 },
  { label: 'Nov', value: 8 },
  { label: 'Dez', value: 4 },
];

const topConsultores = [
  {
    id: 1,
    rank: 1,
    name: 'João Gomes',
    email: 'joaogomes1234@softinsa.pt',
    points: 2450,
    badges: 17,
    initials: 'JG',
  },
  {
    id: 2,
    rank: 2,
    name: 'Maria Santos',
    email: 'maria.santos@softinsa.pt',
    points: 2200,
    badges: 14,
    initials: 'MS',
  },
  {
    id: 3,
    rank: 3,
    name: 'Pedro Mendes',
    email: 'pedro.mendes@softinsa.pt',
    points: 1950,
    badges: 9,
    initials: 'PM',
  },
  {
    id: 4,
    rank: 4,
    name: 'João Gomes',
    email: 'joaogomes1234@softinsa.pt',
    points: 1900,
    badges: 11,
    initials: 'JG',
  },
];

const recentActivities = [
  {
    id: 1,
    title: 'Visualizado progresso de 5 consultores',
    timeframe: 'Há 1 hora',
    icon: BarChart3,
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
    icon: FileText,
  },
  {
    id: 4,
    title: 'Consultado ranking de consultores da Service Line',
    timeframe: 'Há 2 dias',
    icon: Trophy,
  },
];

const calculateVisiblePoints = (containerWidth, totalPoints) => {
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
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [visibleLinePoints, setVisibleLinePoints] = useState(pedidosBadgesData.length);
  const [visibleBarPoints, setVisibleBarPoints] = useState(novosConsultoresData.length);

  useEffect(() => {
    const observers = [];

    if (lineChartRef.current) {
      const updateLinePoints = (width) => {
        setVisibleLinePoints(calculateVisiblePoints(width, pedidosBadgesData.length));
      };

      const lineObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          updateLinePoints(entry.contentRect.width);
        }
      });

      lineObserver.observe(lineChartRef.current);
      updateLinePoints(lineChartRef.current.clientWidth);
      observers.push(lineObserver);
    }

    if (barChartRef.current) {
      const updateBarPoints = (width) => {
        setVisibleBarPoints(calculateVisiblePoints(width, novosConsultoresData.length));
      };

      const barObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          updateBarPoints(entry.contentRect.width);
        }
      });

      barObserver.observe(barChartRef.current);
      updateBarPoints(barChartRef.current.clientWidth);
      observers.push(barObserver);
    }

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const visibleLineData = useMemo(
    () => pedidosBadgesData.slice(-visibleLinePoints),
    [visibleLinePoints]
  );
  const visibleBarsData = useMemo(
    () => novosConsultoresData.slice(-visibleBarPoints),
    [visibleBarPoints]
  );

  const lineScale = buildChartScale(visibleLineData);
  const barsScale = buildChartScale(visibleBarsData);

  const linePoints = visibleLineData.map(({ value }, index) => {
    const xPercentage = visibleLineData.length === 1 ? 50 : ((index + 0.5) / visibleLineData.length) * 100;
    const yPercentage = 100 - (value / lineScale.chartMaxValue) * 100;

    return { xPercentage, yPercentage };
  });

  return (
    <Layout>
      <div className="dashboard-sll-page">
        <header className="dashboard-sll-header">
          <h1>Dashboard Service Line</h1>
        </header>

        <div className="dashboard-sll-content">
          <section className="sll-card sll-main-line-card">
            <div className="sll-card-title">Número de Pedidos de Badges</div>
            <div className="sll-card-subtitle">Últimos 12 dias</div>

            <div className="sll-chart-shell">
              <div className="sll-chart-axis" aria-hidden="true">
                {lineScale.yAxisTicks.slice().reverse().map((tick) => (
                  <span key={tick} className="sll-chart-axis-label">{tick}</span>
                ))}
              </div>

              <div
                ref={lineChartRef}
                className="sll-chart sll-line-chart"
                style={{ gridTemplateColumns: `repeat(${visibleLineData.length}, minmax(0, 1fr))` }}
              >
                <div className="sll-grid-lines" aria-hidden="true">
                  {lineScale.yAxisTicks.map((tick) => (
                    <span
                      key={tick}
                      className="sll-grid-line"
                      style={{ bottom: `${(tick / lineScale.chartMaxValue) * 100}%` }}
                    />
                  ))}
                </div>

                <svg className="sll-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline
                    points={linePoints.map(({ xPercentage, yPercentage }) => `${xPercentage},${yPercentage}`).join(' ')}
                    className="sll-line-polyline"
                  />
                  {linePoints.map(({ xPercentage, yPercentage }) => (
                    <circle
                      key={`${xPercentage}-${yPercentage}`}
                      cx={xPercentage}
                      cy={yPercentage}
                      r="1.5"
                      className="sll-line-dot"
                    />
                  ))}
                </svg>

                {visibleLineData.map(({ label }, index) => (
                  <div key={`${label}-${index}`} className="sll-chart-column">
                    <div className="sll-line-value-track" aria-hidden="true" />
                    <span className="sll-chart-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sll-line-footer">
              <div className="sll-legend-item">
                <span className="sll-legend-dot" />
                <span>Pedidos realizados</span>
              </div>
              <div className="sll-total-period">
                <span>Total no período</span>
                <strong>54</strong>
              </div>
            </div>
          </section>

          <div className="sll-middle-stats">
            <section className="sll-card sll-stat-card">
              <div className="sll-card-title">Usuários Online</div>
              <div className="sll-stat-body">
                <span className="sll-stat-icon users">
                  <Users size={34} strokeWidth={2} />
                </span>
                <strong>1302</strong>
              </div>
              <div className="sll-stat-note">Na Plataforma</div>
            </section>

            <section className="sll-card sll-stat-card">
              <div className="sll-card-title">Pedidos a Verificar</div>
              <div className="sll-stat-body">
                <span className="sll-stat-icon verify">
                  <FileCheck2 size={34} strokeWidth={2} />
                </span>
                <strong>25</strong>
              </div>
              <div className="sll-stat-note">Na Plataforma</div>
            </section>
          </div>

          <section className="sll-card sll-main-bars-card">
            <div className="sll-card-title">Novos Consultores</div>

            <div className="sll-chart-shell">
              <div className="sll-chart-axis" aria-hidden="true">
                {barsScale.yAxisTicks.slice().reverse().map((tick) => (
                  <span key={tick} className="sll-chart-axis-label">{tick}</span>
                ))}
              </div>

              <div
                ref={barChartRef}
                className="sll-chart"
                style={{ gridTemplateColumns: `repeat(${visibleBarsData.length}, minmax(0, 1fr))` }}
              >
                <div className="sll-grid-lines" aria-hidden="true">
                  {barsScale.yAxisTicks.map((tick) => (
                    <span
                      key={tick}
                      className="sll-grid-line"
                      style={{ bottom: `${(tick / barsScale.chartMaxValue) * 100}%` }}
                    />
                  ))}
                </div>

                {visibleBarsData.map(({ value, label }) => (
                  <div key={label} className="sll-chart-column">
                    <div className="sll-chart-bar-track">
                      <div
                        className="sll-chart-bar"
                        style={{ height: `${(value / barsScale.chartMaxValue) * 100}%` }}
                      />
                    </div>
                    <span className="sll-chart-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="sll-section sll-top-consultores">
            <div className="sll-section-header">
              <h2>Top Consultores</h2>
              <a href="#top-consultores" onClick={(event) => event.preventDefault()}>Ver todos</a>
            </div>

            <div className="sll-consultores-grid">
              {topConsultores.map((consultor) => (
                <article key={consultor.id} className="sll-consultor-card">
                  <div className="sll-consultor-head">
                    <span className={`sll-rank-badge rank-${consultor.rank}`}>{consultor.rank}</span>
                    <div>
                      <div className="sll-consultor-name">{consultor.name}</div>
                      <div className="sll-consultor-email">{consultor.email}</div>
                    </div>
                  </div>

                  <div className="sll-consultor-bottom">
                    <div className="sll-consultor-avatar">{consultor.initials}</div>
                    <div className="sll-consultor-stats">
                      <div>
                        <span>Pontos</span>
                        <strong>{consultor.points}</strong>
                      </div>
                      <div>
                        <span>Badges</span>
                        <strong>{consultor.badges}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sll-section sll-activities">
            <div className="sll-section-header">
              <h2>Atividades Recentes (Service Line)</h2>
              <a href="#atividades" onClick={(event) => event.preventDefault()}>Ver todos</a>
            </div>

            <div className="sll-activities-list">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <article key={activity.id} className="sll-activity-item">
                    <span className="sll-activity-icon">
                      <IconComponent size={18} />
                    </span>
                    <div className="sll-activity-content">
                      <div className="sll-activity-title">{activity.title}</div>
                      <div className="sll-activity-time">{activity.timeframe}</div>
                    </div>
                    {activity.points && <div className="sll-activity-points">{activity.points}</div>}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardSLL;
