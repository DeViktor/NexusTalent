
import type { Course, CourseCategory } from './types';

export const courseCategories: CourseCategory[] = [
    { id: 'comportamental', name: 'Area Comportamental' },
    { id: 'supply-chain', name: 'Supply Chain' },
    { id: 'minerios-petroleo', name: 'Recursos Minerais e Petróleos' },
    { id: 'financas-admin', name: 'Finanças e Administração' },
    { id: 'industrial', name: 'Industrial' },
    // Mantendo categorias antigas para compatibilidade
    { id: 'dev-pessoal', name: 'Desenvolvimento Pessoal e Profissional' },
    { id: 'rh-gestao', name: 'Recursos Humanos e Gestão' },
    { id: 'informatica-it', name: 'Informática, IT & Software' },
    { id: 'seguranca-trabalho', name: 'Higiene & Segurança no Trabalho' },
    { id: 'marketing-comercial', name: 'Gestão Comercial & Marketing' },
    { id: 'ingles', name: 'Curso de Inglês' },
    { id: 'certificacao', name: 'Cursos de Certificação'}
];

// This file now acts as the initial data source if localStorage is empty.
export const courses: Course[] = [
  // Cursos da Area Comportamental
  { 
    id: 'TA-001', 
    name: 'Técnicas de Apresentação', 
    category: 'comportamental', 
    imageId: 'course-presentation',
    status: 'Ativo',
    duration: '24 horas',
    format: 'Presencial',
    generalObjective: 'Desenvolver as competências de comunicação e apresentação em público, permitindo realizar apresentações eficazes e de alto impacto.',
    whatYouWillLearn: [
      'Estruturar uma apresentação de forma lógica e cativante.',
      'Utilizar a comunicação verbal e não-verbal de forma eficaz.',
      'Gerir o nervosismo e a ansiedade ao falar em público.',
    ],
    modules: [
      { title: 'Módulo 1: Planeamento e Estrutura', topics: [{title: 'Definição de objetivos'}, {title: 'Estruturas de discurso'}] },
    ]
  },
  { 
    id: 'GC-002', 
    name: 'Gestão de Conflitos', 
    category: 'comportamental', 
    imageId: 'course-conflict',
    status: 'Ativo',
    duration: '20 horas',
    format: 'Online',
    generalObjective: 'Capacitar os participantes com ferramentas para identificar, gerir e resolver conflitos de forma construtiva.',
    whatYouWillLearn: [
      'Compreender a natureza e as causas dos conflitos.',
      'Aplicar técnicas de negociação e mediação.',
      'Desenvolver a comunicação assertiva.',
    ],
    modules: [
      { title: 'Módulo 1: Introdução ao Conflito', topics: [{title: 'Tipos e níveis de conflito'}, {title: 'Causas comuns'}] },
    ]
  },
  { 
    id: 'GE-003', 
    name: 'Gestão Emocional', 
    category: 'comportamental', 
    imageId: 'course-emotional',
    status: 'Ativo',
    duration: '16 horas', 
    format: 'Presencial',
    generalObjective: 'Desenvolver a inteligência emocional para melhorar o autoconhecimento, a autogestão, a empatia e os relacionamentos.', 
    whatYouWillLearn: [
      'Reconhecer e compreender as próprias emoções.', 
      'Gerir emoções e impulsos de forma saudável.', 
      'Construir relacionamentos mais fortes e positivos.', 
    ], 
    modules: [
      { title: 'Módulo 1: Pilares da Inteligência Emocional', topics: [{title: 'Autoconsciência emocional'}] }, 
    ] 
  },
  { id: 'EA-004', name: 'Excelencia no Atendimento', category: 'comportamental', imageId: 'course-service', status: 'Ativo', duration: '16h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'GR-005', name: 'Gestão de Reclamações', category: 'comportamental', imageId: 'course-complaint', status: 'Ativo', duration: '12h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'LM-006', name: 'Liderança e Motivação de Pessoas', category: 'comportamental', imageId: 'course-leadership', status: 'Ativo', duration: '30h', format: 'Presencial', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'GT-007', name: 'Gestão do Tempo', category: 'comportamental', imageId: 'course-time', status: 'Ativo', duration: '8h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'TR-008', name: 'Técnicas de recrutamento e selecção pessoal', category: 'comportamental', imageId: 'recruitment-hero', status: 'Ativo', duration: '24h', format: 'Presencial', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'SE-009', name: 'Secretariado Executivo de Alta Direção', category: 'comportamental', imageId: 'about-hero', status: 'Ativo', duration: '40h', format: 'Presencial', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'DE-010', name: 'Desenvolvimento da Eficacia', category: 'comportamental', imageId: 'course-performance', status: 'Ativo', duration: '16h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'GE-011', name: 'Gestão de Equipas & Liderança', category: 'comportamental', imageId: 'course-leadership', status: 'Ativo', duration: '24h', format: 'Presencial', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'GP-012', name: 'Gestão de Projectos', category: 'comportamental', imageId: 'course-project-management', status: 'Ativo', duration: '40h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'FN-013', name: 'Finanças para não Financeiros', category: 'comportamental', imageId: 'course-power-bi', status: 'Ativo', duration: '20h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'CC-014', name: 'Comunicação Criativa', category: 'comportamental', imageId: 'course-creative', status: 'Ativo', duration: '16h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },
  { id: 'TP-015', name: 'Técnicas de Produtividade de Alta Performance', category: 'comportamental', imageId: 'course-time', status: 'Ativo', duration: '12h', format: 'Online', generalObjective: 'Desenvolver...', whatYouWillLearn:[], modules:[] },

  // Supply Chain
  { id: 'SC-001', name: 'Operações Logisticas', category: 'supply-chain', imageId: 'location-brasil', status: 'Ativo', duration: '30h', format: 'Presencial', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-002', name: 'Logística e Gestão Orçamental', category: 'supply-chain', imageId: 'location-angola', status: 'Ativo', duration: '24h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-003', name: 'Gestão de Compras e Aprovisionamento', category: 'supply-chain', imageId: 'recruitment-hero', status: 'Ativo', duration: '35h', format: 'Presencial', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-004', name: 'Gestão de Stock', category: 'supply-chain', imageId: 'location-portugal', status: 'Ativo', duration: '16h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-005', name: 'Gestão de Operações', category: 'supply-chain', imageId: 'blog-leadership', status: 'Ativo', duration: '24h', format: 'Presencial', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-006', name: 'Gestão de Armazéns', category: 'supply-chain', imageId: 'blog-ai-recruitment', status: 'Ativo', duration: '20h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-007', name: 'Gestão da Cadeia de Suprimentos', category: 'supply-chain', imageId: 'blog-soft-skills', status: 'Ativo', duration: '40h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-008', name: 'Gestão de Fornecedores', category: 'supply-chain', imageId: 'blog-interview', status: 'Ativo', duration: '16h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-009', name: 'Gestão Estratégica de Fornecedores e Outsourcing', category: 'supply-chain', imageId: 'home-hero', status: 'Ativo', duration: '24h', format: 'Presencial', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-010', name: 'Microsoft Excel Aplicado às Compras', category: 'supply-chain', imageId: 'course-power-bi', status: 'Ativo', duration: '20h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-011', name: 'Produção e Gestão de Transportes', category: 'supply-chain', imageId: 'location-angola', status: 'Ativo', duration: '30h', format: 'Presencial', generalObjective: '...', whatYouWillLearn:[], modules:[] },
  { id: 'SC-012', name: 'Gestão Documental e Arquivo', category: 'supply-chain', imageId: 'course-complaint', status: 'Ativo', duration: '16h', format: 'Online', generalObjective: '...', whatYouWillLearn:[], modules:[] },

  // Recursos Minerais e Petroleos
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `RMP-${String(i + 1).padStart(3, '0')}`,
    name: [
      'Gestão de recursos minerais', 'Recursos Minerais e Ambiente', 'Gestão de reservatorios de Petroleo e Gas',
      'Sistema de Gestão Ambiental - ISO14001', 'Geologia para não Geologos', 'Geofisica Nivel I', 'Geofisica Nivel II',
      'Geofisica Nivel III', 'Drilling and Well Completion', 'Gestão, Planeamento e Controlo da Produção',
      'Processamento e analise de dados Sismicos', 'Gestão do Risco em Projectos de Produção e Exploração de recursos minerais',
      'Avaliação de Formações', 'Caracterização de Reservatórios', 'Fiscalidade Petrolífera Angolana', 'Geofísica de Reservatórios',
      'Geologia de campo (Técnicas de amostragem)', 'Geoquímica', 'Integrated Reservoir Management and Monitoring',
      'Interpretação Sísmica', 'Bacias Angolanas', 'Negociação e Contratos na Industria Petrolifera', 'Geologia do Poço',
      'Registo & Análise de Testemunho de Sondagem', 'Reservatórios Areníticos', 'Reservatórios Carbonáticos',
      'Alinhamento de Bombas', 'Corrosão Aplicada a Industria Petrolifera', 'Inspecção e Calibração de equipamentos',
      'Manutenção e Reparação de Valvulas'
    ][i],
    category: 'minerios-petroleo',
    imageId: 'location-angola',
    status: 'Ativo' as 'Ativo',
    duration: `${Math.floor(Math.random() * 20) + 16}h`,
    format: (['Online', 'Presencial'] as const)[i % 2],
    generalObjective: 'Aprofundar conhecimentos técnicos na indústria de óleo e gás.',
    whatYouWillLearn: [],
    modules: [],
  })),

  // Finanças e Administração
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `FA-${String(i + 1).padStart(3, '0')}`,
    name: [
      'Planeamento Estratégico e Comercial', 'Analise Financeira', 'Contabilidade Geral', 'Auditoria Financeria', 'Fiscalidade',
      'Análise e Gestão Financeira de Empresas', 'Elaboração e Análise de projectos de Investimentos', 'Tecnicas de Vendas',
      'Analise de investimentos', 'Técnicas de Elaboração de Documentos e Pareceres Técnicos', 'Gestão Financeira',
      'Mercado de Capitais', 'Gestão de Riscos Financeiros', 'Gestão de Recursos Humanos', 'Contabilidade para não Contabilistas',
      'Gestão da Qualidade', 'Gestão de Frotas', 'Introdução à Gestão de Projectos para não PMs', 'Gestão do Risco em Projectos',
      'ISO 21500 - Norma sobre GestãoProjectos', 'Gestão Estratégica de Projectos', 'Planeamento e Gestão Orçamental',
      'Modelos de Previsão Financeiras', 'Estudo de Viabilidade Económico - Financeira', 'Gestão da Dívida', 'Excel para Finanças'
    ][i] || `Curso Financeiro ${i+1}`,
    category: 'financas-admin',
    imageId: 'course-power-bi',
    status: 'Ativo' as 'Ativo',
    duration: `${Math.floor(Math.random() * 20) + 16}h`,
    format: (['Online', 'Presencial'] as const)[i % 2],
    generalObjective: 'Dominar as ferramentas e conceitos essenciais para uma gestão financeira e administrativa de excelência.',
    whatYouWillLearn: [],
    modules: [],
  })),
  
  // Industrial
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `IND-${String(i + 1).padStart(3, '0')}`,
    name: [
      'Montagem e Inspecçao De Andaimes', 'Operador De EmPilhadora Pettibone', 'Instrumentação Indsutrial', 'Soldadura Industrial',
      'Pintura Industrial', 'Instrumentação e Controle de Processsos', 'Automação Industrial', 'Operador de Produção',
      'Operador de Sala de Controlo', 'PLC - Controladores Logicos Programaveis', 'Manutenção Indusrial', 'Gestão da Qualidade',
      'Segurança Eletrica Industrial', 'Segurança de Processos Industriais', 'Manutenção e Reparação de Valvulas',
      'Gestão e Controle da Manutenção Industrial', 'Gestão por Processos e Indicadores Desempenho',
      'Gestão de Resíduos Industriais - Introdução', 'Gestão de Projectos Industriais', 'Gestão da Manutenção de Máquinas e Equipamentos',
      'Segurança Industrial e Prevenção de Riscos', 'Segurança de Máquinas – ISO 13857'
    ][i] || `Curso Industrial ${i+1}`,
    category: 'industrial',
    imageId: 'blog-ai-recruitment',
    status: 'Ativo' as 'Ativo',
    duration: `${Math.floor(Math.random() * 30) + 20}h`,
    format: (['Online', 'Presencial'] as const)[i % 2],
    generalObjective: 'Adquirir competências técnicas para operar e manter equipamentos e processos industriais com segurança e eficiência.',
    whatYouWillLearn: [],
    modules: [],
  })),

  { 
    id: 'EN-427', 
    name: 'Excel Avançado', 
    category: 'informatica-it', 
    imageId: 'course-power-bi', 
    status: 'Pendente',
    duration: '35 horas', 
    format: 'Online',
    generalObjective: 'Aprender Excel.', 
    whatYouWillLearn: [], 
    modules: [] 
  },
  { 
    id: 'NE-74', 
    name: 'Power BI Microsoft', 
    category: 'informatica-it', 
    imageId: 'course-power-bi', 
    status: 'Ativo',
    duration: '35 horas', 
    format: 'Online',
    generalObjective: 'Capacitar os participantes a transformar dados brutos em dashboards e relatórios interactivos e visualmente apelativos, utilizando o Microsoft Power BI.', 
    whatYouWillLearn: [
      'Conectar e transformar dados de diversas fontes (Excel, SQL, etc.).', 
      'Modelar dados para criar relações e hierarquias.', 
      'Criar visualizações de dados (gráficos, tabelas, mapas).', 
      'Utilizar a linguagem DAX para criar medidas e colunas calculadas.', 
      'Publicar e partilhar relatórios no serviço Power BI.'
    ], 
    modules: [
      { title: 'Módulo 1: Introdução ao Power BI', duration: '5 h.', topics: [{title: 'O que é o Power BI'}, {title: 'Instalação e interface'}] }, 
      { title: 'Módulo 2: Obter e Transformar Dados', duration: '10 h.', topics: [{title: 'Conectar a diferentes fontes'}, {title: 'Limpeza e transformação de dados'}] }, 
      { title: 'Módulo 3: Modelação de Dados e DAX', duration: '10 h.', topics: [{title: 'Criação de relacionamentos'}, {title: 'Introdução às funções DAX'}] }, 
      { title: 'Módulo 4: Visualização e Publicação', duration: '10 h.', topics: [{title: 'Criação de relatórios'}, {title: 'Publicação no Power BI Service'}] }] 
  },
];

    