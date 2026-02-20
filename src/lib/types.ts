export interface ModuleQuestion {
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: { value: string }[];
  correctAnswerIndex?: number;
  shortAnswer?: string;
}

export interface ModuleAssessment {
  questions: ModuleQuestion[];
}

export interface CourseTopic {
    title: string;
    videoUrl?: string;
    pdfUrl?: string;
    powerpointUrl?: string;
}

export interface CourseModule {
  title: string;
  topics: CourseTopic[];
  videoUrl?: string; // This can be a general module video
  assessment?: ModuleAssessment;
  duration?: string;
}

export type CourseStatus = 'Ativo' | 'Pendente' | 'Rejeitado' | 'Rascunho';

export interface Course {
    id: string;
    name: string;
    category: string;
    imageId: string;
    imageDataUri?: string; // New field for the generated image
    duration: string;
    format: 'Online' | 'Presencial' | 'Híbrido';
    generalObjective: string;
    whatYouWillLearn: string[];
    modules: CourseModule[];
    status: CourseStatus;
  }
  
  export interface CourseCategory {
    id: string;
    name: string;
  }

  export interface ScreeningQuestion {
    question: string;
    requiredAnswer: 'sim' | 'nao';
  }

  export interface JobPosting {
    id: string;
    title: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Remote';
    category: string;
    description: string;
    recruiterId: string;
  postedDate: Date;
  closingDate?: Date;
    responsibilities: string[];
    requirements: string[];
    aiScreeningQuestions?: string[];
    screeningQuestions?: ScreeningQuestion[];
    industry?: string;
    minExperience?: string;
    numberOfVacancies?: number;
    requiredNationality?: string;
    languages?: string[];
    salaryRange?: string;
    showSalary?: boolean;
    employerName?: string;
    aboutEmployer?: string;
    hideEmployerData?: boolean;
    minEducationLevel?: EducationLevel;
  }
  
  export type ApplicationStatus = 'Recebida' | 'Triagem' | 'Teste' | 'Entrevista' | 'Oferta' | 'Contratado' | 'Rejeitada';

  export interface Application {
    id: string;
    userId: string;
    jobPostingId: string;
  applicationDate: Date;
    status: ApplicationStatus;
    notes?: string;
  }

  export interface AcademicHistory {
    institution: string;
    degree: string;
    year: string;
  }

  export interface WorkExperience {
    company: string;
    role: string;
    period: string;
    description?: string;
  }

  export interface Certification {
    name: string;
    issuingOrganization: string;
    year: string;
  }

  export type EducationLevel = 'Ensino Primário' | 'Ensino Médio' | 'Frequência Universitária' | 'Licenciatura' | 'Mestrado' | 'Doutoramento';

  export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    userType: 'student' | 'instructor' | 'admin' | 'recruiter';
    profilePictureUrl?: string;
    summary?: string;
    resumeUrl?: string;
    academicTitle?: string;
    nationality?: string;
    cidade?: string;
    dateOfBirth?: string; // Format "YYYY-MM-DD"
    gender?: 'Masculino' | 'Feminino';
    languages?: string[];
    educationLevel?: EducationLevel;
    yearsOfExperience?: number;
    functionalArea?: string;
    subFunctionalArea?: string;
    skills?: string[];
    professionalLevel?: 'Estagiário / Júnior' | 'Pleno' | 'Sénior' | 'Especialista / Liderança';
    academicHistory?: AcademicHistory[];
    workExperience?: WorkExperience[];
    certifications?: Certification[];
    // Job Preferences
    preferredContractType?: 'any' | 'Full-time' | 'Part-time' | 'Remote';
    // Notification preferences
    receivesNotifications?: boolean;
    receivesJobAlerts?: boolean;
  }
  
  export interface AssessmentQuestion {
    id: string;
    question: string;
    type: 'multiple-choice' | 'short-answer' | 'psychometric';
    options?: string[];
    correctAnswerIndex?: number;
  }
  
  export interface AssessmentTest {
    id: string;
    jobId: string;
    title: string;
    questions: AssessmentQuestion[];
  }

  export interface EmailCampaignContent {
    subject: string;
    bodyHtml: string;
    buttonText: string;
    buttonLink: string;
  }
