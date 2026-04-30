import { useEffect, useMemo, useState } from 'react';
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
import { fetchPublicProfile } from './services/consultorService';

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

		const [remoteConsultor, setRemoteConsultor] = useState(null);

		const consultor = useMemo(() => {
			if (location.state?.consultor) {
				return location.state.consultor;
			}

			if (remoteConsultor) {
				return remoteConsultor;
			}

			const decodedId = decodeURIComponent(consultorId || '');
			const matchedConsultor = fallbackConsultores.find((item) => String(item.id) === decodedId);
			return matchedConsultor || defaultConsultor;
		}, [consultorId, location.state, remoteConsultor]);

		useEffect(() => {
			let isMounted = true;
			const loadPublicProfile = async () => {
				try {
					const decodedId = decodeURIComponent(consultorId || '');
					if (!decodedId) return;
					const data = await fetchPublicProfile(decodedId);
					if (!isMounted || !data) return;

					// Map server profile structure to expected consultor shape used in this page
					const mapped = {
						id: data.user?.id || data.id || decodedId,
						name: data.user?.name || data.nome || data.user?.nome || 'Consultor',
						email: data.user?.email || data.email || '',
						serviceLine: data.serviceLine || (data.user?.serviceLine) || 'Service Line',
						points: data.points || 0,
						badges: data.badges || 0,
						serviceLineStats: Array.isArray(data.serviceLineStats) ? data.serviceLineStats.map((s) => ({
							serviceLine: s.serviceLine || s.name || s.serviceline,
							badges: Number(s.badges) || 0,
							points: Number(s.points) || 0,
						})) : [],
						location: data.location || 'Portugal',
						joined: data.joined || data.user?.joined || '',
					};

					setRemoteConsultor(mapped);
				} catch (e) {
					// ignore and keep fallback
				}
			};

			loadPublicProfile();

			return () => { isMounted = false; };
		}, [consultorId]);

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

		const skillsItems = useMemo(() => {
			if (Array.isArray(consultor.serviceLineStats) && consultor.serviceLineStats.length > 0) {
				return consultor.serviceLineStats.slice(0, 3).map((s) => ({
					title: s.serviceLine || s.name,
					levelKey: 'badge_level_specialist',
					meta: `${s.badges} badges`,
				}));
			}

			return [
				{ title: consultor.serviceLine, levelKey: 'badge_level_specialist', meta: `${consultor.points} pts` },
				{ title: 'JavaScript', levelKey: 'badge_level_senior' },
				{ title: 'React', levelKey: 'badge_level_intermediate' },
			];
		}, [consultor.serviceLineStats, consultor.serviceLine, consultor.points]);

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

								{Array.isArray(consultor.serviceLineStats) && consultor.serviceLineStats.length > 0 ? (
									<div className="pp-service-line-stats">
										{(() => {
											const maxBadges = Math.max(...consultor.serviceLineStats.map((s) => s.badges || 0), 1);
											return consultor.serviceLineStats.map((stat) => {
												const percentage = ((stat.badges || 0) / maxBadges) * 100;
												return (
													<article key={`sl-${stat.serviceLine}`} className="pp-service-line-item">
														<div className="pp-service-line-header">
															<strong>{stat.serviceLine || 'Service Line'}</strong>
															<span className="pp-service-line-meta">
																{stat.badges || 0} badge{stat.badges !== 1 ? 's' : ''} · {stat.points || 0} pts
															</span>
														</div>
														<div className="pp-progress-bar-bg">
															<div
																style={{ width: `${percentage}%` }}
																className="pp-progress-bar-fill"
															/>
														</div>
													</article>
												);
											})()}
										</div>
									) : (
										<div className="pp-list">
											{skillsItems.map(({ title, levelKey, meta }) => (
												<article key={`${title}-${levelKey}`} className="pp-list-item">
													<div className="pp-list-badge">
														<Award size={18} strokeWidth={2} />
													</div>
													<div className="pp-list-content">
														<strong>{title}</strong>
														<span>
														  {t(levelKey)}{meta ? ` · ${meta}` : ''}
														</span>
													</div>
												</article>
											))}
										</div>
									)}
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
