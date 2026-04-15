import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  AlarmClock,
  CalendarDays,
  Pencil,
  Trash2,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/Consultor/Lembretes.css';

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const formatReminderDate = (value) => {
  if (!isIsoDate(value)) {
    return value;
  }

  const [year, month, day] = value.split('-').map(Number);
  return `${String(day).padStart(2, '0')} ${monthLabels[month - 1]} ${year}`;
};

const colorOptions = [
  { id: 'green', card: '#4cd07d', pill: '#4cd07d' },
  { id: 'yellow', card: '#f4c20d', pill: '#f4c20d' },
  { id: 'blue', card: '#1f8fe5', pill: '#1f8fe5' },
  { id: 'purple', card: '#9851e8', pill: '#9851e8' },
];

const initialReminders = [
  {
    id: 1,
    title: 'Conferir requisitos enviados.',
    description: 'Rever todos os requisitos do novo projeto',
    date: '2025-12-07',
    color: 'green',
  },
  {
    id: 2,
    title: 'Badge "C++ Mastery" expira em 30 dias.',
    description: 'Renovar certificacao antes do prazo',
    date: '2025-11-29',
    color: 'yellow',
  },
  {
    id: 3,
    title: 'Lembrete: Meta de 15 badges ate ao fim do mes.',
    description: 'Completar badges restantes para atingir a meta',
    date: '2025-11-27',
    color: 'blue',
  },
  {
    id: 4,
    title: 'Reuniao de equipa trimestral',
    description: 'Preparar apresentacao dos resultados',
    date: '2026-01-15',
    color: 'purple',
  },
];

const defaultFormState = {
  title: '',
  description: '',
  date: '',
  color: 'green',
};

function Lembretes() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(initialReminders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [errors, setErrors] = useState({});

  const modalTitle = editingId ? 'Editar Lembrete' : 'Novo Lembrete';
  const saveLabel = editingId ? 'Salvar Alteracoes' : 'Criar Lembrete';

  const colorLookup = useMemo(
    () => colorOptions.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
    []
  );

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/consultor/dashboard');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultFormState);
    setErrors({});
  };

  const openNewReminderModal = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const openEditReminderModal = (reminder) => {
    setEditingId(reminder.id);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      color: reminder.color,
    });
    setIsModalOpen(true);
  };

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const onColorSelect = (colorId) => {
    setFormData((prev) => ({ ...prev, color: colorId }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'O titulo e obrigatorio.';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'A descricao e obrigatoria.';
    }

    if (!isIsoDate(formData.date)) {
      nextErrors.date = 'A data e obrigatoria.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSaveReminder = () => {
    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();
    const selectedDate = formData.date;

    if (!validateForm()) {
      return;
    }

    if (editingId) {
      setReminders((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: trimmedTitle,
                description: trimmedDescription,
                date: selectedDate,
                color: formData.color,
              }
            : item
        )
      );

      closeModal();
      return;
    }

    const nextId = reminders.length > 0 ? Math.max(...reminders.map((item) => item.id)) + 1 : 1;

    setReminders((prev) => [
      {
        id: nextId,
        title: trimmedTitle,
        description: trimmedDescription,
        date: selectedDate,
        color: formData.color,
      },
      ...prev,
    ]);

    closeModal();
  };

  const onDeleteReminder = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Layout>
      <div className="reminders-page">
        <header className="reminders-header">
          <button type="button" className="reminders-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <h1>Lembretes</h1>
        </header>

        <section className="reminders-shell">
          <button type="button" className="reminders-new-btn" onClick={openNewReminderModal}>
            <Plus size={18} />
            <span>Novo Lembrete</span>
          </button>

          <div className="reminders-list">
            {reminders.map((reminder) => {
              const currentColor = colorLookup[reminder.color] || colorLookup.green;

              return (
                <article key={reminder.id} className="reminder-card" style={{ borderLeftColor: currentColor.card }}>
                  <div className="reminder-icon" style={{ backgroundColor: currentColor.pill }}>
                    <AlarmClock size={18} strokeWidth={2} />
                  </div>

                  <div className="reminder-content">
                    <h3>{reminder.title}</h3>
                    <p>{reminder.description}</p>
                    <div className="reminder-date">
                      <CalendarDays size={14} />
                      <span>{formatReminderDate(reminder.date)}</span>
                    </div>
                  </div>

                  <div className="reminder-actions">
                    <button
                      type="button"
                      className="reminder-icon-btn"
                      aria-label="Editar lembrete"
                      onClick={() => openEditReminderModal(reminder)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="reminder-icon-btn"
                      aria-label="Apagar lembrete"
                      onClick={() => onDeleteReminder(reminder.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {isModalOpen && (
          <div className="reminder-modal-overlay" onClick={closeModal}>
            <div className="reminder-modal" onClick={(event) => event.stopPropagation()}>
              <h2>{modalTitle}</h2>

              <label htmlFor="reminder-title">Titulo</label>
              <input
                id="reminder-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Digite o titulo do lembrete"
                className={errors.title ? 'reminder-input-error' : ''}
              />
              {errors.title && <span className="reminder-field-error">{errors.title}</span>}

              <label htmlFor="reminder-description">Descricao</label>
              <textarea
                id="reminder-description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                placeholder="Digite a descricao do lembrete"
                rows={3}
                className={errors.description ? 'reminder-input-error' : ''}
              />
              {errors.description && <span className="reminder-field-error">{errors.description}</span>}

              <label htmlFor="reminder-date">Data</label>
              <input
                id="reminder-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={onInputChange}
                className={errors.date ? 'reminder-input-error' : ''}
              />
              {errors.date && <span className="reminder-field-error">{errors.date}</span>}

              <label>Cor</label>
              <div className="reminder-color-picker" role="radiogroup" aria-label="Cor do lembrete">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`reminder-color-dot ${formData.color === color.id ? 'active' : ''}`}
                    style={{ backgroundColor: color.pill }}
                    onClick={() => onColorSelect(color.id)}
                    aria-label={`Selecionar cor ${color.id}`}
                  />
                ))}
              </div>

              <div className="reminder-modal-actions">
                <button type="button" className="reminder-cancel-btn" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="button" className="reminder-save-btn" onClick={onSaveReminder}>
                  {saveLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Lembretes;