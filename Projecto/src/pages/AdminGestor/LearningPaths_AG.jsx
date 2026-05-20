import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Pencil, Plus, X } from 'lucide-react';
import Layout from '../../components/Layout';
import {
  fetchAdminLearningPaths,
  createAdminLearningPath,
  updateAdminLearningPath,
  createAdminServiceLine,
  updateAdminServiceLine,
  createAdminArea,
  updateAdminArea,
  createAdminLevel,
  updateAdminLevel,
} from '../../services/adminLearningPathService';
import '../../css/Consultor/LearningPaths_C.css';
import '../../css/AdminGestor/LearningPaths_AG.css';

const entityLabels = {
  learningPath: 'Learning Path',
  serviceLine: 'Service Line',
  area: 'Area',
  level: 'Nivel',
};

const buildAreaRowId = (serviceLineId, areaId) => `${serviceLineId}-${areaId}`;

const normalizeText = (value) => String(value || '').trim();

const getNumericId = (value) => {
  const parts = String(value || '').split('-');
  const parsed = Number(parts[parts.length - 1]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const buildEntityId = (prefix, numericId) => `${prefix}-${numericId}`;

const buildEditorForm = (type, entity) => {
  switch (type) {
    case 'learningPath':
      return {
        name: entity?.name || '',
        description: entity?.description || '',
      };
    case 'serviceLine':
      return {
        name: entity?.name || '',
        description: entity?.description || '',
      };
    case 'area':
      return {
        name: entity?.name || '',
        description: entity?.description || '',
      };
    case 'level':
      return {
        title: entity?.title || '',
      };
    default:
      return {};
  }
};

const getEditorEntity = (paths, editor) => {
  if (!editor) {
    return null;
  }

  const path = paths.find((item) => item.id === editor.pathId);

  if (editor.type === 'learningPath') {
    return path || null;
  }

  const serviceLine = path?.serviceLines?.find((item) => item.id === editor.serviceLineId);

  if (editor.type === 'serviceLine') {
    return serviceLine || null;
  }

  const area = serviceLine?.areas?.find((item) => item.id === editor.areaId);

  if (editor.type === 'area') {
    return area || null;
  }

  const level = area?.levels?.find((item) => item.id === editor.levelId);
  return level || null;
};

function LearningPathsAG() {
  const [learningPathsData, setLearningPathsData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [selectedServiceLineId, setSelectedServiceLineId] = useState(null);
  const [expandedPathIds, setExpandedPathIds] = useState([]);
  const [expandedAreaIds, setExpandedAreaIds] = useState([]);
  const [editor, setEditor] = useState(null);
  const [editorForm, setEditorForm] = useState(null);
  const [editorError, setEditorError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedPath = useMemo(
    () => learningPathsData.find((item) => item.id === selectedPathId) || learningPathsData[0],
    [learningPathsData, selectedPathId],
  );

  const selectedServiceLine = useMemo(() => {
    if (!selectedPath || !selectedServiceLineId) {
      return null;
    }

    return selectedPath.serviceLines.find((item) => item.id === selectedServiceLineId) || null;
  }, [selectedPath, selectedServiceLineId]);

  const pageTitle = selectedServiceLine ? 'Service Line' : 'Learning Paths';

  const loadLearningPaths = async (options = {}) => {
    setIsLoading(true);

    try {
      const data = await fetchAdminLearningPaths();

      if (Array.isArray(data) && data.length > 0) {
        setLearningPathsData(data);
        setErrorMessage('');

        if (Object.prototype.hasOwnProperty.call(options, 'pathId')) {
          setSelectedPathId(options.pathId);
        }

        if (Object.prototype.hasOwnProperty.call(options, 'serviceLineId')) {
          setSelectedServiceLineId(options.serviceLineId);
        }

        if (Object.prototype.hasOwnProperty.call(options, 'expandedPathIds')) {
          setExpandedPathIds(options.expandedPathIds || []);
        }

        if (Object.prototype.hasOwnProperty.call(options, 'expandedAreaIds')) {
          setExpandedAreaIds(options.expandedAreaIds || []);
        }
      } else {
        setLearningPathsData([]);
        setErrorMessage('Nao existem Learning Paths disponiveis.');
      }
    } catch (error) {
      console.error('Failed to load learning paths:', error);
      setLearningPathsData([]);
      setErrorMessage('Nao foi possivel carregar os Learning Paths da base de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLearningPaths();
  }, []);

  useEffect(() => {
    if (!learningPathsData.length) {
      return;
    }

    const hasSelectedPath = learningPathsData.some((item) => item.id === selectedPathId);
    if (!hasSelectedPath) {
      setSelectedPathId(learningPathsData[0].id);
    }
  }, [learningPathsData, selectedPathId]);

  useEffect(() => {
    if (!selectedPath || !selectedServiceLineId) {
      return;
    }

    const hasSelectedServiceLine = selectedPath.serviceLines.some((item) => item.id === selectedServiceLineId);
    if (!hasSelectedServiceLine) {
      setSelectedServiceLineId(null);
      setExpandedAreaIds([]);
    }
  }, [selectedPath, selectedServiceLineId]);

  const handleGoBack = () => {
    setSelectedServiceLineId(null);
    setExpandedAreaIds([]);
  };

  const selectServiceLine = (pathId, serviceLineId) => {
    setSelectedPathId(pathId);
    setSelectedServiceLineId(serviceLineId);
    setExpandedAreaIds([]);
    setExpandedPathIds((current) => Array.from(new Set([...current, pathId])));
  };

  const toggleLearningPath = (pathId) => {
    setExpandedPathIds((current) =>
      current.includes(pathId) ? current.filter((id) => id !== pathId) : [...current, pathId],
    );
  };

  const toggleArea = (areaId) => {
    setExpandedAreaIds((current) =>
      current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId],
    );
  };


  const closeEditor = () => {
    setEditor(null);
    setEditorForm(null);
    setEditorError('');
  };

  const openEditor = (payload) => {
    const entity = getEditorEntity(learningPathsData, payload);
    setEditor(payload);
    setEditorForm(buildEditorForm(payload.type, entity));
    setEditorError('');
  };

  const handleSaveEditor = async () => {
    if (!editor || !editorForm || isSaving) {
      return;
    }

    const { type, mode } = editor;
    const trimmedName = normalizeText(editorForm.name);
    const trimmedDescription = normalizeText(editorForm.description);
    const trimmedTitle = normalizeText(editorForm.title);

    if (type !== 'level' && !trimmedName) {
      setEditorError('Indique um nome.');
      return;
    }

    if (type === 'level' && !trimmedTitle) {
      setEditorError('Indique um titulo.');
      return;
    }

    setIsSaving(true);
    setEditorError('');

    try {
      if (type === 'learningPath') {
        if (mode === 'create') {
          const created = await createAdminLearningPath({
            name: trimmedName,
            description: trimmedDescription,
          });
          const newPathId = buildEntityId('learning-path', created.id);
          const nextExpandedPaths = Array.from(new Set([...expandedPathIds, newPathId]));
          await loadLearningPaths({
            pathId: newPathId,
            serviceLineId: null,
            expandedPathIds: nextExpandedPaths,
            expandedAreaIds: [],
          });
          closeEditor();
          return;
        }

        const pathId = getNumericId(editor.pathId);
        if (!pathId) {
          setEditorError('Learning Path invalido.');
          return;
        }

        await updateAdminLearningPath(pathId, {
          name: trimmedName,
          description: trimmedDescription,
        });
        await loadLearningPaths({ pathId: editor.pathId, expandedPathIds });
        closeEditor();
        return;
      }

      if (type === 'serviceLine') {
        const pathId = editor.pathId || selectedPath?.id;
        if (!pathId) {
          setEditorError('Selecione um Learning Path.');
          return;
        }

        const numericPathId = getNumericId(pathId);
        if (!numericPathId) {
          setEditorError('Learning Path invalido.');
          return;
        }

        if (mode === 'create') {
          const created = await createAdminServiceLine(numericPathId, {
            name: trimmedName,
            description: trimmedDescription,
          });
          const newServiceLineId = buildEntityId('service-line', created.id);
          const nextExpandedPaths = Array.from(new Set([...expandedPathIds, pathId]));
          await loadLearningPaths({
            pathId,
            serviceLineId: newServiceLineId,
            expandedPathIds: nextExpandedPaths,
            expandedAreaIds: [],
          });
          closeEditor();
          return;
        }

        const serviceLineId = getNumericId(editor.serviceLineId);
        if (!serviceLineId) {
          setEditorError('Service Line invalida.');
          return;
        }

        await updateAdminServiceLine(serviceLineId, {
          name: trimmedName,
          description: trimmedDescription,
        });
        await loadLearningPaths({ pathId, serviceLineId: editor.serviceLineId, expandedPathIds });
        closeEditor();
        return;
      }

      if (type === 'area') {
        const pathId = editor.pathId || selectedPath?.id;
        const serviceLineId = editor.serviceLineId || selectedServiceLine?.id;

        if (!pathId || !serviceLineId) {
          setEditorError('Selecione uma Service Line.');
          return;
        }

        const numericServiceLineId = getNumericId(serviceLineId);
        if (!numericServiceLineId) {
          setEditorError('Service Line invalida.');
          return;
        }

        if (mode === 'create') {
          const created = await createAdminArea(numericServiceLineId, {
            name: trimmedName,
            description: trimmedDescription,
          });
          const newAreaId = buildEntityId('area', created.id);
          const nextExpanded = Array.from(
            new Set([...expandedAreaIds, buildAreaRowId(serviceLineId, newAreaId)]),
          );
          await loadLearningPaths({
            pathId,
            serviceLineId,
            expandedPathIds,
            expandedAreaIds: nextExpanded,
          });
          closeEditor();
          return;
        }

        const areaId = getNumericId(editor.areaId);
        if (!areaId) {
          setEditorError('Area invalida.');
          return;
        }

        await updateAdminArea(areaId, {
          name: trimmedName,
          description: trimmedDescription,
        });
        await loadLearningPaths({ pathId, serviceLineId, expandedPathIds, expandedAreaIds });
        closeEditor();
        return;
      }

      if (type === 'level') {
        const pathId = editor.pathId || selectedPath?.id;
        const serviceLineId = editor.serviceLineId || selectedServiceLine?.id;
        const areaId = editor.areaId;

        if (!pathId || !serviceLineId || !areaId) {
          setEditorError('Selecione uma area.');
          return;
        }

        const numericAreaId = getNumericId(areaId);
        if (!numericAreaId) {
          setEditorError('Area invalida.');
          return;
        }

        const nextExpanded = Array.from(
          new Set([...expandedAreaIds, buildAreaRowId(serviceLineId, areaId)]),
        );

        if (mode === 'create') {
          await createAdminLevel(numericAreaId, { title: trimmedTitle });
          await loadLearningPaths({
            pathId,
            serviceLineId,
            expandedPathIds,
            expandedAreaIds: nextExpanded,
          });
          closeEditor();
          return;
        }

        const levelId = getNumericId(editor.levelId);
        if (!levelId) {
          setEditorError('Nivel invalido.');
          return;
        }

        await updateAdminLevel(levelId, { title: trimmedTitle });
        await loadLearningPaths({
          pathId,
          serviceLineId,
          expandedPathIds,
          expandedAreaIds: nextExpanded,
        });
        closeEditor();
      }
    } catch (error) {
      setEditorError(error?.message || 'Nao foi possivel guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderLearningPathView = () => {
    if (!learningPathsData.length) {
      return null;
    }

    return (
      <section className="lp-shell">
        <div className="lp-area-list lp-learning-path-list">
          {learningPathsData.map((path) => {
            const isExpanded = expandedPathIds.includes(path.id);

            return (
              <article key={path.id} className={`lp-area-card lp-learning-path-card ${isExpanded ? 'is-expanded' : ''}`}>
                <div
                  role="button"
                  tabIndex={0}
                  className="lp-area-toggle"
                  onClick={() => toggleLearningPath(path.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleLearningPath(path.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={`learning-path-${path.id}`}
                >
                  <div className="lp-path-banner lp-learning-path-banner">
                    <h2>{path.name}</h2>
                    <div className="lp-learning-path-banner-actions">
                      <button
                        type="button"
                        className="lp-admin-text-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditor({ type: 'learningPath', mode: 'edit', pathId: path.id });
                        }}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                      <ChevronDown
                        size={20}
                        className={`lp-area-chevron ${isExpanded ? 'is-open' : ''}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div id={`learning-path-${path.id}`} className="lp-area-badges">
                    <div className="lp-section-title-row lp-admin-section-row">
                      <h3>Service Lines</h3>
                      <div className="lp-admin-inline-actions">
                        <button
                          type="button"
                          className="lp-admin-btn secondary"
                          onClick={() => openEditor({ type: 'serviceLine', mode: 'create', pathId: path.id })}
                        >
                          <Plus size={16} />
                          Nova Service Line
                        </button>
                      </div>
                    </div>

                    <div className="lp-service-line-list">
                      {path.serviceLines.map((serviceLine) => (
                        <article
                          key={serviceLine.id}
                          className="lp-service-line-card lp-admin-service-line-card"
                          role="button"
                          tabIndex={0}
                          onClick={() => selectServiceLine(path.id, serviceLine.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              selectServiceLine(path.id, serviceLine.id);
                            }
                          }}
                        >
                          <div className="lp-service-line-head">
                            <strong>{serviceLine.name}</strong>
                            <div className="lp-admin-service-line-actions">
                              <button
                                type="button"
                                className="lp-admin-text-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditor({
                                    type: 'serviceLine',
                                    mode: 'edit',
                                    pathId: path.id,
                                    serviceLineId: serviceLine.id,
                                  });
                                }}
                              >
                                <Pencil size={16} />
                                Editar
                              </button>
                              <ChevronRight size={24} className="lp-go-icon" aria-hidden="true" />
                            </div>
                          </div>

                          <div className="lp-service-line-body">
                            <img src={serviceLine.image} alt={serviceLine.name} className="lp-service-line-image" />

                            <div className="lp-service-line-main">
                              <p>{serviceLine.description}</p>
                              <span className="lp-progress-label">{(serviceLine.areas || []).length} areas</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  const renderServiceLineView = () => {
    if (!selectedServiceLine || !selectedPath) {
      return null;
    }

    return (
      <section className="lp-shell lp-shell-surface">
        <article className="lp-service-line-hero">
          <img
            src={selectedServiceLine.image}
            alt={selectedServiceLine.name}
            className="lp-service-line-hero-image"
          />

          <div className="lp-service-line-hero-content">
            <div className="lp-admin-hero-head">
              <h2>{selectedServiceLine.name}</h2>
              <button
                type="button"
                className="lp-admin-text-btn"
                onClick={() =>
                  openEditor({
                    type: 'serviceLine',
                    mode: 'edit',
                    pathId: selectedPath.id,
                    serviceLineId: selectedServiceLine.id,
                  })
                }
              >
                <Pencil size={16} />
                Editar
              </button>
            </div>
            <p>{selectedServiceLine.description}</p>
          </div>
        </article>

        <section className="lp-area-shell" aria-label={`Areas da service line ${selectedServiceLine.name}`}>
          <div className="lp-admin-section-row">
            <h3 className="lp-admin-section-title">Areas</h3>
            <div className="lp-admin-inline-actions">
              <button
                type="button"
                className="lp-admin-btn secondary"
                onClick={() =>
                  openEditor({
                    type: 'area',
                    mode: 'create',
                    pathId: selectedPath.id,
                    serviceLineId: selectedServiceLine.id,
                  })
                }
              >
                <Plus size={16} />
                Nova Area
              </button>
            </div>
          </div>

          <div className="lp-area-list">
            {selectedServiceLine.areas.map((area) => {
              const areaRowId = buildAreaRowId(selectedServiceLine.id, area.id);
              const isExpanded = expandedAreaIds.includes(areaRowId);

              return (
                <article key={area.id} className={`lp-area-card ${isExpanded ? 'is-expanded' : ''}`}>
                  <button
                    type="button"
                    className="lp-area-toggle"
                    onClick={() => toggleArea(areaRowId)}
                    aria-expanded={isExpanded}
                    aria-controls={`area-badges-${areaRowId}`}
                  >
                    <div className="lp-area-banner">
                      <strong>{area.name}</strong>

                      <div className="lp-area-banner-actions">
                        <ChevronDown
                          size={20}
                          className={`lp-area-chevron ${isExpanded ? 'is-open' : ''}`}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div id={`area-badges-${areaRowId}`} className="lp-area-badges">
                      <div className="lp-area-content-head lp-admin-area-head">
                        <div className="lp-admin-area-head-copy">
                          <h3>Niveis</h3>
                          <span className="lp-progress-label">{(area.levels || []).length} niveis</span>
                        </div>
                        <div className="lp-admin-inline-actions">
                          <button
                            type="button"
                            className="lp-admin-text-btn"
                            onClick={() =>
                              openEditor({
                                type: 'area',
                                mode: 'edit',
                                pathId: selectedPath.id,
                                serviceLineId: selectedServiceLine.id,
                                areaId: area.id,
                              })
                            }
                          >
                            <Pencil size={16} />
                            Editar area
                          </button>
                          <button
                            type="button"
                            className="lp-admin-btn ghost"
                            onClick={() =>
                              openEditor({
                                type: 'level',
                                mode: 'create',
                                pathId: selectedPath.id,
                                serviceLineId: selectedServiceLine.id,
                                areaId: area.id,
                              })
                            }
                          >
                            <Plus size={16} />
                            Novo nivel
                          </button>
                        </div>
                      </div>

                      <div className="lp-level-list">
                        {(area.levels || []).length === 0 && (
                          <p className="lp-admin-empty">Sem niveis registados.</p>
                        )}
                        {(area.levels || []).map((level) => (
                          <div key={`${area.id}-${level.id}`} className="lp-level-row">
                            <div className="lp-level-copy">
                              <strong>{level.title}</strong>
                              <span>{level.subtitle}</span>
                            </div>
                            <div className="lp-admin-row-actions">
                              <button
                                type="button"
                                className="lp-admin-text-btn"
                                onClick={() =>
                                  openEditor({
                                    type: 'level',
                                    mode: 'edit',
                                    pathId: selectedPath.id,
                                    serviceLineId: selectedServiceLine.id,
                                    areaId: area.id,
                                    levelId: level.id,
                                  })
                                }
                              >
                                <Pencil size={16} />
                                Editar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    );
  };

  const editorTitle = editor
    ? `${editor.mode === 'create' ? 'Novo' : 'Editar'} ${entityLabels[editor.type]}`
    : '';

  return (
    <Layout>
      <div className="learning-paths-page is-classic is-admin">
        <header className="lp-header">
          <div className="lp-header-left">
            {selectedServiceLine && (
              <button type="button" className="lp-back-btn" onClick={handleGoBack} aria-label="Voltar">
                <ArrowLeft size={20} />
              </button>
            )}

            <div className="lp-header-copy">
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="lp-admin-actions">
            <button
              type="button"
              className="lp-admin-btn"
              onClick={() => openEditor({ type: 'learningPath', mode: 'create' })}
            >
              <Plus size={16} />
              Novo Learning Path
            </button>
          </div>
        </header>


        {isLoading && <p className="lp-progress-label">A carregar Learning Paths...</p>}
        {!isLoading && errorMessage && <p className="lp-progress-label">{errorMessage}</p>}

        {!isLoading && !errorMessage && !selectedServiceLine && renderLearningPathView()}
        {!errorMessage && selectedServiceLine && renderServiceLineView()}

        {editor && (
          <div className="lp-admin-modal-overlay" role="presentation" onClick={closeEditor}>
            <div
              className="lp-admin-modal"
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="lp-admin-modal-head">
                <h2>{editorTitle}</h2>
                <button type="button" className="lp-admin-icon-btn" onClick={closeEditor} aria-label="Fechar">
                  <X size={18} />
                </button>
              </header>

              <div className="lp-admin-modal-body">
                <div className="lp-admin-modal-form">
                  {(editor.type === 'learningPath' || editor.type === 'serviceLine' || editor.type === 'area') && (
                    <label>
                      Nome
                      <input
                        type="text"
                        value={editorForm?.name || ''}
                        onChange={(event) =>
                          setEditorForm((current) => ({ ...current, name: event.target.value }))
                        }
                      />
                    </label>
                  )}

                  {(editor.type === 'learningPath' || editor.type === 'serviceLine' || editor.type === 'area') && (
                    <label>
                      Descricao
                      <textarea
                        rows={4}
                        value={editorForm?.description || ''}
                        onChange={(event) =>
                          setEditorForm((current) => ({ ...current, description: event.target.value }))
                        }
                      />
                    </label>
                  )}

                  {editor.type === 'level' && (
                    <label>
                      Titulo
                      <input
                        type="text"
                        value={editorForm?.title || ''}
                        onChange={(event) =>
                          setEditorForm((current) => ({ ...current, title: event.target.value }))
                        }
                      />
                    </label>
                  )}
                </div>

                {editorError && <p className="lp-admin-modal-error">{editorError}</p>}

                <footer className="lp-admin-modal-actions">
                  <button type="button" className="lp-admin-btn secondary" onClick={closeEditor}>
                    Cancelar
                  </button>
                  <button type="button" className="lp-admin-btn" onClick={handleSaveEditor} disabled={isSaving}>
                    Guardar
                  </button>
                </footer>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LearningPathsAG;
