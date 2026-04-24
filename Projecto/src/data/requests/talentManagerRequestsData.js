import {
  CheckCircle2,
  Clock3,
  SearchCheck,
  AlertTriangle,
} from 'lucide-react';

export const statusConfig = {
  submetido: {
    label: 'Submetidos',
    tone: 'blue',
    icon: Clock3,
  },
  validacao: {
    label: 'Em Validação',
    tone: 'amber',
    icon: SearchCheck,
  },
  rejeitado: {
    label: 'Rejeitados',
    tone: 'red',
    icon: AlertTriangle,
  },
  enviado: {
    label: 'Enviado',
    tone: 'green',
    icon: CheckCircle2,
  },
};

const requestRowsBase = [
  {
    id: 1,
    consultant: 'Ana Costa',
    badge: 'UX/UI Design',
    badgeImage: '/badges/Especialista.png',
    level: 'Especialista',
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '05/12/2025',
    tableStatus: 'pendente',
    status: 'validacao',
    submittedFiles: 2,
    reviewer: 'Em fila',
    reviewerDate: '12 de janeiro de 2026',
    notes: 'Evidências submetidas aguardam validação pela equipa TM.',
    decision: 'Em Validação',
    evidence: [
      { id: 'c1', title: 'C1 - Implementar conectividade híbrida', files: 2 },
      { id: 'c2', title: 'C2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'c3', title: 'C3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 2,
    consultant: 'Pedro Mendes',
    badge: 'Data Analytics',
    badgeImage: '/badges/Sénior.png',
    level: 'Especialista',
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '04/12/2025',
    tableStatus: 'rejeitado',
    status: 'rejeitado',
    submittedFiles: 1,
    reviewer: 'João Soares',
    reviewerDate: '23 de dezembro de 2025',
    notes: 'Evidências insuficientes para a conclusão da submissão.',
    decision: 'Rejeitado',
    evidence: [
      { id: 'd1', title: 'D1 - Implementar conectividade híbrida', files: 2 },
      { id: 'd2', title: 'D2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'd3', title: 'D3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 3,
    consultant: 'Maria Santos',
    badge: 'LowCode (Outsystem)',
    badgeImage: '/badges/Júnior.png',
    level: 'Júnior',
    levelLabel: 'Nível Júnior',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '03/12/2025',
    tableStatus: 'aprovado',
    status: 'enviado',
    submittedFiles: 3,
    reviewer: 'Raquel Ribeiro',
    reviewerDate: '13 de dezembro de 2025',
    notes: 'Evidências insuficientes para a conclusão da submissão.',
    decision: 'Enviado a Service Line Leader',
    evidence: [
      { id: 'a1', title: 'A1 - Implementar conectividade híbrida', files: 2 },
      { id: 'a2', title: 'A2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'a3', title: 'A3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 4,
    consultant: 'João Gomes',
    badge: 'LowCode (OutSystems)',
    badgeImage: '/badges/Especialista.png',
    level: 'Especialista',
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '01/12/2025',
    tableStatus: 'pendente',
    status: 'validacao',
    submittedFiles: 2,
    reviewer: 'Em análise',
    reviewerDate: '12 de janeiro de 2026',
    notes: 'Evidências submetidas aguardam validação pela equipa TM.',
    decision: 'Em Validação',
    evidence: [
      { id: 'c1', title: 'C1 - Implementar conectividade híbrida', files: 2 },
      { id: 'c2', title: 'C2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'c3', title: 'C3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 5,
    consultant: 'Carlos Ferreira',
    badge: 'Cybersecurity',
    badgeImage: '/badges/Júnior.png',
    level: 'Júnior',
    levelLabel: 'Nível Júnior',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '28/11/2025',
    tableStatus: 'aprovado',
    status: 'enviado',
    submittedFiles: 2,
    reviewer: 'Marta Nunes',
    reviewerDate: '13 de dezembro de 2025',
    notes: 'Evidências insuficientes para a conclusão da submissão.',
    decision: 'Enviado a Service Line Leader',
    evidence: [
      { id: 'a1', title: 'A1 - Implementar conectividade híbrida', files: 2 },
      { id: 'a2', title: 'A2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'a3', title: 'A3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 6,
    consultant: 'Bruno Alves',
    badge: 'Machine Learning',
    badgeImage: '/badges/Sénior.png',
    level: 'Especialista',
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '25/11/2025',
    tableStatus: 'aprovado',
    status: 'validacao',
    submittedFiles: 4,
    reviewer: 'Em análise',
    reviewerDate: '12 de janeiro de 2026',
    notes: 'Evidências submetidas aguardam validação pela equipa TM.',
    decision: 'Em Validação',
    evidence: [
      { id: 'c1', title: 'C1 - Implementar conectividade híbrida', files: 2 },
      { id: 'c2', title: 'C2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'c3', title: 'C3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 7,
    consultant: 'Sofia Rodrigues',
    badge: 'Mobile Development',
    badgeImage: '/badges/Especialista.png',
    level: 'Especialista',
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '22/11/2025',
    tableStatus: 'rejeitado',
    status: 'rejeitado',
    submittedFiles: 1,
    reviewer: 'João Soares',
    reviewerDate: '23 de dezembro de 2025',
    notes: 'Evidências insuficientes para a conclusão da submissão.',
    decision: 'Rejeitado',
    evidence: [
      { id: 'd1', title: 'D1 - Implementar conectividade híbrida', files: 2 },
      { id: 'd2', title: 'D2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'd3', title: 'D3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 8,
    consultant: 'Inês Carvalho',
    badge: 'IoT Solutions',
    badgeImage: '/badges/Júnior.png',
    level: 'Júnior',
    levelLabel: 'Nível Júnior',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '18/11/2025',
    tableStatus: 'pendente',
    status: 'submetido',
    submittedFiles: 2,
    reviewer: 'Em fila',
    reviewerDate: '01 de dezembro de 2025',
    notes: 'Pedido submetido com anexos e histórico de projeto.',
    decision: 'Submetido',
    evidence: [
      { id: 'a1', title: 'A1 - Implementar conectividade híbrida', files: 2 },
      { id: 'a2', title: 'A2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'a3', title: 'A3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 9,
    consultant: 'Rui Pereira',
    badge: 'DevOps',
    badgeImage: '/badges/Sénior.png',
    level: 'Sénior',
    levelLabel: 'Nível Sénior',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '15/11/2025',
    tableStatus: 'aprovado',
    status: 'enviado',
    submittedFiles: 3,
    reviewer: 'Raquel Ribeiro',
    reviewerDate: '13 de dezembro de 2025',
    notes: 'Evidências insuficientes para a conclusão da submissão.',
    decision: 'Enviado a Service Line Leader',
    evidence: [
      { id: 'a1', title: 'A1 - Implementar conectividade híbrida', files: 2 },
      { id: 'a2', title: 'A2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'a3', title: 'A3 - Implementar disaster recovery', files: 2 },
    ],
  },
  {
    id: 10,
    consultant: 'Marta Pinto',
    badge: 'Blockchain',
    badgeImage: '/badges/Especialista.png',
    level: 'Especialista',
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: '12/11/2025',
    tableStatus: 'pendente',
    status: 'submetido',
    submittedFiles: 2,
    reviewer: 'Em fila',
    reviewerDate: '01 de dezembro de 2025',
    notes: 'Pedido submetido com anexos e histórico de projeto.',
    decision: 'Submetido',
    evidence: [
      { id: 'a1', title: 'A1 - Implementar conectividade híbrida', files: 2 },
      { id: 'a2', title: 'A2 - Monitorizar infraestrutura híbrida', files: 1 },
      { id: 'a3', title: 'A3 - Implementar disaster recovery', files: 2 },
    ],
  },
];

const createRequirementAttachments = (requirementId, filesCount) => {
  const safeId = String(requirementId || 'req').toLowerCase();
  const prefix = String(requirementId || 'REQ').toUpperCase();
  const normalizedFiles = Math.max(1, Number(filesCount) || 1);

  const attachments = [
    {
      id: `${safeId}-pdf`,
      type: 'pdf',
      label: `${prefix} - Evidencia tecnica.pdf`,
    },
  ];

  if (normalizedFiles > 1) {
    attachments.push({
      id: `${safeId}-anexo`,
      type: 'file',
      label: `${prefix} - Anexo complementar.png`,
    });
  }

  return attachments;
};

const withRequirementAttachments = (evidence = []) =>
  evidence.map((item) => ({
    ...item,
    attachments: Array.isArray(item.attachments)
      ? item.attachments
      : createRequirementAttachments(item.id, item.files),
  }));

export const requestRows = requestRowsBase.map((request) => ({
  ...request,
  evidence: withRequirementAttachments(request.evidence),
}));

export const filterOptions = [
  { id: 'submetido', label: 'Submetidos' },
  { id: 'validacao', label: 'Em Validação' },
  { id: 'rejeitado', label: 'Rejeitados' },
  { id: 'enviado', label: 'Enviado' },
];

export const getRequestById = (requestId) => requestRows.find((request) => String(request.id) === String(requestId)) || null;