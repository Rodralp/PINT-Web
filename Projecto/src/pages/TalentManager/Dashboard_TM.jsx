import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import '../../css/TalentManager/Dashboard_TM.css';

const tmTimelineValues = [4, 6, 5, 7, 4, 8, 6, 7, 5, 9, 8, 10];
const tmStats = [
  { title: 'Pedidos em análise', value: '14', note: '3 novos hoje' },
  { title: 'Pedidos aprovados', value: '31', note: 'Taxa de 81%' },
  { title: 'Pedidos recusados', value: '6', note: '2 este mês' },
  { title: 'Exportações', value: '8', note: 'Relatórios gerados' },
];

const tmQueueItems = [
  { title: 'Validação de evidências', subtitle: 'Prioridade alta' },
  { title: 'Aprovar candidatura LP', subtitle: 'Prazo: hoje' },
  { title: 'Revisão de pedido externo', subtitle: 'Prazo: amanhã' },
];

const tmSuggestions = [
  { title: 'Automatizar notificações', subtitle: 'Fluxo de aprovação' },
  { title: 'Criar template de feedback', subtitle: 'Recusas consistentes' },
  { title: 'Exportação semanal', subtitle: 'Agendar relatório' },
];

const buildTimelineData = (values) => {
  const today = new Date();

  return values.map((value, index) => {
    const daysOffset = values.length - 1 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - daysOffset);

    return {
      value,
      label: date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
    };
  });
};

const calculateVisibleTimelinePoints = (containerWidth, totalPoints) => {
  const minColumnWidth = 42;
  const maxPointsByWidth = Math.floor(containerWidth / minColumnWidth);
  return Math.max(4, Math.min(totalPoints, maxPointsByWidth));
};

function DashboardTM() {
  const timelineChartRef = useRef(null);
  const timelineData = useMemo(() => buildTimelineData(tmTimelineValues), []);
  const [visibleTimelinePoints, setVisibleTimelinePoints] = useState(timelineData.length);

  useEffect(() => {
    if (!timelineChartRef.current) {
      return undefined;
    }

    const updateVisiblePoints = (width) => {
      setVisibleTimelinePoints(calculateVisibleTimelinePoints(width, timelineData.length));
    };

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        updateVisiblePoints(entry.contentRect.width);
      }
    });

    observer.observe(timelineChartRef.current);
    updateVisiblePoints(timelineChartRef.current.clientWidth);

    return () => observer.disconnect();
  }, [timelineData]);

  const visibleTimelineData = timelineData.slice(-visibleTimelinePoints);
  const maxVisibleValue = Math.max(...visibleTimelineData.map(({ value }) => value));
  const yAxisStep = Math.max(1, Math.ceil(maxVisibleValue / 4));
  const chartMaxValue = yAxisStep * 4;
  const yAxisTicks = [1, 2, 3, 4].map((multiplier) => yAxisStep * multiplier);

  return (
    <Layout>
      <div className="dashboard-role-page tm-page">
        <header className="dashboard-role-header">
          <h1>Dashboard Talent Manager</h1>
          <p>Template inicial para gestão de pedidos, histórico e exportações.</p>
        </header>

        <div className="dashboard-role-template-grid">
          <section className="dashboard-card dashboard-role-timeline-card">
            <div className="dashboard-role-card-title">Timeline (Pedidos)</div>
            <div className="dashboard-role-chart-shell">
              <div className="dashboard-role-timeline-axis" aria-hidden="true">
                {yAxisTicks.slice().reverse().map((tick) => (
                  <span key={tick} className="dashboard-role-axis-label">{tick}</span>
                ))}
              </div>

              <div
                ref={timelineChartRef}
                className="dashboard-role-chart"
                style={{ gridTemplateColumns: `repeat(${visibleTimelineData.length}, minmax(0, 1fr))` }}
              >
                <div className="dashboard-role-grid-lines" aria-hidden="true">
                  {yAxisTicks.map((tick) => (
                    <span
                      key={tick}
                      className="dashboard-role-grid-line"
                      style={{ bottom: `${(tick / chartMaxValue) * 100}%` }}
                    />
                  ))}
                </div>

                {visibleTimelineData.map(({ value, label }) => (
                  <div key={label} className="dashboard-role-chart-col">
                    <div className="dashboard-role-chart-track">
                      <div
                        className="dashboard-role-chart-bar"
                        style={{ height: `${(value / chartMaxValue) * 100}%` }}
                      />
                    </div>
                    <span className="dashboard-role-chart-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="dashboard-role-stats-grid">
            {tmStats.map((item) => (
              <section key={item.title} className="dashboard-card dashboard-role-stat-card">
                <div className="dashboard-role-card-title">{item.title}</div>
                <strong>{item.value}</strong>
                <span>{item.note}</span>
              </section>
            ))}
          </div>

          <section className="dashboard-card dashboard-role-panel-card">
            <div className="dashboard-role-panel-header">
              <h2>Em Progresso</h2>
              <a href="#tm-progress" onClick={(event) => event.preventDefault()}>Ver todos</a>
            </div>
            <div className="dashboard-role-list">
              {tmQueueItems.map((item) => (
                <article key={item.title} className="dashboard-role-list-item">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-card dashboard-role-panel-card">
            <div className="dashboard-role-panel-header">
              <h2>Sugestões</h2>
              <a href="#tm-suggestions" onClick={(event) => event.preventDefault()}>Ver todos</a>
            </div>
            <div className="dashboard-role-list">
              {tmSuggestions.map((item) => (
                <article key={item.title} className="dashboard-role-list-item">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardTM;
