import { useMemo, useRef, useState } from 'react';
import { Paperclip, Search, SendHorizontal, UploadCloud, UserRoundPlus, X } from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/AdminGestor/ComunicadosAvisos_AG.css';

const recipientsDirectory = [
  { id: 'u-1', name: 'João Gomes', role: 'consultor', serviceLine: 'LowCode' },
  { id: 'u-2', name: 'Maria Santos', role: 'consultor', serviceLine: 'Cloud' },
  { id: 'u-3', name: 'Pedro Mendes', role: 'consultor', serviceLine: 'Cloud' },
  { id: 'u-4', name: 'Ana Costa', role: 'consultor', serviceLine: 'Data & AI' },
  { id: 'u-5', name: 'Carlos Ferreira', role: 'consultor', serviceLine: 'Cybersecurity' },
  { id: 'u-6', name: 'Rita Oliveira', role: 'consultor', serviceLine: 'Data & AI' },
  { id: 'u-7', name: 'Bruno Alves', role: 'consultor', serviceLine: 'LowCode' },
  { id: 'u-8', name: 'Sofia Rodrigues', role: 'consultor', serviceLine: 'LowCode' },
  { id: 'u-9', name: 'Tiago Martins', role: 'consultor', serviceLine: 'Cloud' },
  { id: 'u-10', name: 'Inês Carvalho', role: 'consultor', serviceLine: 'Cybersecurity' },
  { id: 'u-11', name: 'Raquel Ribeiro', role: 'service-line-leader', serviceLine: 'LowCode' },
  { id: 'u-12', name: 'Joana Lopes', role: 'talent-manager', serviceLine: 'People' },
];

const recipientGroups = [
  {
    id: 'grp-consultores',
    label: 'Todos os Consultores',
    memberIds: recipientsDirectory.filter((item) => item.role === 'consultor').map((item) => item.id),
  },
  {
    id: 'grp-cloud',
    label: 'Service Line Cloud',
    memberIds: recipientsDirectory.filter((item) => item.serviceLine === 'Cloud').map((item) => item.id),
  },
  {
    id: 'grp-lowcode',
    label: 'Service Line LowCode',
    memberIds: recipientsDirectory.filter((item) => item.serviceLine === 'LowCode').map((item) => item.id),
  },
  {
    id: 'grp-data-ai',
    label: 'Service Line Data & AI',
    memberIds: recipientsDirectory.filter((item) => item.serviceLine === 'Data & AI').map((item) => item.id),
  },
  {
    id: 'grp-cyber',
    label: 'Service Line Cybersecurity',
    memberIds: recipientsDirectory.filter((item) => item.serviceLine === 'Cybersecurity').map((item) => item.id),
  },
  {
    id: 'grp-sll',
    label: 'Todos os S.L.L.',
    memberIds: recipientsDirectory
      .filter((item) => item.role === 'service-line-leader')
      .map((item) => item.id),
  },
];

const MAX_FILE_MB = 10;
const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

const validateFile = (file) => {
  const fileExtension = String(file.name || '')
    .split('.')
    .pop()
    ?.toLowerCase();

  const validExtension = allowedExtensions.includes(fileExtension || '');
  const validSize = file.size <= MAX_FILE_MB * 1024 * 1024;

  if (!validExtension) {
    return { valid: false, reason: 'Formato inválido' };
  }

  if (!validSize) {
    return { valid: false, reason: 'Ficheiro acima de 10MB' };
  }

  return { valid: true };
};

