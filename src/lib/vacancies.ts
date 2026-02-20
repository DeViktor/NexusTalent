import type { JobPosting } from './types';

function createDate(dateString: string): Date {
    return new Date(dateString);
}

export let vacancies: JobPosting[] = [
    {
        id: 'dev-frontend-sr',
        title: 'Desenvolvedor Frontend Sênior',
        location: 'Santa Catarina, Brasil',
        type: 'Full-time',
        category: 'informatica-it',
        description: 'Estamos procurando um Desenvolvedor Frontend Sênior experiente para se juntar à nossa equipe. O candidato ideal tem forte conhecimento em React, Next.js e TypeScript.',
        recruiterId: '4FkPP1YFiBZh1Sw7ATyXpX0ZtII3',
        postedDate: createDate('2024-07-28T10:00:00Z'),
        closingDate: createDate('2024-08-28T23:59:59Z'),
        salaryRange: 'R$ 8.000 - R$ 12.000',
        showSalary: true,
        languages: ['Português', 'Inglês'],
        minExperience: '5+ anos',
        minEducationLevel: 'Licenciatura',
        responsibilities: [
            'Desenvolver e manter aplicações web de alta qualidade.',
            'Colaborar com equipes multifuncionais para definir, projetar e enviar novos recursos.',
            'Garantir o desempenho, a qualidade e a capacidade de resposta dos aplicativos.',
        ],
        requirements: [
            'Experiência comprovada com React, Next.js e TypeScript.',
            'Forte conhecimento de HTML, CSS e JavaScript moderno.',
            'Capacidade de trabalhar em um ambiente de equipe ágil.',
        ],
    },
    {
        id: 'analista-rh-pl',
        title: 'Analista de RH Pleno',
        location: 'Luanda, Angola',
        type: 'Full-time',
        category: 'rh-gestao',
        description: 'Buscamos um Analista de RH com experiência em todo o ciclo de recrutamento e seleção, endomarketing e gestão de benefícios. Forte habilidade de comunicação é essencial.',
        recruiterId: '4FkPP1YFiBZh1Sw7ATyXpX0ZtII3',
        postedDate: createDate('2024-07-27T14:30:00Z'),
        closingDate: createDate('2024-08-20T23:59:59Z'),
        salaryRange: 'A combinar',
        showSalary: false,
        languages: ['Português'],
        requiredNationality: 'Angolana',
        minExperience: '3-5 anos',
        responsibilities: [
            'Conduzir processos de recrutamento e seleção de ponta a ponta.',
            'Desenvolver ações de endomarketing e clima organizacional.',
            'Gerir o plano de benefícios da empresa.',
        ],
        requirements: [
            'Experiência em recrutamento e seleção.',
            'Conhecimento em legislação laboral angolana.',
            'Excelentes habilidades de comunicação interpessoal.',
        ],
        aiScreeningQuestions: [
            'Descreva a sua experiência com o software Primavera.',
            'Como lida com um processo de recrutamento de alto volume?',
            'Qual a sua maior conquista profissional na área de RH?'
        ]
    },
    {
        id: 'gestor-projetos-ti',
        title: 'Gestor de Projetos de TI',
        location: 'Setúbal, Portugal',
        type: 'Remote',
        category: 'informatica-it',
        description: 'Vaga para Gestor de Projetos de TI com experiência em metodologias ágeis (Scrum/Kanban) para coordenar equipes de desenvolvimento de software em projetos internacionais.',
        recruiterId: 'recruiter2', // Mock recruiter ID
        postedDate: createDate('2024-07-26T09:00:00Z'),
        closingDate: createDate('2024-09-01T23:59:59Z'),
        salaryRange: '€40.000 - €55.000 anuais',
        showSalary: true,
        languages: ['Português', 'Inglês (fluente)'],
        minExperience: '5+ anos',
        minEducationLevel: 'Licenciatura',
        responsibilities: [
            'Planear, executar e finalizar projetos de acordo com prazos e orçamentos.',
            'Gerir a equipe do projeto e as partes interessadas.',
            'Comunicar o progresso do projeto para a liderança.',
        ],
        requirements: [
            'Experiência como Gestor de Projetos de TI.',
            'Certificação PMP ou Scrum Master é um diferencial.',
            'Fluência em inglês.',
        ],
    },
    {
        id: 'engenheiro-petroleo-jr',
        title: 'Engenheiro de Petróleo Júnior',
        location: 'Luanda, Angola',
        type: 'Full-time',
        category: 'minerios-petroleo',
        description: 'Oportunidade para recém-formados em Engenharia de Petróleo para atuar em projetos de exploração e produção. Requer disponibilidade para viagens.',
        recruiterId: 'recruiter2', // Mock recruiter ID
        postedDate: createDate('2024-07-25T18:00:00Z'),
        minExperience: '0-1 ano',
        minEducationLevel: 'Licenciatura',
        responsibilities: [
            'Analisar dados de reservatórios.',
            'Auxiliar no planeamento da perfuração de poços.',
            'Monitorar operações de produção.',
        ],
        requirements: [
            'Formação superior em Engenharia de Petróleo ou similar.',
            'Conhecimentos de software de simulação de reservatórios.',
            'Disponibilidade para trabalhar em regime offshore.',
        ],
    },
    {
        id: 'especialista-mkt-digital',
        title: 'Especialista em Marketing Digital',
        location: 'Santa Catarina, Brasil',
        type: 'Part-time',
        category: 'marketing-comercial',
        description: 'Procuramos um especialista em Marketing Digital para gerenciar nossas campanhas de SEO, SEM e redes sociais. Experiência com Google Analytics e Ads é um diferencial.',
        recruiterId: 'recruiter1', // Mock recruiter ID
        postedDate: createDate('2024-07-24T12:00:00Z'),
        salaryRange: 'A combinar',
        showSalary: false,
        minExperience: '3-5 anos',
        responsibilities: [
            'Gerir campanhas de Google Ads e Facebook Ads.',
            'Otimizar o conteúdo do site para SEO.',
            'Analisar métricas e gerar relatórios de desempenho.',
        ],
        requirements: [
            'Experiência comprovada em gestão de campanhas de marketing digital.',
            'Conhecimento avançado de Google Analytics e SEO.',
            'Criatividade e capacidade analítica.',
        ],
    },
    {
        id: 'auditor-financeiro-sr',
        title: 'Auditor Financeiro Sênior',
        location: 'Setúbal, Portugal',
        type: 'Full-time',
        category: 'financas-admin',
        description: 'Vaga para Auditor Financeiro Sênior com sólida experiência em auditoria externa, IFRS e análise de riscos financeiros. Certificação ACCA ou similar desejável.',
        recruiterId: 'recruiter2', // Mock recruiter ID
        postedDate: createDate('2024-07-23T11:00:00Z'),
        minExperience: '5+ anos',
        responsibilities: [
            'Planear e executar auditorias financeiras.',
            'Avaliar o sistema de controlo interno dos clientes.',
            'Elaborar relatórios de auditoria.',
        ],
        requirements: [
            'Experiência em Big Four é um diferencial.',
            'Conhecimento profundo das normas IFRS.',
            'Capacidade de liderar equipes de auditoria.',
        ],
    },
];
