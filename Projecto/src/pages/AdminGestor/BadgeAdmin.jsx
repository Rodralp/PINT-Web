import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchAdminLearningPaths } from '../../services/adminLearningPathService';
import { createAdminBadge, fetchAdminBadge, updateAdminBadge } from '../../services/adminBadgeService';
import '../../css/AdminGestor/BadgeAdmin.css';

const SPECIAL_BADGE_TYPE = 'special';
const STANDARD_BADGE_TYPE = 'standard';

const badgeLevels = [
  { levelKey: 'badge_level_junior', points: 100, badgeImage: '/badges/J%C3%BAnior.png' },
  { levelKey: 'badge_level_intermediate', points: 150, badgeImage: '/badges/Interm%C3%A9dio.png' },
  { levelKey: 'badge_level_senior', points: 200, badgeImage: '/badges/S%C3%A9nior.png' },
  { levelKey: 'badge_level_specialist', points: 250, badgeImage: '/badges/Especialista.png' },
  { levelKey: 'badge_level_knowledge_lead', points: 300, badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png' },
];

const specialRequirementOptions = [
  { id: 'badge_count', label: 'Obter numero de badges' },
  { id: 'ranking_position', label: 'Alcancar lugar no ranking' },
  { id: 'streak_days', label: 'Streak de dias' },
];

const formatDateLabel = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return '12 Jan 2026';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const buildRequirement = (seed = {}) => ({
  id: seed.id || `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: seed.type || specialRequirementOptions[0].id,
  value: seed.value !== undefined && seed.value !== null ? String(seed.value) : '',
});

const resolveLevelMeta = (levelKey) =>
  badgeLevels.find((level) => level.levelKey === levelKey) || badgeLevels[0];

const resolveLevelMetaFromTitle = (title) => {
  const normalized = String(title || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized.includes('junior')) {
    return badgeLevels[0];
  }

  if (normalized.includes('intermedio') || normalized.includes('interm')) {
    return badgeLevels[1];
  }

  if (normalized.includes('senior')) {
    return badgeLevels[2];
  }

  if (normalized.includes('especialista')) {
    return badgeLevels[3];
  }

  if (normalized.includes('lider')) {
    return badgeLevels[4];
  }

  return null;
};

const parseNumericId = (value) => {
  const raw = String(value || '');
  const match = raw.match(/(\d+)/);
  const parsed = match ? Number(match[1]) : Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const buildLevelOptions = (paths) => {
  const options = [];

  (paths || []).forEach((path) => {
    const pathName = path?.name || 'Learning Path';
    (path?.serviceLines || []).forEach((serviceLine) => {
      const serviceLineName = serviceLine?.name || 'Service Line';
      (serviceLine?.areas || []).forEach((area) => {
        const areaName = area?.name || 'Area';
        (area?.levels || []).forEach((level) => {
          const levelId = parseNumericId(level?.id);
          if (!levelId) {
            return;
          }

          const levelTitle = level?.title || 'Nivel';
          const levelMeta = resolveLevelMetaFromTitle(levelTitle) || badgeLevels[0];

          options.push({
            id: levelId,
            title: levelTitle,
            label: `${pathName} / ${serviceLineName} / ${areaName} / ${levelTitle}`,
            levelKey: levelMeta.levelKey,
            points: levelMeta.points,
            badgeImage: levelMeta.badgeImage,
          });
        });
      });
    });
  });

  return options;
};

const buildFormState = (badge, isCreate) => {
  const hasBadge = Boolean(badge);
  const isSpecial = hasBadge
    ? badge.typeId === SPECIAL_BADGE_TYPE || badge.isSpecial || !badge.levelKey
    : false;
  const levelMetaFromBadge = badge?.levelKey
    ? resolveLevelMeta(badge.levelKey)
    : resolveLevelMetaFromTitle(badge?.levelTitle || badge?.level || '');
  const levelMeta = levelMetaFromBadge || badgeLevels[0];
  const pointsValue = Number.isFinite(Number(badge?.points))
    ? Number(badge.points)
    : isSpecial
      ? 0
      : levelMeta.points;
  const badgeImage = badge?.badgeImage || (isSpecial ? '/badges/default.png' : levelMeta.badgeImage);
  const specialRequirements = Array.isArray(badge?.specialRequirements) && badge.specialRequirements.length > 0
    ? badge.specialRequirements.map((req) => buildRequirement(req))
    : [buildRequirement()];

  return {
    id: badge?.id || (isCreate ? '' : badge?.id || ''),
    badgeDbId: badge?.badgeDbId || null,
    levelId: parseNumericId(badge?.levelId),
    name: badge?.area || badge?.name || '',
    description: badge?.description || '',
    type: isSpecial ? SPECIAL_BADGE_TYPE : STANDARD_BADGE_TYPE,
    levelKey: isSpecial ? null : levelMeta.levelKey,
    points: String(pointsValue),
    badgeImage,
    date: badge?.date || formatDateLabel(),
    specialRequirements,
  };
};

function BadgeAdmin() {
  const { badgeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isCreate = !badgeId || badgeId === 'novo';

  const [initialBadge, setInitialBadge] = useState(() => location.state?.badge || null);
  const [form, setForm] = useState(() => buildFormState(initialBadge, isCreate));
  const [formErrors, setFormErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [levelOptions, setLevelOptions] = useState([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSpecial = form.type === SPECIAL_BADGE_TYPE;
  const selectedLevelOption = useMemo(
    () => levelOptions.find((option) => option.id === form.levelId) || null,
    [levelOptions, form.levelId],
  );

  useEffect(() => {
    let isMounted = true;

    const loadLevels = async () => {
      setIsLoadingLevels(true);
      try {
        const data = await fetchAdminLearningPaths();
        if (!isMounted) {
          return;
        }

        setLevelOptions(buildLevelOptions(data));
      } catch {
        if (isMounted) {
          setStatusMessage('Falha ao carregar os niveis.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingLevels(false);
        }
      }
    };

    loadLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (location.state?.badge) {
      setInitialBadge(location.state.badge);
      setStatusMessage('');
      return () => {
        isMounted = false;
      };
    }

    if (isCreate) {
      setInitialBadge(null);
      setStatusMessage('');
      return () => {
        isMounted = false;
      };
    }

    const loadBadge = async () => {
      try {
        const parsedBadgeId = parseNumericId(badgeId) || badgeId;
        const data = await fetchAdminBadge(parsedBadgeId);
        if (isMounted) {
          setInitialBadge(data);
          setStatusMessage('');
        }
      } catch {
        if (isMounted) {
          setStatusMessage('Badge nao encontrada.');
        }
      }
    };

    loadBadge();

    return () => {
      isMounted = false;
    };
  }, [badgeId, isCreate, location.state?.badge]);

  useEffect(() => {
    setForm(buildFormState(initialBadge, isCreate));
    setFormErrors({});
  }, [initialBadge, isCreate]);

  useEffect(() => {
    if (!initialBadge && !isCreate) {
      setStatusMessage('Badge nao encontrada.');
    }
  }, [initialBadge, isCreate]);

  const handleBack = () => {
    const backTo = typeof location.state?.backTo === 'string'
      ? location.state.backTo
      : '/admin-gestor/catalogo-badges';
    navigate(backTo);
  };

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleTypeChange = (event) => {
    const { value } = event.target;
    const nextType = value === SPECIAL_BADGE_TYPE ? SPECIAL_BADGE_TYPE : STANDARD_BADGE_TYPE;

    setForm((current) => {
      if (nextType === SPECIAL_BADGE_TYPE) {
        return {
          ...current,
          type: nextType,
          levelId: null,
          levelKey: null,
          specialRequirements: current.specialRequirements.length > 0
            ? current.specialRequirements
            : [buildRequirement()],
        };
      }

      const fallbackOption = levelOptions.find((option) => option.id === current.levelId) || levelOptions[0];
      const fallbackMeta = current.levelKey ? resolveLevelMeta(current.levelKey) : badgeLevels[0];
      const levelKey = fallbackOption?.levelKey || fallbackMeta.levelKey;
      const points = fallbackOption?.points ?? fallbackMeta.points;
      const badgeImage = fallbackOption?.badgeImage || fallbackMeta.badgeImage;

      return {
        ...current,
        type: nextType,
        levelId: fallbackOption?.id || current.levelId,
        levelKey,
        points: String(points),
        badgeImage,
      };
    });
  };

  const handleLevelChange = (event) => {
    const { value } = event.target;
    const parsedLevelId = parseNumericId(value);
    const selected = levelOptions.find((option) => option.id === parsedLevelId) || null;

    if (!selected) {
      setForm((current) => ({
        ...current,
        levelId: null,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      levelId: selected.id,
      levelKey: selected.levelKey,
      points: String(selected.points),
      badgeImage: selected.badgeImage,
    }));
  };

  const updateRequirement = (id, patch) => {
    setForm((current) => ({
      ...current,
      specialRequirements: current.specialRequirements.map((req) =>
        req.id === id ? { ...req, ...patch } : req,
      ),
    }));
  };

  const addRequirement = () => {
    setForm((current) => ({
      ...current,
      specialRequirements: [...current.specialRequirements, buildRequirement()],
    }));
  };

  const removeRequirement = (id) => {
    setForm((current) => ({
      ...current,
      specialRequirements: current.specialRequirements.filter((req) => req.id !== id),
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Indique o nome do badge.';
    }

    if (!isSpecial && !form.levelId) {
      nextErrors.levelId = 'Selecione um nivel valido.';
    }

    if (isSpecial) {
      const validSpecial = form.specialRequirements.filter((req) => Number(req.value) > 0);
      if (validSpecial.length === 0) {
        nextErrors.specialRequirements = 'Defina pelo menos um requisito com valor.';
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    const pointsValue = Number(form.points);
    const fallbackPoints = selectedLevelOption?.points ?? 0;
    const safePoints = Number.isFinite(pointsValue)
      ? pointsValue
      : (isSpecial ? 0 : fallbackPoints);
    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();

    const payload = {
      name: trimmedName,
      description: trimmedDescription,
      points: safePoints,
      levelId: isSpecial ? null : form.levelId,
      isSpecial,
    };

    try {
      if (isCreate) {
        await createAdminBadge(payload);
      } else {
        const targetBadgeId = form.badgeDbId || parseNumericId(badgeId);
        if (!targetBadgeId) {
          setStatusMessage('Nao foi possivel identificar o badge para atualizar.');
          setIsSaving(false);
          return;
        }

        await updateAdminBadge(targetBadgeId, payload);
      }

      navigate('/admin-gestor/catalogo-badges', {
        state: { refreshCatalog: Date.now() },
      });
    } catch (error) {
      setStatusMessage(error?.message || 'Erro ao guardar badge.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="badge-admin-page">
        <header className="badge-admin-header">
          <button type="button" className="badge-admin-back" onClick={handleBack}>
            <ChevronLeft size={18} />
          </button>

          <div className="badge-admin-title">
            <p>{isCreate ? 'Criar badge' : 'Editar badge'}</p>
            <h1>{form.name || 'Badge'}</h1>
          </div>

          <div className="badge-admin-actions">
            <button type="button" className="badge-admin-btn ghost" onClick={handleBack}>
              Cancelar
            </button>
            <button type="button" className="badge-admin-btn primary" onClick={handleSave} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </header>

        {statusMessage && (
          <div className="badge-admin-alert" role="status">{statusMessage}</div>
        )}

        <section className="badge-admin-card">
          <div className="badge-admin-grid">
            <label className="badge-admin-field">
              <span>Nome do badge</span>
              <input
                type="text"
                value={form.name}
                onChange={handleFieldChange('name')}
                placeholder="Ex: MVP de Badges"
              />
              {formErrors.name && <span className="badge-admin-error">{formErrors.name}</span>}
            </label>

            <label className="badge-admin-field">
              <span>Descricao</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={handleFieldChange('description')}
                placeholder="Resumo do badge"
              />
            </label>

            <label className="badge-admin-field">
              <span>Tipo</span>
              <select value={form.type} onChange={handleTypeChange}>
                <option value={STANDARD_BADGE_TYPE}>Nivel (com candidatura)</option>
                <option value={SPECIAL_BADGE_TYPE}>Especial (sem candidatura)</option>
              </select>
            </label>

            {!isSpecial && (
              <label className="badge-admin-field">
                <span>Nivel associado</span>
                <select value={form.levelId || ''} onChange={handleLevelChange} disabled={isLoadingLevels}>
                  <option value="">Selecionar nivel</option>
                  {levelOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.levelId && <span className="badge-admin-error">{formErrors.levelId}</span>}
              </label>
            )}

            <label className="badge-admin-field">
              <span>Pontos</span>
              <input
                type="number"
                min="0"
                value={form.points}
                onChange={handleFieldChange('points')}
              />
            </label>

            <label className="badge-admin-field">
              <span>Imagem do badge (URL)</span>
              <input
                type="text"
                value={form.badgeImage}
                onChange={handleFieldChange('badgeImage')}
                placeholder="/badges/Especialista.png"
              />
            </label>
          </div>
        </section>

        <section className="badge-admin-card">
          <div className="badge-admin-section-title">Requisitos especiais</div>
          {!isSpecial && (
            <p className="badge-admin-muted">
              Este badge segue o fluxo normal de candidatura e validacao.
            </p>
          )}
          {isSpecial && (
            <div className="badge-admin-reqs">
              {form.specialRequirements.map((req) => (
                <div key={req.id} className="badge-admin-req-row">
                  <select
                    value={req.type}
                    onChange={(event) => updateRequirement(req.id, { type: event.target.value })}
                  >
                    {specialRequirementOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={req.value}
                    onChange={(event) => updateRequirement(req.id, { value: event.target.value })}
                    placeholder="Valor"
                  />
                  <button
                    type="button"
                    className="badge-admin-btn icon"
                    onClick={() => removeRequirement(req.id)}
                    aria-label="Remover requisito"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button type="button" className="badge-admin-btn ghost" onClick={addRequirement}>
                <Plus size={16} />
                Adicionar requisito
              </button>

              {formErrors.specialRequirements && (
                <span className="badge-admin-error">{formErrors.specialRequirements}</span>
              )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default BadgeAdmin;