function ComunicadosAvisosAG() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [selectedPersonIds, setSelectedPersonIds] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [isRecipientPickerOpen, setIsRecipientPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sendStatus, setSendStatus] = useState('');

  const fileInputRef = useRef(null);

  const filteredPeople = useMemo(() => {
    const normalizedTerm = recipientSearch.trim().toLowerCase();

    if (!normalizedTerm) {
      return recipientsDirectory;
    }

    return recipientsDirectory.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedTerm)
        || item.role.toLowerCase().includes(normalizedTerm)
        || item.serviceLine.toLowerCase().includes(normalizedTerm),
    );
  }, [recipientSearch]);

  const filteredGroups = useMemo(() => {
    const normalizedTerm = recipientSearch.trim().toLowerCase();

    if (!normalizedTerm) {
      return recipientGroups;
    }

    return recipientGroups.filter((group) => group.label.toLowerCase().includes(normalizedTerm));
  }, [recipientSearch]);

  const recipientIdsFromGroups = useMemo(() => {
    const groupRecipients = selectedGroupIds
      .map((groupId) => recipientGroups.find((group) => group.id === groupId))
      .filter(Boolean)
      .flatMap((group) => group.memberIds);

    return new Set(groupRecipients);
  }, [selectedGroupIds]);

  const allRecipientIds = useMemo(() => {
    const next = new Set(recipientIdsFromGroups);
    selectedPersonIds.forEach((personId) => next.add(personId));
    return next;
  }, [recipientIdsFromGroups, selectedPersonIds]);

  const selectedRecipients = useMemo(
    () => recipientsDirectory.filter((person) => allRecipientIds.has(person.id)),
    [allRecipientIds],
  );

  const canSend = title.trim().length > 0 && message.trim().length > 0 && selectedRecipients.length > 0;

  const handleToggleGroup = (groupId) => {
    setSelectedGroupIds((current) => {
      if (current.includes(groupId)) {
        return current.filter((id) => id !== groupId);
      }

      return [...current, groupId];
    });
    setSendStatus('');
  };

  const handleTogglePerson = (personId) => {
    setSelectedPersonIds((current) => {
      if (current.includes(personId)) {
        return current.filter((id) => id !== personId);
      }

      return [...current, personId];
    });
    setSendStatus('');
  };

  const handleRemoveGroup = (groupId) => {
    setSelectedGroupIds((current) => current.filter((id) => id !== groupId));
  };

  const handleRemovePerson = (personId) => {
    setSelectedPersonIds((current) => current.filter((id) => id !== personId));
  };

  const addFiles = (incomingFiles) => {
    const acceptedFiles = [];
    const rejected = [];

    incomingFiles.forEach((file) => {
      const validation = validateFile(file);

      if (!validation.valid) {
        rejected.push(`${file.name} (${validation.reason})`);
        return;
      }

      acceptedFiles.push(file);
    });

    setAttachments((current) => {
      const known = new Set(current.map((file) => `${file.name}:${file.size}`));
      const uniqueToAdd = acceptedFiles.filter((file) => !known.has(`${file.name}:${file.size}`));
      return [...current, ...uniqueToAdd];
    });

    setUploadErrors(rejected);
  };

  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
    event.target.value = '';
  };

  const removeAttachment = (targetFile) => {
    setAttachments((current) =>
      current.filter((file) => !(file.name === targetFile.name && file.size === targetFile.size)),
    );
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files || []);
    addFiles(files);
  };

  const handleSendMessage = () => {
    if (!canSend) {
      return;
    }

    setSendStatus(`Mensagem enviada para ${selectedRecipients.length} destinatários.`);
    setTitle('');
    setMessage('');
    setAttachments([]);
    setUploadErrors([]);
  };

  return (
    <Layout>
      <div className="ag-announcements-page">
        <header className="ag-announcements-header">
          <h1>Comunicados e Avisos</h1>
        </header>

        <section className="ag-announcements-compose-card">
          <label htmlFor="ag-announcement-title">Título</label>
          <input
            id="ag-announcement-title"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSendStatus('');
            }}
            placeholder="Digite o título do comunicado..."
          />

          <label htmlFor="ag-announcement-message">Mensagem</label>
          <textarea
            id="ag-announcement-message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setSendStatus('');
            }}
            placeholder="Escreva a mensagem aqui..."
            rows={7}
          />

          <label>Anexar ficheiros</label>
          <div
            className={`ag-upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            aria-label="Zona de upload de ficheiros"
          >
            <UploadCloud size={28} />
            <p>
              Arraste ficheiros para aqui ou <span>procure</span>
            </p>
            <small>PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)</small>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="ag-upload-hidden-input"
            />
          </div>

          {attachments.length > 0 && (
            <div className="ag-upload-files-list">
              {attachments.map((file) => (
                <div key={`${file.name}:${file.size}`} className="ag-upload-file-pill">
                  <Paperclip size={14} />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${file.name}`}
                    onClick={() => removeAttachment(file)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadErrors.length > 0 && (
            <div className="ag-upload-error-list" role="alert">
              {uploadErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          {sendStatus && <p className="ag-send-status">{sendStatus}</p>}

          <div className="ag-announcements-send-row">
            <button
              type="button"
              className="ag-send-btn"
              onClick={handleSendMessage}
              disabled={!canSend}
            >
              <SendHorizontal size={16} />
              Enviar
            </button>
          </div>
        </section>

        <section className="ag-announcements-recipient-card">
          <div className="ag-recipient-header">
            <h2>Para</h2>
            <button
              type="button"
              className="ag-add-recipient-btn"
              onClick={() => setIsRecipientPickerOpen((current) => !current)}
            >
              <UserRoundPlus size={16} />
              {isRecipientPickerOpen ? 'Fechar' : 'Adicionar'}
            </button>
          </div>

          <p className="ag-recipient-summary">{selectedRecipients.length} destinatários selecionados</p>

          {(selectedGroupIds.length > 0 || selectedPersonIds.length > 0) ? (
            <div className="ag-selected-recipient-chips">
              {selectedGroupIds.map((groupId) => {
                const group = recipientGroups.find((item) => item.id === groupId);
                if (!group) {
                  return null;
                }

                return (
                  <div key={group.id} className="ag-recipient-chip group">
                    <span>{group.label}</span>
                    <button type="button" onClick={() => handleRemoveGroup(group.id)} aria-label={`Remover grupo ${group.label}`}>
                      <X size={14} />
                    </button>
                  </div>
                );
              })}

              {selectedPersonIds.map((personId) => {
                const person = recipientsDirectory.find((item) => item.id === personId);
                if (!person) {
                  return null;
                }

                return (
                  <div key={person.id} className="ag-recipient-chip">
                    <span>{person.name}</span>
                    <button type="button" onClick={() => handleRemovePerson(person.id)} aria-label={`Remover ${person.name}`}>
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="ag-recipient-empty">Nenhum destinatário selecionado.</p>
          )}

          {isRecipientPickerOpen && (
            <div className="ag-recipient-picker-panel">
              <label className="ag-recipient-search" htmlFor="ag-recipient-search-input">
                <Search size={16} />
                <input
                  id="ag-recipient-search-input"
                  type="text"
                  value={recipientSearch}
                  onChange={(event) => setRecipientSearch(event.target.value)}
                  placeholder="Pesquisar pessoas ou grupos"
                />
              </label>

              <div className="ag-recipient-picker-sections">
                <div className="ag-recipient-picker-section">
                  <h3>Grupos</h3>
                  <div className="ag-recipient-options">
                    {filteredGroups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        className={`ag-recipient-option ${selectedGroupIds.includes(group.id) ? 'selected' : ''}`}
                        onClick={() => handleToggleGroup(group.id)}
                      >
                        <span>{group.label}</span>
                        <small>{group.memberIds.length} pessoas</small>
                      </button>
                    ))}

                    {filteredGroups.length === 0 && <p className="ag-recipient-empty">Sem grupos encontrados.</p>}
                  </div>
                </div>

                <div className="ag-recipient-picker-section">
                  <h3>Pessoas</h3>
                  <div className="ag-recipient-options people">
                    {filteredPeople.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        className={`ag-recipient-option ${selectedPersonIds.includes(person.id) ? 'selected' : ''}`}
                        onClick={() => handleTogglePerson(person.id)}
                      >
                        <span>{person.name}</span>
                        <small>{person.serviceLine} · {person.role}</small>
                      </button>
                    ))}

                    {filteredPeople.length === 0 && <p className="ag-recipient-empty">Sem pessoas encontradas.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default ComunicadosAvisosAG;
