import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../components/Layout';
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
  Crown
} from 'lucide-react';
import '../../css/Consultor/Dashboard_C.css';

const timelineValues = [3, 2, 5, 4, 6, 3, 7, 5, 8, 4, 6, 9];

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

const inProgressItems = [
  { title: 'LowCode (Outsystems)', subtitle: 'Especialista', accent: 'warning', icon: AlertCircle },
  { title: 'LowCode (Outsystems)', subtitle: 'Sénior', accent: 'yellow', icon: Search },
  { title: 'LowCode (Outsystems)', subtitle: 'Intermédio', accent: 'info', icon: TimerReset },
];

const suggestionItems = [
  { title: 'LowCode (Outsystems)', subtitle: 'Líder de Conhecimento', accent: 'success' },
  { title: 'Cloud Architecture', subtitle: 'Especialista', accent: 'violet' },
  { title: 'C++ Mastery', subtitle: 'Sénior', accent: 'amber' },
];

const dashboardStats = [
  { title: 'Bagdes Obtidos', value: '12', note: '2 este mês', icon: Award, tone: 'gold' },
  { title: 'Sequência de Dias', value: '4', note: 'Recorde: 8 dias', icon: Flame, tone: 'fire' },
  { title: 'Meus Pedidos', value: '5', note: '2 em validação', icon: Clock3, tone: 'blue' },
  { title: 'Ranking', value: '#15', note: '+3 posições este mês', icon: Crown, tone: 'rank' },
];

function DashboardC() {
  const timelineChartRef = useRef(null);
  const timelineData = useMemo(() => buildTimelineData(timelineValues), []);
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
      <div className="dashboard-consultor-page">
        <div className="dashboard-consultor-header">
          <h1>Dashboard Consultor</h1>
        </div>

        <div className="dashboard-consultor-grid">
          <section className="dashboard-card dashboard-timeline-card">
            <div className="dashboard-card-title">Timeline (Badges Obtidas)</div>
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
                aria-label="Timeline de badges obtidas"
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

          <div className="dashboard-stats-grid">
            {dashboardStats.map(({ title, value, note, icon: Icon, tone }) => (
              <section key={title} className={`dashboard-card dashboard-stat-card tone-${tone}`}>
                <div className="dashboard-card-title">{title}</div>
                <div className="dashboard-stat-body">
                  <span className="dashboard-stat-icon">
                    <Icon size={36} strokeWidth={2} />
                  </span>
                  <strong>{value}</strong>
                </div>
                <div className="dashboard-stat-note">{note}</div>
              </section>
            ))}
          </div>

          <section className="dashboard-card dashboard-panel-card dashboard-progress-card">
            <div className="dashboard-panel-header">
              <h2>Em Progresso</h2>
              <a href="#ver-todos-progresso" onClick={(event) => event.preventDefault()}>
                Ver todos <ArrowRight size={16} />
              </a>
            </div>

            <div className="dashboard-list">
              {inProgressItems.map(({ title, subtitle, accent, icon: Icon }) => (
                <article key={`${title}-${subtitle}`} className="dashboard-list-item">
                  <div className={`dashboard-list-badge accent-${accent}`}>
                    <Sparkles size={18} strokeWidth={2} />
                  </div>
                  <div className="dashboard-list-content">
                    <strong>{title}</strong>
                    <span>{subtitle}</span>
                  </div>
                  <div className={`dashboard-list-action accent-${accent}`}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-card dashboard-panel-card dashboard-suggestions-card">
            <div className="dashboard-panel-header">
              <h2>Sugestões</h2>
              <a href="#ver-todos-sugestoes" onClick={(event) => event.preventDefault()}>
                Ver todos <ArrowRight size={16} />
              </a>
            </div>

            <div className="dashboard-list dashboard-suggestions-list">
              {suggestionItems.map(({ title, subtitle, accent }) => (
                <article key={`${title}-${subtitle}`} className="dashboard-list-item dashboard-suggestion-item">
                  <div className={`dashboard-list-badge accent-${accent}`}>
                    <GraduationCap size={18} strokeWidth={2} />
                  </div>
                  <div className="dashboard-list-content">
                    <strong>{title}</strong>
                    <span>{subtitle}</span>
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

export default DashboardC;
