import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRoundPlus,
  X,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/AdminGestor/EquipasSLA_AG.css';

const initialTeamPool = [
  {
    id: 'team-1',
    name: 'Equipa 1',
    membersCount: 15,
    slaDescription: 'Implementacao completa do novo sistema de autenticacao com suporte a OAuth2 e SSO',
    fullDescription: 'Equipa de desenvolvimento frontend responsavel por interfaces e experiencia do usuario',
    expiryDate: '13/01/2026',
    daysLabel: 'Expira em breve',
    priority: 'warning',
    members: [
      { id: 'lr', name: 'Lara Rocha' },
      { id: 'js', name: 'Joao Silva' },
      { id: 'ms', name: 'Maria Santos' },
      { id: 'pc', name: 'Pedro Costa' },
      { id: 'am', name: 'Ana Martins' },
      { id: 'cf', name: 'Carlos Ferreira' },
      { id: 'sl', name: 'Sofia Lima' },
      { id: 'rs', name: 'Ricardo Soares' },
      { id: 'ba', name: 'Beatriz Alves' },
      { id: 'mp', name: 'Miguel Pereira' },
      { id: 'cd', name: 'Catarina Dias' },
      { id: 'rc', name: 'Rita Carvalho' },
      { id: 'ng', name: 'Nuno Gomes' },
      { id: 'tf', name: 'Tiago Fernandes' },
      { id: 'lm', name: 'Luisa Monteiro' },
    ],
  },
  {
    id: 'team-2',
    name: 'Equipa 2',
    membersCount: 7,
    slaDescription: 'Migracao da base de dados para PostgreSQL e otimizacao de queries criticas',
    fullDescription: 'Equipa de backend e infraestrutura focada em APIs e bases de dados',
    expiryDate: '14/01/2026',
    daysLabel: 'Expira em breve',
    priority: 'critical',
    members: [
      { id: 'ap', name: 'Andre Pinto' },
      { id: 'jl', name: 'Joana Lopes' },
      { id: 'mr', name: 'Miguel Reis' },
      { id: 'dv', name: 'Daniela Vieira' },
      { id: 'pm', name: 'Paulo Matos' },
      { id: 'es', name: 'Eduardo Sousa' },
      { id: 'im', name: 'Ines Moreira' },
    ],
  },
];

const selectableMembers = [
  { id: 'm-1', name: 'Lara Rocha' },
  { id: 'm-2', name: 'Joao Silva' },
  { id: 'm-3', name: 'Maria Santos' },
  { id: 'm-4', name: 'Pedro Costa' },
  { id: 'm-5', name: 'Ana Martins' },
  { id: 'm-6', name: 'Carlos Ferreira' },
  { id: 'm-7', name: 'Sofia Lima' },
  { id: 'm-8', name: 'Ricardo Soares' },
  { id: 'm-9', name: 'Beatriz Alves' },
  { id: 'm-10', name: 'Miguel Pereira' },
  { id: 'm-11', name: 'Catarina Dias' },
  { id: 'm-12', name: 'Rita Carvalho' },
  { id: 'm-13', name: 'Nuno Gomes' },
  { id: 'm-14', name: 'Tiago Fernandes' },
  { id: 'm-15', name: 'Luisa Monteiro' },
  { id: 'm-16', name: 'Andre Pinto' },
  { id: 'm-17', name: 'Joana Lopes' },
  { id: 'm-18', name: 'Miguel Reis' },
  { id: 'm-19', name: 'Daniela Vieira' },
  { id: 'm-20', name: 'Paulo Matos' },
];

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const getMemberAvatarUrl = (name) => `https://i.pravatar.cc/120?u=${encodeURIComponent(name)}`;

const getMemberAvatarFallback = (name) => {
  const initials = getInitials(name) || 'U';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><circle cx='60' cy='60' r='60' fill='#ede9fe'/><text x='50%' y='55%' text-anchor='middle' font-size='40' font-family='Arial, sans-serif' fill='#6d28d9' font-weight='700'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const onMemberAvatarError = (event, name) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = getMemberAvatarFallback(name);
};

const getIsoDateFromDisplay = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const [day, month, year] = dateValue.split('/');
  if (!day || !month || !year) {
    return '';
  }

  return `${year}-${month}-${day}`;
};

const getMemberIdsFromTeam = (members) =>
  members
    .map((member) => selectableMembers.find((candidate) => candidate.name === member.name)?.id)
    .filter(Boolean);

