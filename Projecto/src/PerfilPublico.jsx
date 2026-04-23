import { useMemo } from 'react';
import {
	ArrowLeft,
	Award,
	Calendar,
	Crown,
	Flame,
	Mail,
	MapPin,
	Star,
	Trophy,
	Zap,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import './css/PerfilPublico.css';

const defaultConsultor = {
	id: '1',
	name: 'Joao Gomes',
	email: 'joaogomes1234@softinsa.pt',
	serviceLine: 'Cloud',
	points: 2450,
	badges: 12,
	location: 'Portugal',
	joined: '2023',
};

const fallbackConsultores = [
	{ id: 1, name: 'Joao Gomes', email: 'joaogomes1234@softinsa.pt', serviceLine: 'Cloud', points: 2450, badges: 12, location: 'Portugal', joined: '2023' },
	{ id: 2, name: 'Maria Santos', email: 'maria.santos@softinsa.pt', serviceLine: 'Data & AI', points: 2200, badges: 10, location: 'Portugal', joined: '2022' },
	{ id: 3, name: 'Pedro Mendes', email: 'pedro.mendes@softinsa.pt', serviceLine: 'Cloud', points: 1950, badges: 9, location: 'Portugal', joined: '2024' },
	{ id: 4, name: 'Ana Costa', email: 'ana.costa@softinsa.pt', serviceLine: 'LowCode', points: 1700, badges: 8, location: 'Portugal', joined: '2023' },
	{ id: 5, name: 'Carlos Ferreira', email: 'carlos.ferreira@softinsa.pt', serviceLine: 'Cybersecurity', points: 1500, badges: 7, location: 'Portugal', joined: '2021' },
	{ id: 6, name: 'Rita Oliveira', email: 'rita.oliveira@softinsa.pt', serviceLine: 'Data & AI', points: 1450, badges: 7, location: 'Portugal', joined: '2022' },
];

function PerfilPublico() {
	const { consultorId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	const consultor = useMemo(() => {
		if (location.state?.consultor) {
			return location.state.consultor;
		}

		const decodedId = decodeURIComponent(consultorId || '');
		const matchedConsultor = fallbackConsultores.find((item) => String(item.id) === decodedId);
		return matchedConsultor || defaultConsultor;
	}, [consultorId, location.state]);

	const profileStats = useMemo(() => {
		const rankingPosition = fallbackConsultores
			.slice()
			.sort((a, b) => b.points - a.points)
			.findIndex((item) => String(item.id) === String(consultor.id));

		return [
			{ id: 'badges', title: t('dashboard_stat_badges_title'), value: consultor.badges, icon: Award, tone: 'gold' },
			{ id: 'points', title: t('points'), value: consultor.points, icon: Trophy, tone: 'blue' },
			{ id: 'streak', title: t('dashboard_stat_streak_title'), value: 4, icon: Flame, tone: 'fire' },
			{ id: 'ranking', title: t('dashboard_stat_ranking_title'), value: `#${rankingPosition >= 0 ? rankingPosition + 1 : '-'}`, icon: Crown, tone: 'rank' },
		];
	}, [consultor, t]);

	const skillsItems = useMemo(() => ([
		{ title: consultor.serviceLine, levelKey: 'badge_level_specialist' },
		{ title: 'JavaScript', levelKey: 'badge_level_senior' },
		{ title: 'React', levelKey: 'badge_level_intermediate' },
	]), [consultor.serviceLine]);

	const certificationsItems = useMemo(() => ([
		{ title: consultor.serviceLine, levelKey: 'badge_level_knowledge_lead' },
		{ title: 'Cloud Architecture', levelKey: 'badge_level_specialist' },
		{ title: 'LowCode (Outsystems)', levelKey: 'badge_level_senior' },
	]), [consultor.serviceLine]);

	const activityItems = useMemo(() => ([
		{ id: 'a1', description: `Subiu para ${consultor.badges} badges concluidas`, date: '5 dias atras', icon: Award },
		{ id: 'a2', description: `Alcancou ${consultor.points} pontos`, date: '1 semana atras', icon: Zap },
		{ id: 'a3', description: `Nova skill em ${consultor.serviceLine}`, date: '2 semanas atras', icon: Star },
	]), [consultor.badges, consultor.points, consultor.serviceLine]);

	const handleGoBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}

		navigate('/galeria-publica');
	};

	return (
		<div className="pp-root">
			<Navbar />

			<main className="pp-main">
				<section className="pp-shell">
					<div className="pp-page">
						<header className="pp-header">
							<button type="button" className="pp-back-btn" onClick={handleGoBack} aria-label={t('back')}>
								<ArrowLeft size={22} />
							</button>
							<h1>{t('profile_title')}</h1>
						</header>

						<section className="pp-profile-hero">
							<div className="pp-avatar-wrap">
								<img src={`https://i.pravatar.cc/160?u=${consultor.email || consultor.name}`} alt={consultor.name} className="pp-avatar" />
							</div>

							<div className="pp-profile-info">
								<h2>{consultor.name}</h2>
								<p>{consultor.serviceLine}</p>

								<div className="pp-profile-meta">
									<span><Mail size={16} /> {consultor.email}</span>
									<span><MapPin size={16} /> {consultor.location || 'Portugal'}</span>
									<span><Calendar size={16} /> Joined {consultor.joined || '2023'}</span>
								</div>
							</div>
						</section>

						<section className="pp-stats-grid">
							{profileStats.map((item) => {
								const StatIcon = item.icon;

								return (
									<article key={item.id} className={`pp-stat-card tone-${item.tone}`}>
										<div className="pp-stat-title">{item.title}</div>
										<div className="pp-stat-body">
											<span className="pp-stat-icon">
												<StatIcon size={30} strokeWidth={2} />
											</span>
											<strong>{item.value}</strong>
										</div>
									</article>
								);
							})}
						</section>

						<div className="pp-panels-grid">
							<section className="pp-panel-card">
								<div className="pp-panel-header">
									<h3>{t('profile_skills')}</h3>
								</div>

								<div className="pp-list">
									{skillsItems.map(({ title, levelKey }) => (
										<article key={`${title}-${levelKey}`} className="pp-list-item">
											<div className="pp-list-badge">
												<Award size={18} strokeWidth={2} />
											</div>
											<div className="pp-list-content">
												<strong>{title}</strong>
												<span>{t(levelKey)}</span>
											</div>
										</article>
									))}
								</div>
							</section>

							<section className="pp-panel-card">
								<div className="pp-panel-header">
									<h3>{t('profile_certifications')}</h3>
								</div>

								<div className="pp-list">
									{certificationsItems.map(({ title, levelKey }) => (
										<article key={`${title}-${levelKey}`} className="pp-list-item">
											<div className="pp-list-badge">
												<Trophy size={18} strokeWidth={2} />
											</div>
											<div className="pp-list-content">
												<strong>{title}</strong>
												<span>{t(levelKey)}</span>
											</div>
										</article>
									))}
								</div>
							</section>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

export default PerfilPublico;
