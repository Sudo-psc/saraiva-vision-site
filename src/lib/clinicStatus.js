export const CLINIC_IS_OPEN = false;

export const AUTHOR_SITE_URL = 'https://drphilipesaraiva.com.br';

export const CLINIC_CREDENTIALS = {
  physician: 'Dr. Philipe Saraiva Cruz',
  crm: 'CRM-MG 69.870',
  rqe: 'RQE 71.903',
};

export const CLINIC_CLOSED_COPY = {
  badge: 'Clínica encerrada',
  title: 'Clínica encerrada / em reforma',
  subtitle: 'Sem agenda no momento',
  description:
    'A Clínica Saraiva Vision não está recebendo agendamentos. Não há consultas presenciais, online ou por WhatsApp neste momento.',
  authorLinkLabel: 'Livros e textos do Dr. Philipe Saraiva',
  authorLinkNote: 'Site do autor — conteúdo literário, não é agenda médica.',
};

export const isSchedulingEnabled = () => CLINIC_IS_OPEN === true;

export const getPhysicianCredentials = () =>
  `${CLINIC_CREDENTIALS.physician} • ${CLINIC_CREDENTIALS.crm} • ${CLINIC_CREDENTIALS.rqe}`;
