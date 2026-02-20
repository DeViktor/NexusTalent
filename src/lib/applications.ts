import type { Application } from './types';

function createDate(dateString: string): Date {
    return new Date(dateString);
}

export const applications: Application[] = [
    {
        id: 'student1_dev-frontend-sr',
        userId: 'student1',
        jobPostingId: 'dev-frontend-sr',
        applicationDate: createDate('2024-07-28T10:00:00Z'),
        status: 'Triagem',
        notes: 'Candidato com bom portfólio.',
    },
    {
        id: 'student2_dev-frontend-sr',
        userId: 'student2',
        jobPostingId: 'dev-frontend-sr',
        applicationDate: createDate('2024-07-27T14:30:00Z'),
        status: 'Entrevista',
        notes: 'Experiência relevante em Next.js.',
    },
     {
        id: 'student10_dev-frontend-sr',
        userId: 'student10',
        jobPostingId: 'dev-frontend-sr',
        applicationDate: createDate('2024-07-29T10:00:00Z'),
        status: 'Triagem',
    },
      {
        id: 'student11_dev-frontend-sr',
        userId: 'student11',
        jobPostingId: 'dev-frontend-sr',
        applicationDate: createDate('2024-07-30T11:20:00Z'),
        status: 'Teste',
    },
    {
        id: 'student3_analista-rh-pl',
        userId: 'student3',
        jobPostingId: 'analista-rh-pl',
        applicationDate: createDate('2024-07-26T09:00:00Z'),
        status: 'Recebida',
    },
    {
        id: 'student7_analista-rh-pl',
        userId: 'student7',
        jobPostingId: 'analista-rh-pl',
        applicationDate: createDate('2024-07-29T18:00:00Z'),
        status: 'Recebida',
    },
    {
        id: 'student8_analista-rh-pl',
        userId: 'student8',
        jobPostingId: 'analista-rh-pl',
        applicationDate: createDate('2024-07-30T11:00:00Z'),
        status: 'Rejeitada',
    },
    {
        id: 'student4_gestor-projetos-ti',
        userId: 'student4',
        jobPostingId: 'gestor-projetos-ti',
        applicationDate: createDate('2024-07-25T18:00:00Z'),
        status: 'Rejeitada',
        notes: 'Não possui certificação PMP.',
    },
    {
        id: 'student1_engenheiro-petroleo-jr',
        userId: 'student1',
        jobPostingId: 'engenheiro-petroleo-jr',
        applicationDate: createDate('2024-07-29T11:00:00Z'),
        status: 'Triagem',
    },
    {
        id: 'student2_auditor-financeiro-sr',
        userId: 'student2',
        jobPostingId: 'auditor-financeiro-sr',
        applicationDate: createDate('2024-08-01T09:00:00Z'),
        status: 'Contratado',
    },
    {
        id: 'student5_auditor-financeiro-sr',
        userId: 'student5',
        jobPostingId: 'auditor-financeiro-sr',
        applicationDate: createDate('2024-07-31T15:00:00Z'),
        status: 'Oferta',
    },
    {
        id: 'student12_auditor-financeiro-sr',
        userId: 'student12',
        jobPostingId: 'auditor-financeiro-sr',
        applicationDate: createDate('2024-07-30T10:00:00Z'),
        status: 'Entrevista',
    },
];