function EquipasSLAAG() {
  const [teams, setTeams] = useState(initialTeamPool);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newSlaText, setNewSlaText] = useState('');
  const [newSlaDate, setNewSlaDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showAddMemberList, setShowAddMemberList] = useState(false);

  const alertTeams = useMemo(() => teams.slice(0, 2), [teams]);
  const isEditing = Boolean(editingTeamId);

  const selectedMemberObjects = useMemo(
    () => selectableMembers.filter((member) => selectedMembers.includes(member.id)),
    [selectedMembers],
  );

  const availableMembers = useMemo(
    () => selectableMembers.filter((member) => !selectedMembers.includes(member.id)),
    [selectedMembers],
  );

  const filteredMembers = useMemo(() => {
    const normalizedTerm = memberSearchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return availableMembers;
    }

    return availableMembers.filter((member) => member.name.toLowerCase().includes(normalizedTerm));
  }, [availableMembers, memberSearchTerm]);

  const openCreateModal = () => {
    setEditingTeamId(null);
    setNewTeamName('');
    setNewSlaText('');
    setNewSlaDate('');
    setSelectedMembers([]);
    setMemberSearchTerm('');
    setShowAddMemberList(false);
    setModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeamId(team.id);
    setNewTeamName(team.name);
    setNewSlaText(team.slaDescription);
    setNewSlaDate(getIsoDateFromDisplay(team.expiryDate));
    setSelectedMembers(getMemberIdsFromTeam(team.members || []));
    setMemberSearchTerm('');
    setShowAddMemberList(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTeamId(null);
    setNewTeamName('');
    setNewSlaText('');
    setNewSlaDate('');
    setSelectedMembers([]);
    setMemberSearchTerm('');
    setShowAddMemberList(false);
  };

  const addMemberToSelection = (memberId) => {
    setSelectedMembers((current) => {
      if (current.includes(memberId)) {
        return current;
      }

      return [...current, memberId];
    });
  };

  const removeMemberFromSelection = (memberId) => {
    setSelectedMembers((current) => current.filter((id) => id !== memberId));
  };

  const formatInputDate = (dateValue) => {
    if (!dateValue) {
      return '';
    }

    const [year, month, day] = dateValue.split('-');
    if (!year || !month || !day) {
      return '';
    }

    return `${day}/${month}/${year}`;
  };

  const handleDeleteTeam = (team) => {
    const confirmed = window.confirm(`Tem a certeza que pretende remover a equipa ${team.name}?`);
    if (!confirmed) {
      return;
    }

    setTeams((current) => current.filter((candidate) => candidate.id !== team.id));
  };

  const handleSaveTeam = () => {
    if (!newTeamName.trim() || !newSlaText.trim()) {
      return;
    }

    const selectedPool = selectableMembers.filter((member) => selectedMembers.includes(member.id));

    if (isEditing) {
      setTeams((current) =>
        current.map((team) => {
          if (team.id !== editingTeamId) {
            return team;
          }

          return {
            ...team,
            name: newTeamName.trim(),
            membersCount: selectedPool.length,
            slaDescription: newSlaText.trim(),
            expiryDate: formatInputDate(newSlaDate),
            members: selectedPool,
          };
        }),
      );

      closeModal();
      return;
    }

    const createdTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      membersCount: selectedPool.length,
      slaDescription: newSlaText.trim(),
      fullDescription: 'Equipa criada para acompanhamento de SLA e entregas prioritarias.',
      expiryDate: formatInputDate(newSlaDate),
      daysLabel: 'Recem criado',
      priority: 'warning',
      members: selectedPool,
    };

    setTeams((current) => [createdTeam, ...current]);
    closeModal();
  };

  return (
    <Layout>
      <div className="ag-teams-page">
        <header className="ag-teams-header">
          <h1>Equipas e SLA</h1>
        </header>

        <section className="ag-sla-alerts-card">
          <h2>
            <AlertTriangle size={20} />
            SLAs prestes a expirar/expirados
          </h2>

          <div className="ag-sla-cards-grid">
            {alertTeams.map((team) => (
              <article key={`${team.id}-alert`} className="ag-sla-team-card">
                <div className="ag-sla-team-card-head">
                  <h3>{team.name}</h3>
                  <button
                    type="button"
                    aria-label={`Editar ${team.name}`}
                    className="ag-inline-icon-btn"
                    onClick={() => openEditModal(team)}
                  >
                    <Pencil size={15} />
                  </button>
                </div>

                <span className={`ag-sla-status-pill ${team.priority}`}>{team.daysLabel}</span>
                <p>{team.slaDescription}</p>

                <div className="ag-sla-date">
                  <CalendarDays size={15} />
                  <span>{team.expiryDate}</span>
                </div>

                <button type="button" className="ag-notify-btn">
                  <Bell size={14} />
                  Notificar equipa
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="ag-teams-list-card">
          <div className="ag-teams-list-header">
            <h2>
              <UserRoundPlus size={20} />
              Equipas
            </h2>

            <button type="button" className="ag-add-team-btn" onClick={openCreateModal}>
              <Plus size={16} />
              Adicionar equipa
            </button>
          </div>

          <div className="ag-team-list">
            {teams.map((team) => {
              const visibleMembers = team.members.slice(0, 11);
              const hiddenMembers = Math.max(0, team.members.length - visibleMembers.length);

              return (
                <article key={team.id} className="ag-team-row-card">
                  <div className="ag-team-row-top">
                    <div>
                      <h3>
                        {team.name}{' '}
                        <span className="ag-members-count-pill">{team.membersCount} membros</span>
                      </h3>
                      <p>{team.fullDescription}</p>
                    </div>

                    <div className="ag-team-actions">
                      <button
                        type="button"
                        aria-label={`Editar ${team.name}`}
                        className="ag-inline-icon-btn"
                        onClick={() => openEditModal(team)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar ${team.name}`}
                        className="ag-inline-icon-btn danger"
                        onClick={() => handleDeleteTeam(team)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="ag-member-badges-row" role="list" aria-label={`Membros da ${team.name}`}>
                    {visibleMembers.map((member) => (
                      <div key={member.id} className="ag-member-pill" role="listitem" title={member.name}>
                        <img
                          src={getMemberAvatarUrl(member.name)}
                          alt={member.name}
                          className="ag-member-avatar ag-member-avatar-pill"
                          onError={(event) => onMemberAvatarError(event, member.name)}
                        />
                        <small>{member.name}</small>
                      </div>
                    ))}

                    {hiddenMembers > 0 && <div className="ag-member-pill ag-more-pill">+{hiddenMembers}</div>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {modalOpen && (
          <div className="ag-team-modal-overlay" role="presentation" onClick={closeModal}>
            <section
              className="ag-team-modal"
              role="dialog"
              aria-modal="true"
              aria-label={isEditing ? 'Editar equipa' : 'Adicionar nova equipa'}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="ag-team-modal-close" onClick={closeModal} aria-label="Fechar">
                <X size={18} />
              </button>

              <div className="ag-team-modal-grid">
                <div className="ag-team-form-column">
                  <label htmlFor="team-name">Nome de equipa</label>
                  <input
                    id="team-name"
                    value={newTeamName}
                    onChange={(event) => setNewTeamName(event.target.value)}
                    placeholder="Insira nome da equipa"
                  />

                  <label htmlFor="team-sla">Service Level Agreement</label>
                  <textarea
                    id="team-sla"
                    value={newSlaText}
                    onChange={(event) => setNewSlaText(event.target.value)}
                    placeholder="Insira os detalhes do SLA"
                    rows={6}
                  />

                  <label htmlFor="team-expiry">Data de expiracao do SLA</label>
                  <input
                    id="team-expiry"
                    type="date"
                    value={newSlaDate}
                    onChange={(event) => setNewSlaDate(event.target.value)}
                  />
                </div>

                <div className="ag-member-picker-column">
                  <div className="ag-member-picker-head">
                    <h3>{showAddMemberList ? 'Adicionar pessoas' : 'Pessoas selecionadas'}</h3>
                    <button
                      type="button"
                      className={`ag-member-add-tile ${showAddMemberList ? 'active' : ''}`}
                      aria-label="Adicionar pessoa"
                      aria-expanded={showAddMemberList}
                      onClick={() => setShowAddMemberList((current) => !current)}
                    >
                      <Plus size={22} />
                    </button>
                  </div>

                  {showAddMemberList ? (
                    <div className="ag-member-picker-add-panel">
                      <label htmlFor="member-search" className="ag-member-search-wrap">
                        <Search size={14} />
                        <input
                          id="member-search"
                          type="text"
                          value={memberSearchTerm}
                          onChange={(event) => setMemberSearchTerm(event.target.value)}
                          placeholder="Pesquisar pessoa para adicionar"
                        />
                      </label>

                      <div className="ag-member-picker-list" role="list" aria-label="Lista de pessoas para adicionar">
                        {filteredMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            className="ag-member-select-card"
                            onClick={() => addMemberToSelection(member.id)}
                          >
                            <img
                              src={getMemberAvatarUrl(member.name)}
                              alt={member.name}
                              className="ag-member-avatar ag-member-avatar-card"
                              onError={(event) => onMemberAvatarError(event, member.name)}
                            />
                            <span>{member.name}</span>
                          </button>
                        ))}

                        {filteredMembers.length === 0 && (
                          <p className="ag-member-search-empty">Nenhuma pessoa disponivel para adicionar.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="ag-selected-member-list" role="list" aria-label="Membros selecionados da equipa">
                      {selectedMemberObjects.map((member) => (
                        <article key={member.id} className="ag-member-selected-card" role="listitem">
                          <img
                            src={getMemberAvatarUrl(member.name)}
                            alt={member.name}
                            className="ag-member-avatar ag-member-avatar-card"
                            onError={(event) => onMemberAvatarError(event, member.name)}
                          />
                          <span>{member.name}</span>
                          <button
                            type="button"
                            className="ag-member-remove-btn"
                            onClick={() => removeMemberFromSelection(member.id)}
                            aria-label={`Remover ${member.name}`}
                          >
                            Remover
                          </button>
                        </article>
                      ))}

                      {selectedMemberObjects.length === 0 && (
                        <p className="ag-member-search-empty">Nenhuma pessoa selecionada.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <footer className="ag-team-modal-footer">
                <button type="button" className="ag-modal-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="button" className="ag-modal-submit" onClick={handleSaveTeam}>
                  {isEditing ? 'Guardar alteracoes' : 'Adicionar'}
                </button>
              </footer>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default EquipasSLAAG;