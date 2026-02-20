import type { UserProfile } from './types';

export let users: UserProfile[] = [
  // Recruiter User
  {
    id: 'recruiter-test-id',
    firstName: 'Sinopec',
    lastName: 'de Angola',
    email: 'recruiter@nexustalent.com.br',
    userType: 'recruiter',
  },
  // Instructor User - ID updated to match Firebase UID for the test user
  {
    id: '4FkPP1YFiBZh1Sw7ATyXpX0ZtII3',
    firstName: 'Manuel',
    lastName: 'Teka',
    email: 'formador@nexustalent.com.br',
    userType: 'instructor',
    academicTitle: 'Formador Certificado'
  },
  // Existing users
  {
    id: 'student1',
    firstName: 'Ana',
    lastName: 'Pereira',
    email: 'ana.pereira@email.com',
    phoneNumber: '+55 11 98765-4321',
    userType: 'student',
    summary: 'Engenheira de software apaixonada por criar soluções escaláveis e de alta performance. Com 8 anos de experiência em desenvolvimento web, sou especialista em React e busco constantemente aprender novas tecnologias para enfrentar desafios complexos.',
    academicTitle: 'Engenheira de Software Sénior',
    professionalLevel: 'Sénior',
    nationality: 'Brasileira',
    cidade: 'Florianópolis',
    dateOfBirth: '1990-05-15',
    gender: 'Feminino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Mestrado',
    yearsOfExperience: 8,
    functionalArea: 'Informática e TI',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'CI/CD'],
    resumeUrl: '#',
    academicHistory: [
        { institution: 'Universidade de São Paulo', degree: 'Mestrado em Ciência da Computação', year: '2021' },
        { institution: 'Universidade de São Paulo', degree: 'Engenharia da Computação', year: '2019' }
    ],
    workExperience: [
        { company: 'Tech Solutions', role: 'Engenheira de Software Sénior', period: '2021 - Presente', description: 'Liderança técnica em projetos frontend com React e Next.js.'},
        { company: 'Inova Web', role: 'Desenvolvedora Pleno', period: '2019 - 2021', description: 'Manutenção e desenvolvimento de novas features em sistemas Angular.'}
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect', issuingOrganization: 'Amazon Web Services', year: '2023' },
      { name: 'Certified Kubernetes Administrator (CKA)', issuingOrganization: 'Cloud Native Computing Foundation', year: '2022' }
    ]
  },
  {
    id: 'student2',
    firstName: 'Bruno',
    lastName: 'Costa',
    email: 'bruno.costa@email.com',
    phoneNumber: '+351 912 345 678',
    userType: 'student',
    academicTitle: 'Gestor de Projetos PMP',
    professionalLevel: 'Especialista / Liderança',
    nationality: 'Portuguesa',
    cidade: 'Lisboa',
    dateOfBirth: '1988-11-20',
    gender: 'Masculino',
    languages: ['Português', 'Inglês', 'Espanhol'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 10,
    functionalArea: 'Gestão e executivo',
    skills: ['Scrum', 'Kanban', 'JIRA', 'PMBOK', 'Gestão de Riscos', 'Orçamentação'],
    resumeUrl: '#',
     academicHistory: [
        { institution: 'Universidade do Porto', degree: 'Licenciatura em Gestão', year: '2010' }
    ],
    workExperience: [
        { company: 'Project Movers', role: 'Gestor de Projetos de TI', period: '2014 - Presente', description: 'Liderança de equipas ágeis no desenvolvimento de software para o setor bancário.'},
    ]
  },
  {
    id: 'student3',
    firstName: 'Carla',
    lastName: 'Santos',
    email: 'carla.santos@email.com',
    phoneNumber: '+244 923 456 789',
    userType: 'student',
    academicTitle: 'Analista de Recursos Humanos',
    professionalLevel: 'Pleno',
    nationality: 'Angolana',
    cidade: 'Luanda',
    dateOfBirth: '1995-02-10',
    gender: 'Feminino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 4,
    functionalArea: 'Recursos Humanos',
    skills: ['Recrutamento e Seleção', 'Entrevistas por Competências', 'Onboarding', 'Legislação Laboral Angolana', 'Primavera'],
    resumeUrl: '#',
    academicHistory: [
        { institution: 'Universidade Agostinho Neto', degree: 'Licenciatura em Psicologia das Organizações', year: '2020' }
    ],
     workExperience: [
        { company: 'Talent Hub Angola', role: 'Analista de RH', period: '2020 - Presente', description: 'Foco em recrutamento para o setor de petróleo e gás.'},
    ]
  },
  {
    id: 'student4',
    firstName: 'Diogo',
    lastName: 'Alves',
    email: 'diogo.alves@email.com',
    userType: 'student',
    academicTitle: 'Engenheiro de Petróleo Júnior',
    professionalLevel: 'Estagiário / Júnior',
    nationality: 'Angolana',
    cidade: 'Cabinda',
    dateOfBirth: '1998-09-01',
    gender: 'Masculino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 2,
    functionalArea: 'Recursos Minerais e Petróleos',
    skills: ['Engenharia de Reservatórios', 'Análise de Perfis', 'Petrel', 'Simulação de Fluxo'],
    resumeUrl: '#',
    academicHistory: [
        { institution: 'ISPTEC', degree: 'Engenharia de Petróleo', year: '2022' }
    ],
  },
  // New mock users
  {
    id: 'student5',
    firstName: 'Elisa',
    lastName: 'Fernandes',
    email: 'elisa.f@email.com',
    userType: 'student',
    academicTitle: 'Contabilista Certificada',
    professionalLevel: 'Sénior',
    nationality: 'Portuguesa',
    cidade: 'Porto',
    dateOfBirth: '1992-07-22',
    gender: 'Feminino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 7,
    functionalArea: 'Finanças e contabilidade',
    skills: ['Contabilidade Geral', 'Fiscalidade', 'IFRS', 'Auditoria', 'SAP FI'],
    resumeUrl: '#',
    academicHistory: [
      { institution: 'ISCAL', degree: 'Licenciatura em Contabilidade e Administração', year: '2015' }
    ],
    workExperience: [
      { company: 'Audit Corp', role: 'Contabilista Sénior', period: '2017 - Presente', description: 'Responsável pelo fecho de contas mensal e preparação de declarações fiscais.' }
    ]
  },
  {
    id: 'student6',
    firstName: 'Fábio',
    lastName: 'Gonçalves',
    email: 'fabio.g@email.com',
    userType: 'student',
    academicTitle: 'Técnico de Manutenção Industrial',
    professionalLevel: 'Especialista / Liderança',
    nationality: 'Brasileira',
    cidade: 'São Paulo',
    dateOfBirth: '1985-01-30',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Ensino Médio',
    yearsOfExperience: 15,
    functionalArea: 'Industrial',
    skills: ['Manutenção Preditiva', 'Soldadura', 'Hidráulica', 'Pneumática', 'PLC'],
    resumeUrl: '#',
    academicHistory: [
      { institution: 'SENAI', degree: 'Curso Técnico em Mecatrónica', year: '2005' }
    ],
    workExperience: [
      { company: 'Indústria Pesada S.A.', role: 'Líder de Manutenção', period: '2010 - Presente', description: 'Gestão da equipa de manutenção e planeamento de paragens.' }
    ]
  },
  {
    id: 'student7',
    firstName: 'Sofia',
    lastName: 'Nunes',
    email: 'sofia.nunes@email.com',
    userType: 'student',
    academicTitle: 'Gestora de Marketing Digital',
    professionalLevel: 'Pleno',
    nationality: 'Brasileira',
    cidade: 'Rio de Janeiro',
    dateOfBirth: '1996-04-12',
    gender: 'Feminino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 5,
    functionalArea: 'Marketing, comunicação e relações públicas',
    skills: ['SEO', 'Google Ads', 'Social Media Marketing', 'Email Marketing', 'Google Analytics'],
    resumeUrl: '#',
    academicHistory: [
      { institution: 'ESPM', degree: 'Comunicação Social com ênfase em Marketing', year: '2018' }
    ],
    workExperience: [
      { company: 'Digital Boost', role: 'Especialista em SEO & SEM', period: '2019 - Presente', description: 'Otimização de campanhas de tráfego pago e orgânico para clientes B2B.' }
    ]
  },
  {
    id: 'student8',
    firstName: 'Helder',
    lastName: 'Vaz',
    email: 'helder.vaz@email.com',
    userType: 'student',
    academicTitle: 'Geólogo de Exploração',
    professionalLevel: 'Sénior',
    nationality: 'Angolana',
    cidade: 'Luanda',
    dateOfBirth: '1989-12-05',
    gender: 'Masculino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Mestrado',
    yearsOfExperience: 9,
    functionalArea: 'Recursos Minerais e Petróleos',
    skills: ['Mapeamento Geológico', 'Interpretação Sísmica', 'Avaliação de Jazigos', 'Geofísica', 'ArcGIS'],
    resumeUrl: '#',
    academicHistory: [
      { institution: 'Universidade de Lisboa', degree: 'Mestrado em Geologia do Petróleo', year: '2014' }
    ],
    workExperience: [
      { company: 'Angola Minerals', role: 'Geólogo Sénior', period: '2015 - Presente', description: 'Prospeção e avaliação de novos blocos de exploração mineral.' }
    ]
  },
  {
    id: 'student9',
    firstName: 'Inês',
    lastName: 'Lopes',
    email: 'ines.lopes@email.com',
    userType: 'student',
    academicTitle: 'Advogada',
    professionalLevel: 'Sénior',
    nationality: 'Portuguesa',
    cidade: 'Coimbra',
    dateOfBirth: '1991-06-18',
    gender: 'Feminino',
    languages: ['Português', 'Francês'],
    educationLevel: 'Mestrado',
    yearsOfExperience: 8,
    functionalArea: 'Direito',
    skills: ['Direito Comercial', 'Contratos', 'Direito do Trabalho', 'Contencioso'],
    academicHistory: [
      { institution: 'Universidade de Coimbra', degree: 'Mestrado em Direito das Empresas', year: '2015' }
    ]
  },
  {
    id: 'student10',
    firstName: 'João',
    lastName: 'Mendes',
    email: 'joao.mendes@email.com',
    userType: 'student',
    academicTitle: 'Chefe de Vendas',
    professionalLevel: 'Especialista / Liderança',
    nationality: 'Brasileira',
    cidade: 'Belo Horizonte',
    dateOfBirth: '1983-03-25',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 18,
    functionalArea: 'Vendas e atendimento ao cliente',
    skills: ['Gestão de Equipas', 'Negociação', 'CRM', 'Estratégia de Vendas', 'Key Account Management'],
    workExperience: [
      { company: 'Distribuidora Global', role: 'Gerente Regional de Vendas', period: '2008 - Presente', description: 'Liderança de uma equipa de 20 vendedores e gestão de grandes contas.' }
    ]
  },
  {
    id: 'student11',
    firstName: 'Laura',
    lastName: 'Figueiredo',
    email: 'laura.f@email.com',
    userType: 'student',
    academicTitle: 'DBA Oracle',
    professionalLevel: 'Pleno',
    nationality: 'Portuguesa',
    cidade: 'Lisboa',
    dateOfBirth: '1993-08-30',
    gender: 'Feminino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 6,
    functionalArea: 'Informática e TI',
    skills: ['Oracle Database', 'SQL', 'PL/SQL', 'Performance Tuning', 'Backup & Recovery'],
    academicHistory: [
      { institution: 'ISEC', degree: 'Engenharia Informática', year: '2017' }
    ]
  },
  {
    id: 'student12',
    firstName: 'Miguel',
    lastName: 'Barros',
    email: 'miguel.b@email.com',
    userType: 'student',
    academicTitle: 'Diretor Financeiro (CFO)',
    professionalLevel: 'Especialista / Liderança',
    nationality: 'Angolana',
    cidade: 'Luanda',
    dateOfBirth: '1978-07-11',
    gender: 'Masculino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Mestrado',
    yearsOfExperience: 22,
    functionalArea: 'Gestão e executivo',
    skills: ['Gestão Financeira', 'Estratégia', 'M&A', 'Relação com Investidores', 'Orçamentação'],
    workExperience: [
      { company: 'Grupo Empresarial Forte', role: 'CFO', period: '2015 - Presente', description: 'Liderança de toda a área financeira do grupo.' }
    ]
  },
  {
    id: 'student13',
    firstName: 'Nádia',
    lastName: 'Correia',
    email: 'nadia.c@email.com',
    userType: 'student',
    academicTitle: 'Arquiteta',
    professionalLevel: 'Estagiário / Júnior',
    nationality: 'Portuguesa',
    cidade: 'Porto',
    dateOfBirth: '1997-01-05',
    gender: 'Feminino',
    languages: ['Português'],
    educationLevel: 'Mestrado',
    yearsOfExperience: 3,
    functionalArea: 'Arquitetura e urbanismo',
    skills: ['AutoCAD', 'Revit', 'Sketchup', 'Modelação 3D', 'Desenho Técnico'],
    academicHistory: [
      { institution: 'Faculdade de Arquitetura da Universidade do Porto', degree: 'Mestrado Integrado em Arquitetura', year: '2021' }
    ]
  },
  {
    id: 'student14',
    firstName: 'Oscar',
    lastName: 'Semedo',
    email: 'oscar.s@email.com',
    userType: 'student',
    academicTitle: 'Eletricista',
    professionalLevel: 'Pleno',
    nationality: 'Angolana',
    cidade: 'Benguela',
    dateOfBirth: '1999-10-10',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Ensino Médio',
    yearsOfExperience: 4,
    functionalArea: 'Industrial',
    skills: ['Instalações Elétricas', 'Manutenção Elétrica', 'Quadros Elétricos', 'Leitura de Esquemas'],
    academicHistory: [
      { institution: 'CINFOTEC', degree: 'Eletricidade e Instalações', year: '2019' }
    ]
  },
  {
    id: 'student15',
    firstName: 'Patrícia',
    lastName: 'Gomes',
    email: 'patricia.g@email.com',
    userType: 'student',
    academicTitle: 'Professora de Inglês',
    professionalLevel: 'Pleno',
    nationality: 'Brasileira',
    cidade: 'Curitiba',
    dateOfBirth: '1994-02-14',
    gender: 'Feminino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 6,
    functionalArea: 'Ensino, formação e línguas',
    skills: ['Ensino de Línguas', 'TESOL', 'Planeamento de Aulas', 'Didática'],
    academicHistory: [
      { institution: 'Universidade Federal de Minas Gerais', degree: 'Letras - Inglês', year: '2017' }
    ]
  },
  {
    id: 'student16',
    firstName: 'Rui',
    lastName: 'Pinto',
    email: 'rui.pinto@email.com',
    userType: 'student',
    academicTitle: 'Engenheiro Civil',
    professionalLevel: 'Sénior',
    nationality: 'Portuguesa',
    cidade: 'Faro',
    dateOfBirth: '1980-08-08',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 20,
    functionalArea: 'Engenharia',
    skills: ['Gestão de Obras', 'Fiscalização', 'AutoCAD', 'CYPE', 'Orçamentação'],
    workExperience: [
      { company: 'Construtora Lusa', role: 'Diretor de Obra', period: '2005 - Presente', description: 'Gestão de projetos de construção de grande porte.' }
    ]
  },
  {
    id: 'student17',
    firstName: 'Telma',
    lastName: 'Faria',
    email: 'telma.f@email.com',
    userType: 'student',
    academicTitle: 'Compradora',
    professionalLevel: 'Pleno',
    nationality: 'Angolana',
    cidade: 'Luanda',
    dateOfBirth: '1992-11-09',
    gender: 'Feminino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 7,
    functionalArea: 'Compras, logística e comércio',
    skills: ['Negociação', 'Gestão de Fornecedores', 'Procurement', 'SAP MM'],
    academicHistory: [
      { institution: 'Universidade Católica de Angola', degree: 'Gestão de Empresas', year: '2016' }
    ]
  },
  {
    id: 'student18',
    firstName: 'Vasco',
    lastName: 'Tavares',
    email: 'vasco.t@email.com',
    userType: 'student',
    academicTitle: 'Técnico de Segurança no Trabalho',
    professionalLevel: 'Sénior',
    nationality: 'Portuguesa',
    cidade: 'Setúbal',
    dateOfBirth: '1987-05-19',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 12,
    functionalArea: 'Higiene & Segurança no Trabalho',
    skills: ['Prevenção de Riscos', 'Legislação de SST', 'Auditorias de Segurança', 'Formação em Segurança'],
  },
  {
    id: 'student19',
    firstName: 'Xavier',
    lastName: 'Dias',
    email: 'xavier.dias@email.com',
    userType: 'student',
    academicTitle: 'Administrativo de Escritório',
    professionalLevel: 'Estagiário / Júnior',
    nationality: 'Brasileira',
    cidade: 'Salvador',
    dateOfBirth: '2000-01-20',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Ensino Médio',
    yearsOfExperience: 3,
    functionalArea: 'Administração e apoio de escritório',
    skills: ['Microsoft Office', 'Atendimento ao Cliente', 'Organização de Arquivos', 'Gestão de Agendas'],
  },
  {
    id: 'student20',
    firstName: 'Zulmira',
    lastName: 'Freitas',
    email: 'zulmira.f@email.com',
    userType: 'student',
    academicTitle: 'Investigadora Científica',
    professionalLevel: 'Especialista / Liderança',
    nationality: 'Portuguesa',
    cidade: 'Lisboa',
    dateOfBirth: '1989-12-29',
    gender: 'Feminino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Doutoramento',
    yearsOfExperience: 8,
    functionalArea: 'Ciência e investigação',
    skills: ['Investigação', 'Análise de Dados', 'Redação Científica', 'Estatística', 'Python'],
    academicHistory: [
      { institution: 'Instituto Gulbenkian de Ciência', degree: 'Doutoramento em Biologia', year: '2018' }
    ]
  },
  {
    id: 'student21',
    firstName: 'Andre',
    lastName: 'Dala',
    email: 'andre.dala@email.com',
    userType: 'student',
    academicTitle: 'Estudante',
    professionalLevel: 'Estagiário / Júnior',
    nationality: 'Angolana',
    cidade: 'Luanda',
    dateOfBirth: '2002-04-15',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Frequência Universitária',
    yearsOfExperience: 0,
    functionalArea: 'Administração e apoio de escritório',
    skills: ['Microsoft Office'],
  },
  {
    id: 'student22',
    firstName: 'Beatriz',
    lastName: 'Esteves',
    email: 'beatriz.e@email.com',
    userType: 'student',
    academicTitle: 'Recepcionista',
    professionalLevel: 'Estagiário / Júnior',
    nationality: 'Brasileira',
    cidade: 'São Paulo',
    dateOfBirth: '1999-06-21',
    gender: 'Feminino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Ensino Médio',
    yearsOfExperience: 3,
    functionalArea: 'Vendas e atendimento ao cliente',
    skills: ['Atendimento ao Cliente', 'Gestão de Agendas', 'Comunicação'],
  },
  {
    id: 'student23',
    firstName: 'Celso',
    lastName: 'Matos',
    email: 'celso.matos@email.com',
    userType: 'student',
    academicTitle: 'Analista de Sistemas',
    professionalLevel: 'Pleno',
    nationality: 'Portuguesa',
    cidade: 'Lisboa',
    dateOfBirth: '1990-11-12',
    gender: 'Masculino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 9,
    functionalArea: 'Informática e TI',
    skills: ['SQL', 'Análise de Requisitos', 'UML', 'Gestão de Projetos', 'Java'],
  },
  {
    id: 'student24',
    firstName: 'Daniela',
    lastName: 'Rocha',
    email: 'daniela.r@email.com',
    userType: 'student',
    academicTitle: 'Designer Gráfico',
    professionalLevel: 'Pleno',
    nationality: 'Angolana',
    cidade: 'Luanda',
    dateOfBirth: '1995-09-03',
    gender: 'Feminino',
    languages: ['Português'],
    educationLevel: 'Licenciatura',
    yearsOfExperience: 5,
    functionalArea: 'Design e criatividade',
    skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Branding', 'Design Gráfico'],
  },
  {
    id: 'student25',
    firstName: 'Eduardo',
    lastName: 'Paixão',
    email: 'eduardo.p@email.com',
    userType: 'student',
    academicTitle: 'Engenheiro Mecânico',
    professionalLevel: 'Sénior',
    nationality: 'Brasileira',
    cidade: 'Porto Alegre',
    dateOfBirth: '1986-07-07',
    gender: 'Masculino',
    languages: ['Português', 'Inglês'],
    educationLevel: 'Mestrado',
    yearsOfExperience: 14,
    functionalArea: 'Engenharia',
    skills: ['SolidWorks', 'Análise de Elementos Finitos (FEA)', 'Termodinâmica', 'Gestão de Projetos'],
  },
];


// Function to update a user's profile
export const updateUser = (id: string, updatedData: Partial<UserProfile>): UserProfile | null => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        // If user not found, add them
        const newUser: UserProfile = {
          id: id,
          firstName: updatedData.firstName || '',
          lastName: updatedData.lastName || '',
          email: updatedData.email || '',
          userType: updatedData.userType || 'student',
          ...updatedData
        };
        users.push(newUser);
        return newUser;
    }

    const updatedUser = {
        ...users[userIndex],
        ...updatedData,
    };
    
    users[userIndex] = updatedUser;
    
    return updatedUser;
}

    