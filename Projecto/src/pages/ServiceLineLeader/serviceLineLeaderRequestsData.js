import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  SearchCheck,
} from 'lucide-react';

export const statusConfig = {
  submetido: {
    label: 'Todos',
    tone: 'gray',
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
  aprovado: {
    label: 'Aprovados',
    tone: 'green',
    icon: CheckCircle2,
  },
};

const baseRows = [
  { consultant: 'Ana Costa', badge: 'UX/UI Design', level: 'Sénior', date: '05/12/2025', status: 'validacao' },
  { consultant: 'Pedro Mendes', badge: 'Data Analytics', level: 'Especialista', date: '04/12/2025', status: 'rejeitado' },
  { consultant: 'Maria Santos', badge: 'Cloud Architecture', level: 'Júnior', date: '03/12/2025', status: 'aprovado' },
  { consultant: 'João Gomes', badge: 'LowCode (Outsystems)', level: 'Especialista', date: '01/12/2025', status: 'validacao' },
  { consultant: 'Jó Soares', badge: 'DevOps', level: 'Intermédio', date: '30/11/2025', status: 'validacao' },
  { consultant: 'Carlos Ferreira', badge: 'Cybersecurity', level: 'Líder de Conhecimento', date: '28/11/2025', status: 'aprovado' },
  { consultant: 'Bruno Alves', badge: 'Machine Learning', level: 'Sénior', date: '25/11/2025', status: 'aprovado' },
  { consultant: 'Sofia Rodrigues', badge: 'Mobile Development', level: 'Especialista', date: '22/11/2025', status: 'rejeitado' },
  { consultant: 'Jó Soares', badge: 'Blockchain', level: 'Especialista', date: '20/11/2025', status: 'aprovado' },
  { consultant: 'Inês Carvalho', badge: 'IoT Solutions', level: 'Intermédio', date: '18/11/2025', status: 'validacao' },
  { consultant: 'Marta Pinto', badge: 'AWS Foundations', level: 'Sénior', date: '16/11/2025', status: 'validacao' },
  { consultant: 'Rui Pereira', badge: 'Data Engineering', level: 'Júnior', date: '14/11/2025', status: 'aprovado' },
  { consultant: 'Filipa Nunes', badge: 'SAP Integration', level: 'Intermédio', date: '12/11/2025', status: 'rejeitado' },
  { consultant: 'Miguel Costa', badge: 'Observability', level: 'Sénior', date: '10/11/2025', status: 'validacao' },
  { consultant: 'Rita Oliveira', badge: 'React Native', level: 'Intermédio', date: '08/11/2025', status: 'aprovado' },
  { consultant: 'André Lopes', badge: 'Azure DevOps', level: 'Especialista', date: '06/11/2025', status: 'validacao' },
  { consultant: 'Teresa Silva', badge: 'Power Platform', level: 'Sénior', date: '04/11/2025', status: 'rejeitado' },
  { consultant: 'Pedro Carvalho', badge: 'Kubernetes', level: 'Líder de Conhecimento', date: '02/11/2025', status: 'validacao' },
  { consultant: 'Daniela Cruz', badge: 'GenAI Foundations', level: 'Júnior', date: '31/10/2025', status: 'aprovado' },
  { consultant: 'Nuno Antunes', badge: 'Quality Engineering', level: 'Intermédio', date: '29/10/2025', status: 'aprovado' },
  { consultant: 'Joana Almeida', badge: 'GCP Fundamentals', level: 'Sénior', date: '27/10/2025', status: 'validacao' },
  { consultant: 'Gonçalo Dias', badge: 'Prompt Engineering', level: 'Especialista', date: '25/10/2025', status: 'rejeitado' },
  { consultant: 'Sara Monteiro', badge: 'Cloud Security', level: 'Especialista', date: '23/10/2025', status: 'aprovado' },
  { consultant: 'Vasco Rocha', badge: 'Infra as Code', level: 'Intermédio', date: '21/10/2025', status: 'validacao' },
  { consultant: 'Luís Neves', badge: 'API Design', level: 'Sénior', date: '19/10/2025', status: 'validacao' },
];

const levelConfig = {
  'Júnior': { points: 100, badgeImage: '/badges/Júnior.png' },
  'Intermédio': { points: 150, badgeImage: '/badges/Intermédio.png' },
  'Sénior': { points: 200, badgeImage: '/badges/Sénior.png' },
  Especialista: { points: 250, badgeImage: '/badges/Especialista.png' },
  'Líder de Conhecimento': { points: 300, badgeImage: '/badges/Líder de Conhecimento.png' },
};

const getStatusNote = (status) => {
  if (status === 'aprovado') {
    return 'Evidências avaliadas e aprovadas para progressão no percurso.';
  }

  return 'Evidências insuficientes para a conclusão da submissão.';
};

const getEvidencePrefix = (status) => {
  if (status === 'aprovado') {
    return 'A';
  }

  if (status === 'rejeitado') {
    return 'D';
  }

  return 'C';
};

const createEvidence = (status) => {
  const prefix = getEvidencePrefix(status);

  return [
    {
      id: `${prefix}1`,
      title: `${prefix}1 - Implementar conectividade híbrida`,
      files: 2,
      description:
        'Demonstração prática da integração entre workloads cloud e on-premises com monitorização operacional.',
    },
    {
      id: `${prefix}2`,
      title: `${prefix}2 - Monitorizar infraestrutura híbrida`,
      files: 1,
      description:
        'Implementação de métricas, alertas e evidências de resposta a incidentes em ambientes distribuídos.',
    },
    {
      id: `${prefix}3`,
      title: `${prefix}3 - Implementar disaster recovery`,
      files: 2,
      description:
        'Plano de recuperação com testes de failover, RTO e RPO documentados para o contexto da Service Line.',
    },
  ];
};

const getTableStatus = (status) => {
  if (status === 'aprovado') {
    return 'aprovado';
  }

  if (status === 'rejeitado') {
    return 'rejeitado';
  }

  return 'pendente';
};

export const requestRows = baseRows.map((item, index) => {
  const levelMeta = levelConfig[item.level] || levelConfig['Sénior'];
  const tableStatus = getTableStatus(item.status);

  return {
    id: index + 1,
    consultant: item.consultant,
    submittedBy: 'João Gomes',
    submittedByAvatar: 'https://i.pravatar.cc/100?img=12',
    submittedDate: '01 de dezembro de 2025',
    reviewer: 'Jó Soares',
    reviewerAvatar: 'https://i.pravatar.cc/100?img=23',
    reviewerDate: '23 de dezembro de 2025',
    finalReviewer: item.status === 'validacao' ? null : 'Joana Gomes',
    finalReviewerAvatar: item.status === 'validacao' ? null : 'https://i.pravatar.cc/100?img=45',
    finalReviewerDate: item.status === 'validacao' ? null : '24 de dezembro de 2025',
    badge: item.badge,
    badgeImage: levelMeta.badgeImage,
    level: item.level,
    levelLabel: `Nível ${item.level}`,
    points: levelMeta.points,
    area: 'Jornada Técnica',
    path: 'Application Operations',
    date: item.date,
    status: item.status,
    tableStatus,
    notes: getStatusNote(item.status),
    evidence: createEvidence(item.status),
  };
});

export const getRequestById = (requestId) =>
  requestRows.find((request) => String(request.id) === String(requestId)) || null;
