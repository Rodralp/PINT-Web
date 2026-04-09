import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import '../../css/AdminGestor/Dashboard_AG.css';

const agTimelineValues = [5, 6, 7, 6, 8, 9, 7, 10, 8, 9, 11, 10];
const agStats = [
  { title: 'Utilizadores ativos', value: '128', note: '+6 esta semana' },
  { title: 'Comunicados', value: '11', note: '2 pendentes' },
  { title: 'Equipas monitorizadas', value: '19', note: 'Todas com SLA' },
  { title: 'Pedidos pendentes', value: '27', note: 'Fila global' },
];

const agQueueItems = [
  { title: 'Aprovar novo utilizador', subtitle: 'Departamento DX' },
  { title: 'Rever política SLA', subtitle: 'Versão 2.1' },
  { title: 'Validar exportação mensal', subtitle: 'Admin report' },
];

const agSuggestions = [
  { title: 'Comunicado de atualização', subtitle: 'Portal interno' },
  { title: 'Auditoria de permissões', subtitle: 'Perfis críticos' },
  { title: 'Dashboard executivo', subtitle: 'Resumo semanal' },
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

function DashboardAG() {
  const timelineChartRef = useRef(null);
  const timelineData = useMemo(() => buildTimelineData(agTimelineValues), []);
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
      <div className="dashboard-role-page ag-page">
        <header className="dashboard-role-header">
          <h1>Dashboard Administrador / Gestor</h1>
          <p>Template inicial para utilizadores, equipas, gestão geral e comunicados.</p>
        </header>

        <div className="dashboard-role-template-grid">
          <section className="dashboard-card dashboard-role-timeline-card">
            <div className="dashboard-role-card-title">Timeline (Atividade)</div>
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
            {agStats.map((item) => (
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
              <a href="#ag-progress" onClick={(event) => event.preventDefault()}>Ver todos</a>
            </div>
            <div className="dashboard-role-list">
              {agQueueItems.map((item) => (
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
              <a href="#ag-suggestions" onClick={(event) => event.preventDefault()}>Ver todos</a>
            </div>
            <div className="dashboard-role-list">
              {agSuggestions.map((item) => (
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

export default DashboardAG;
