import { useEffect, useMemo, useState } from 'react';
import { Check, Search, ShieldCheck, UserPlus2, X } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/AdminGestor/Utilizadores_AG.css';
import {
  createAdminUser,
  decidePendingUser,
  fetchAdminServiceLines,
  fetchAdminUsers,
  updateAdminUserPermissions,
  updateAdminUserStatus,
} from '../../services/adminUserService';

const PAGE_SIZE = 8;

const accountTypeOptions = [
  { id: 'all', label: 'Todos' },
  { id: 'consultor', label: 'Consultores' },
  { id: 'talent-manager', label: 'Talent Managers' },
  { id: 'service-line-leader', label: 'Service Line Leaders' },
  { id: 'admin-gestor', label: 'Administradores' },
];

const roleLabels = {
  consultor: 'Consultor',
  'talent-manager': 'Talent Manager',
  'service-line-leader': 'Service Line Lider',
  'admin-gestor': 'Administrador',
};

const statusLabels = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  pendente: 'Pendente',
};

const toRoleLabel = (roles) => {
  const list = Array.isArray(roles) ? roles : [];
  if (list.length === 0) {
    return roleLabels.consultor;
  }

  return list.map((role) => roleLabels[role] || role).join(' + ');
};

const toAvatar = (seed) => {
  const normalizedSeed = String(seed || 'user').toLowerCase().replace('@', '.');
  return `https://i.pravatar.cc/120?u=${encodeURIComponent(normalizedSeed)}`;
};

function UtilizadoresAG() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [users, setUsers] = useState([]);
  const [serviceLines, setServiceLines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [page, setPage] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionsModalError, setPermissionsModalError] = useState('');
  const [createModalError, setCreateModalError] = useState('');

  const [createForm, setCreateForm] = useState({
    nome: '',
    email: '',
    senha: '',
    roles: ['consultor'],
    serviceLineIds: [],
  });

  const [permissionsForm, setPermissionsForm] = useState({
    roles: ['consultor'],
    serviceLineIds: [],
  });

  useEffect(() => {
    let isMounted = true;

    const loadInitialCounts = async () => {
      try {
        // Load pending count on initial mount
        const pendingData = await fetchAdminUsers({
          tab: 'pending',
          search: '',
          accountType: 'all',
        });
        if (isMounted) {
          setPendingCount(Array.isArray(pendingData) ? pendingData.length : 0);
        }
      } catch {
        if (isMounted) {
          setPendingCount(0);
        }
      }
    };

    loadInitialCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadServiceLines = async () => {
      try {
        const data = await fetchAdminServiceLines();
        if (isMounted) {
          setServiceLines(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setServiceLines([]);
        }
      }
    };

    loadServiceLines();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminUsers({
          tab: activeTab,
          search: searchTerm,
          accountType,
        });

        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(data) ? data : []);
        
        // Update pending count if loading users tab
        if (activeTab === 'users') {
          try {
            const pendingData = await fetchAdminUsers({
              tab: 'pending',
              search: '',
              accountType: 'all',
            });
            if (isMounted) {
              setPendingCount(Array.isArray(pendingData) ? pendingData.length : 0);
            }
          } catch {
            if (isMounted) {
              setPendingCount(0);
            }
          }
        }
        
        setStatusMessage('');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUsers([]);
        setStatusMessage(error?.message || 'Nao foi possivel carregar os utilizadores.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [activeTab, searchTerm, accountType]);

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, page]);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  
  // Debug: Log pagination info
  console.log('Pagination Debug:', { 
    usersCount: users.length, 
    pageSize: PAGE_SIZE, 
    totalPages, 
    currentPage: page,
    activeTab,
    searchTerm,
    accountType,
    users: users.map(u => ({ id: u.id, nome: u.nome, email: u.email, status: u.status, roles: u.roles }))
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm, accountType]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const toggleRole = (formKey, role) => {
    const setter = formKey === 'create' ? setCreateForm : setPermissionsForm;

    setter((current) => {
      const hasRole = current.roles.includes(role);
      const nextRoles = hasRole
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role];

      return {
        ...current,
        roles: nextRoles.length > 0 ? nextRoles : ['consultor'],
      };
    });
  };

  const toggleServiceLine = (formKey, serviceLineId) => {
    const setter = formKey === 'create' ? setCreateForm : setPermissionsForm;

    setter((current) => {
      const hasId = current.serviceLineIds.includes(serviceLineId);
      const nextIds = hasId
        ? current.serviceLineIds.filter((id) => id !== serviceLineId)
        : [...current.serviceLineIds, serviceLineId];

      return {
        ...current,
        serviceLineIds: nextIds,
      };
    });
  };

  const refreshUsers = async () => {
    const data = await fetchAdminUsers({
      tab: activeTab,
      search: searchTerm,
      accountType,
    });
    setUsers(Array.isArray(data) ? data : []);
  };

  const handleCreateUser = async () => {
    // Clear previous errors
    setCreateModalError('');

    if (!createForm.nome.trim() || !createForm.email.trim() || !createForm.senha.trim()) {
      setCreateModalError('Preencha nome, email e password.');
      return;
    }

    // Validation for Service Line Leader role - only one service line (priority check)
    if (createForm.roles.includes('service-line-leader') && createForm.serviceLineIds.length > 1) {
      setCreateModalError('Service Line Leader só pode ser associado a uma Service Line.');
      return;
    }

    // Validation for Service Line Leader role - at least one service line
    if (createForm.roles.includes('service-line-leader') && createForm.serviceLineIds.length === 0) {
      setCreateModalError('Service Line Leader deve ter pelo menos uma Service Line atribuída.');
      return;
    }

    // Validation for duplicate email
    const existingUser = users.find(user => 
      user.email.toLowerCase() === createForm.email.toLowerCase().trim()
    );
    if (existingUser) {
      setCreateModalError('Já existe um utilizador com este email.');
      return;
    }

    // Validation for duplicate Service Line Leader
    if (createForm.roles.includes('service-line-leader') && createForm.serviceLineIds.length > 0) {
      for (const serviceLineId of createForm.serviceLineIds) {
        const existingSLL = users.find(user => 
          user.roles.includes('service-line-leader') &&
          user.serviceLines && 
          user.serviceLines.some(sl => {
            const serviceLine = serviceLines.find(line => line.id === serviceLineId);
            return serviceLine && sl === serviceLine.name;
          })
        );
        
        if (existingSLL) {
          setCreateModalError(`Esta Service Line já tem um Service Line Leader: ${existingSLL.nome}`);
          return;
        }
      }
    }

    try {
      setIsSaving(true);
      await createAdminUser({
        nome: createForm.nome,
        email: createForm.email,
        senha: createForm.senha,
        roles: createForm.roles,
        serviceLineIds: createForm.serviceLineIds,
      });

      setShowCreateModal(false);
      setCreateForm({
        nome: '',
        email: '',
        senha: '',
        roles: ['consultor'],
        serviceLineIds: [],
      });

      await refreshUsers();
      setStatusMessage('Utilizador criado com sucesso.');
    } catch (error) {
      setStatusMessage(error?.message || 'Nao foi possivel criar utilizador.');
    } finally {
      setIsSaving(false);
    }
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setPermissionsModalError(''); // Clear previous errors
    setPermissionsForm({
      roles: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : ['consultor'],
      serviceLineIds: serviceLines
        .filter((line) => (user.serviceLines || []).includes(line.name))
        .map((line) => Number(line.id)),
    });
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) {
      return;
    }

    // Validation for Service Line Leader role - only one service line (priority check)
    if (permissionsForm.roles.includes('service-line-leader') && permissionsForm.serviceLineIds.length > 1) {
      setPermissionsModalError('Service Line Leader só pode ser associado a uma Service Line.');
      return;
    }

    // Validation for Service Line Leader role - at least one service line
    if (permissionsForm.roles.includes('service-line-leader') && permissionsForm.serviceLineIds.length === 0) {
      setPermissionsModalError('Service Line Leader deve ter pelo menos uma Service Line atribuída.');
      return;
    }

    // Validation for duplicate Service Line Leader
    if (permissionsForm.roles.includes('service-line-leader') && permissionsForm.serviceLineIds.length > 0) {
      for (const serviceLineId of permissionsForm.serviceLineIds) {
        const existingSLL = users.find(user => 
          user.id !== selectedUser.id && 
          user.roles.includes('service-line-leader') &&
          user.serviceLines && 
          user.serviceLines.some(sl => {
            const serviceLine = serviceLines.find(line => line.id === serviceLineId);
            return serviceLine && sl === serviceLine.name;
          })
        );
        
        if (existingSLL) {
          setPermissionsModalError(`Esta Service Line já tem um Service Line Leader: ${existingSLL.nome}`);
          return;
        }
      }
    }

    try {
      setIsSaving(true);
      await updateAdminUserPermissions(selectedUser.id, {
        roles: permissionsForm.roles,
        serviceLineIds: permissionsForm.serviceLineIds,
      });
      await refreshUsers();
      setShowPermissionsModal(false);
      setSelectedUser(null);
      setStatusMessage('Permissoes atualizadas com sucesso.');
    } catch (error) {
      setStatusMessage(error?.message || 'Nao foi possivel atualizar permissoes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateUser = async (user) => {
    const userStatus = String(user.status).toLowerCase();
    const isInactive = userStatus === 'inativo';
    const isActive = userStatus === 'ativo';

    if (!isActive && !isInactive) {
      return;
    }

    try {
      setIsSaving(true);
      const newStatus = isActive ? 'inativo' : 'ativo';
      await updateAdminUserStatus(user.id, { status: newStatus });
      await refreshUsers();
      const message = isActive ? 'Conta desativada com sucesso.' : 'Conta reativada com sucesso.';
      setStatusMessage(message);
    } catch (error) {
      const message = isActive ? 'Nao foi possivel desativar a conta.' : 'Nao foi possivel reativar a conta.';
      setStatusMessage(error?.message || message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePendingDecision = async (userId, decision) => {
    try {
      setIsSaving(true);
      await decidePendingUser(userId, { decision });
      await refreshUsers();
      setStatusMessage(decision === 'approve' ? 'Pedido aprovado.' : 'Pedido rejeitado.');
    } catch (error) {
      setStatusMessage(error?.message || 'Nao foi possivel processar o pedido.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="ag-users-page">
        <header className="ag-users-header">
          <h1>Utilizadores</h1>
        </header>

        <section className="ag-users-card">
          <div className="ag-users-tabs" role="tablist" aria-label="Separadores de utilizadores">
            <button
              type="button"
              role="tab"
              className={`ag-users-tab ${activeTab === 'users' ? 'active' : ''}`}
              aria-selected={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            >
              Utilizadores
            </button>
            <button
              type="button"
              role="tab"
              className={`ag-users-tab ${activeTab === 'pending' ? 'active' : ''}`}
              aria-selected={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
            >
              Pedidos Pendentes
              <span className="ag-users-tab-badge">{pendingCount}</span>
            </button>
          </div>

          <div className="ag-users-toolbar">
            <label className="ag-users-search" htmlFor="ag-users-search-input">
              <Search size={18} />
              <input
                id="ag-users-search-input"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={activeTab === 'pending' ? 'Pesquisar pedido' : 'Pesquisar utilizador'}
              />
            </label>

            {activeTab === 'users' && (
              <>
                <select
                  className="ag-users-type-select"
                  value={accountType}
                  onChange={(event) => setAccountType(event.target.value)}
                >
                  {accountTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="ag-users-primary-btn"
                  onClick={() => {
                  setCreateModalError('');
                  setShowCreateModal(true);
                }}
                >
                  <UserPlus2 size={16} />
                  Adicionar Utilizador
                </button>
              </>
            )}
          </div>

          {statusMessage && (
            <p className="ag-users-status" role="status">
              {statusMessage}
            </p>
          )}

          <div className="ag-users-table-wrap">
            <table className="ag-users-table">
              <thead>
                {activeTab === 'users' ? (
                  <tr>
                    <th>Nome</th>
                    <th>Entrada</th>
                    <th>Tipo</th>
                    <th>Pontos</th>
                    <th>Badges</th>
                    <th>Estado</th>
                    <th>Acoes</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Nome</th>
                    <th>Data do Pedido</th>
                    <th>Acoes</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td className="ag-users-empty" colSpan={activeTab === 'users' ? 7 : 3}>
                      A carregar...
                    </td>
                  </tr>
                )}

                {!isLoading && pagedUsers.length === 0 && (
                  <tr>
                    <td className="ag-users-empty" colSpan={activeTab === 'users' ? 7 : 3}>
                      Sem resultados.
                    </td>
                  </tr>
                )}

                {!isLoading && pagedUsers.map((user) => (
                  activeTab === 'users'
                    ? (
                      <tr key={user.id}>
                        <td>
                          <div className="ag-users-name-cell">
                            <img src={toAvatar(user.email)} alt={user.nome} />
                            <div>
                              <strong>{user.nome}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.joinedAt}</td>
                        <td>{toRoleLabel(user.roles)}</td>
                        <td className="ag-users-number">{user.points}</td>
                        <td className="ag-users-number">{user.badges}</td>
                        <td>
                          <span className={`ag-user-status ${String(user.status).toLowerCase()}`}>
                            {statusLabels[String(user.status).toLowerCase()] || user.status}
                          </span>
                        </td>
                        <td>
                          <div className="ag-users-actions">
                            <button
                              type="button"
                              className="ag-users-outline-btn"
                              onClick={() => openPermissionsModal(user)}
                            >
                              <ShieldCheck size={14} />
                              Editar permissoes
                            </button>
                            <button
                              type="button"
                              className={`${String(user.status).toLowerCase() === 'ativo' ? 'ag-users-danger-btn' : 'ag-users-success-btn'}`}
                              disabled={!['ativo', 'inativo'].includes(String(user.status).toLowerCase()) || isSaving}
                              onClick={() => handleDeactivateUser(user)}
                            >
                              {String(user.status).toLowerCase() === 'inativo' ? 'Reativar conta' : 'Desativar conta'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                    : (
                      <tr key={user.id}>
                        <td>
                          <div className="ag-users-name-cell">
                            <img src={toAvatar(user.email)} alt={user.nome} />
                            <div>
                              <strong>{user.nome}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.joinedAt}</td>
                        <td>
                          <div className="ag-users-actions">
                            <button
                              type="button"
                              className="ag-users-reject-btn"
                              onClick={() => handlePendingDecision(user.id, 'reject')}
                            >
                              Rejeitar
                            </button>
                            <button
                              type="button"
                              className="ag-users-approve-btn"
                              onClick={() => handlePendingDecision(user.id, 'approve')}
                            >
                              Aprovar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <footer className="ag-users-pagination">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={page === pageNum ? 'current' : ''}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                &gt;
              </button>
            </footer>
          )}
        </section>

        {showCreateModal && (
          <div className="ag-users-modal-overlay" role="dialog" aria-modal="true">
            <div className="ag-users-modal-card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="ag-users-modal-head">
                <h2>Adicionar Utilizador</h2>
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  <X size={18} />
                </button>
              </div>

              {createModalError ? (
                <div className="ag-users-note" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#b91c1c' }}>
                  {createModalError}
                </div>
              ) : (
                <div className="ag-users-note">
                  Preencha os dados do novo utilizador. Para Service Line Leader, selecione também a Service Line.
                </div>
              )}

              <label htmlFor="ag-create-nome">Nome</label>
              <input
                id="ag-create-nome"
                value={createForm.nome}
                onChange={(event) => setCreateForm((current) => ({ ...current, nome: event.target.value }))}
                placeholder="Nome do utilizador"
              />

              <label htmlFor="ag-create-email">Email</label>
              <input
                id="ag-create-email"
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="utilizador@softinsa.pt"
              />

              <label htmlFor="ag-create-password">Password</label>
              <input
                id="ag-create-password"
                type="password"
                value={createForm.senha}
                onChange={(event) => setCreateForm((current) => ({ ...current, senha: event.target.value }))}
                placeholder="Defina uma password"
              />

              <div className="ag-users-roles-box">
                <strong>Tipos de Conta</strong>
                {Object.entries(roleLabels).map(([roleId, roleLabel]) => (
                  <label key={roleId} className="ag-users-check-row">
                    <input
                      type="checkbox"
                      checked={createForm.roles.includes(roleId)}
                      onChange={() => toggleRole('create', roleId)}
                    />
                    <span>{roleLabel}</span>
                  </label>
                ))}
              </div>

              {createForm.roles.includes('service-line-leader') && (
                <div className="ag-users-roles-box">
                  <strong>Service Lines</strong>
                  {serviceLines.map((line) => (
                    <label key={line.id} className="ag-users-check-row">
                      <input
                        type="checkbox"
                        checked={createForm.serviceLineIds.includes(Number(line.id))}
                        onChange={() => toggleServiceLine('create', Number(line.id))}
                      />
                      <span>{line.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="ag-users-modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="primary" onClick={handleCreateUser} disabled={isSaving}>
                  <Check size={16} />
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}

        {showPermissionsModal && selectedUser && (
          <div className="ag-users-modal-overlay" role="dialog" aria-modal="true">
            <div className="ag-users-modal-card wide" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="ag-users-modal-head">
                <div>
                  <h2>Editar Permissoes de Acesso</h2>
                  <p>{selectedUser.nome}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {permissionsModalError ? (
                <div className="ag-users-note" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#b91c1c' }}>
                  {permissionsModalError}
                </div>
              ) : (
                <div className="ag-users-note">
                  Selecione os tipos de conta. Para Service Line Lider, selecione tambem a(s) Service Line(s).
                </div>
              )}

              <div className="ag-users-roles-box">
                <strong>Tipos de Conta</strong>
                {Object.entries(roleLabels).map(([roleId, roleLabel]) => (
                  <label key={roleId} className="ag-users-check-row">
                    <input
                      type="checkbox"
                      checked={permissionsForm.roles.includes(roleId)}
                      onChange={() => toggleRole('permissions', roleId)}
                    />
                    <span>{roleLabel}</span>
                  </label>
                ))}
              </div>

              {permissionsForm.roles.includes('service-line-leader') && (
                <div className="ag-users-roles-box">
                  <strong>Service Lines</strong>
                  {serviceLines.map((line) => (
                    <label key={line.id} className="ag-users-check-row">
                      <input
                        type="checkbox"
                        checked={permissionsForm.serviceLineIds.includes(Number(line.id))}
                        onChange={() => toggleServiceLine('permissions', Number(line.id))}
                      />
                      <span>{line.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="ag-users-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="button" className="primary" onClick={handleSavePermissions} disabled={isSaving}>
                  Guardar Alteracoes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UtilizadoresAG;
