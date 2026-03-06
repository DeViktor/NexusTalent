
"use server";

import { aiResumeAnalysis } from "@/ai/flows/ai-resume-analysis";
import { personalizedCourseRecommendations } from "@/ai/flows/personalized-course-recommendations";
import { generateCourseContent, generateCourseImage } from "@/ai/flows/generate-course-content";
import { generateJobContent } from "@/ai/flows/generate-job-content";
import { extractProfileFromResume } from "@/ai/flows/extract-profile-from-resume";
import { generateAssessmentTest } from "@/ai/flows/generate-assessment-test";
import { generateModuleAssessment } from "@/ai/flows/generate-module-assessment";
import { generateEmailCampaign } from "@/ai/flows/generate-email-campaign";
import { chatbotAssistance } from "@/ai/flows/chatbot-assistant";


import type { 
    AIResumeAnalysisInput, AIResumeAnalysisOutput, 
    PersonalizedCourseRecommendationsInput, PersonalizedCourseRecommendationsOutput,
    GenerateCourseContentInput,
    GenerateJobContentInput, GenerateJobContentOutput,
    ExtractProfileFromResumeInput, ExtractProfileFromResumeOutput,
    GenerateAssessmentTestInput, GenerateAssessmentTestOutput,
    GenerateModuleAssessmentInput, GenerateModuleAssessmentOutput,
    GenerateEmailCampaignInput, EmailCampaignContent,
    ChatbotAssistanceInput, ChatbotAssistanceOutput
} from "@/lib/schemas";
import { GenerateCourseContentOutputSchema } from "@/lib/schemas";
import type { Course } from "@/lib/types";
import type { SiteData, ImagePlaceholder } from "@/lib/site-data";

import { revalidatePath } from "next/cache";
import { promises as fs } from 'fs';
import path from 'path';
import { supabase, getServerSupabase } from "@/lib/supabase/client";
import { getCourses, getCourseCategories } from "@/lib/course-service";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth/session";

// AI Actions
export async function analyzeResumeAction(input: AIResumeAnalysisInput): Promise<AIResumeAnalysisOutput> {
    // The try-catch block is moved to the client component
    // to handle errors on a per-file basis during bulk analysis.
    const output = await aiResumeAnalysis(input);
    return output;
}

export async function extractProfileFromResumeAction(input: ExtractProfileFromResumeInput): Promise<ExtractProfileFromResumeOutput> {
    try {
      const output = await extractProfileFromResume(input);
      return output;
    } catch (error) {
      console.error("Error in extractProfileFromResumeAction:", error);
      throw new Error("Failed to extract profile from resume. Please try again.");
    }
  }

export async function getCourseRecommendationsAction(input: { userProfile: string }): Promise<PersonalizedCourseRecommendationsOutput> {
    // Buscar cursos do Supabase; se vazio, usa lista vazia (sem mocks)
    let existingCourses: Course[] = [];
    try {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) throw error;
        existingCourses = (data ?? []).map((row: any) => ({
            id: String(row.id ?? row.code ?? crypto.randomUUID()),
            name: row.name ?? row.title ?? 'Curso',
            category: row.category ?? 'geral',
            imageId: row.image_id ?? row.imageId ?? 'course-power-bi',
            imageDataUri: row.image_data_uri ?? row.imageDataUri,
            duration: row.duration ?? '—',
            format: (row.format ?? 'Online') as Course['format'],
            generalObjective: row.general_objective ?? row.generalObjective ?? '',
            whatYouWillLearn: Array.isArray(row.what_you_will_learn)
                ? row.what_you_will_learn
                : Array.isArray(row.whatYouWillLearn)
                ? row.whatYouWillLearn
                : [],
            modules: Array.isArray(row.modules) ? row.modules : [],
            status: (row.status ?? 'Ativo') as Course['status'],
        } as Course));
    } catch {
        existingCourses = [];
    }
    const courseCatalog = existingCourses.map(course => `${course.name}: ${course.generalObjective}`).join('\n');
    
    const flowInput: PersonalizedCourseRecommendationsInput = {
        userProfile: input.userProfile,
        courseCatalog: courseCatalog,
    }

    try {
        const output = await personalizedCourseRecommendations(flowInput);
        return output;
    } catch (error) {
        console.error("Error in getCourseRecommendationsAction:", error);
        throw new Error("Failed to get course recommendations. Please try again.");
    }
}

export async function generateCourseContentAction(input: GenerateCourseContentInput): Promise<z.infer<typeof GenerateCourseContentOutputSchema.omit<{ imageDataUri: true }>>> {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    if (!hasGeminiKey) {
        const name = input.courseName?.trim() || 'Novo Curso';
        const category = input.courseCategory?.trim() || 'geral';
        const level = input.courseLevel?.trim() || 'Todos os níveis';
        const slugBase = name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const fallbackId = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;
        return {
            courseId: fallbackId,
            duration: '20h',
            generalObjective: `Introduzir ${name} na categoria ${category} (${level}).`,
            whatYouWillLearn: [
                `Fundamentos de ${name}`,
                `Aplicações práticas em ${category}`,
                `Boas práticas e casos de uso`,
            ],
            imageHint: `${name} course cover, professional, clean, minimal`,
            modules: [
                {
                    title: `Introdução a ${name}`,
                    topics: ['Visão geral', 'Conceitos básicos', 'Ferramentas e recursos'],
                },
                {
                    title: `Projeto prático`,
                    topics: ['Definir objetivo', 'Desenvolver solução', 'Apresentar resultados'],
                },
            ],
        } as any;
    }
    try {
        const output = await generateCourseContent(input);
        return output;
    } catch (error) {
        console.error("Error in generateCourseContentAction:", error);
        throw new Error("Failed to generate course content. Please try again.");
    }
}

export async function generateCourseImageAction(imageHint: string): Promise<string | null> {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    if (!hasGeminiKey) {
        return null;
    }
    try {
        const imageDataUri = await generateCourseImage(imageHint);
        return imageDataUri;
    } catch (error) {
        console.error("Error in generateCourseImageAction:", error);
        throw new Error("Failed to generate course image. Please try again.");
    }
}


export async function addCourseAction(course: Omit<Course, 'status'>): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
        const serverSupabase = getServerSupabase();
        const cookieStore = await cookies();
        const appSession = cookieStore.get('app_session')?.value;
        const session = appSession ? await verifySession(appSession) : null;
        if (!session?.userId) {
            return { success: false, message: 'Sessão inválida. Faça login novamente.' };
        }
        const slugBase = course.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const courseId = course.id && String(course.id).trim().length > 0
          ? String(course.id)
          : `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;
        const categories = await getCourseCategories();
        const byId = categories.find(c => c.id === course.category);
        const byName = categories.find(c => c.name === course.category);
        const normalizedCategory = byId?.id ?? byName?.id ?? 'comportamental';
        // Ensure category exists in DB to satisfy FK
        try {
            const { data: existingCategory } = await (serverSupabase as any)
              .from('course_categories')
              .select('id')
              .eq('id', normalizedCategory)
              .single();
            if (!existingCategory) {
              const categoryName = byId?.name ?? byName?.name ?? normalizedCategory;
              await (serverSupabase as any)
                .from('course_categories')
                .insert({ id: normalizedCategory, name: categoryName });
            }
        } catch {
            // Ignore: if category exists or insertion conflicts, proceed
        }
        const payload = {
            id: courseId,
            name: course.name,
            category: normalizedCategory,
            owner_id: session.userId,
            image_id: course.imageId,
            image_data_uri: course.imageDataUri,
            duration: course.duration,
            format: course.format,
            general_objective: course.generalObjective,
            status: 'Pendente',
        };
        const { data, error } = await (serverSupabase as any).from('courses').insert(payload).select('*').single();
        if (error) throw error;
        const newCourse: Course = {
            id: String(data.id ?? courseId),
            name: data.name ?? course.name,
            category: data.category ?? course.category,
            imageId: data.image_id ?? course.imageId,
            imageDataUri: data.image_data_uri ?? course.imageDataUri,
            duration: data.duration ?? course.duration,
            format: (data.format ?? course.format) as Course['format'],
            generalObjective: data.general_objective ?? course.generalObjective,
            whatYouWillLearn: course.whatYouWillLearn,
            modules: course.modules,
            status: (data.status ?? 'Pendente') as Course['status'],
        };
        // Revalidate paths where courses are listed to reflect the change
        revalidatePath('/courses');
        revalidatePath('/dashboard/admin/courses');
        revalidatePath('/dashboard/instructor');
        revalidatePath('/dashboard/admin/approvals');
        return { success: true, message: 'Curso submetido com sucesso!', course: newCourse };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao adicionar o curso.';
        console.error('Error in addCourseAction:', error);
        return { success: false, message };
    }
}


export async function generateJobContentAction(input: GenerateJobContentInput): Promise<GenerateJobContentOutput> {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    if (!hasGeminiKey) {
        const title = input.title?.trim() || 'Nova Vaga';
        const category = input.category?.trim() || 'geral';
        const industry = input.industry?.trim() || 'Setor';
        const minExperience = input.minExperience?.trim() || '0-1 ano';
        const demandLevel = input.demandLevel?.trim() || 'Júnior';

        const description =
            `Estamos a recrutar para a posição de ${title} na área de ${industry}. ` +
            `Esta vaga enquadra-se na categoria ${category} e é indicada para profissionais com experiência de ${minExperience}, ` +
            `num nível de senioridade ${demandLevel}. ` +
            `O profissional será responsável por apoiar o crescimento da equipa e garantir a qualidade das entregas, ` +
            `atuando em colaboração com diferentes áreas do negócio.`;

        const responsibilities = [
            `Executar as atividades inerentes ao cargo de ${title}, garantindo qualidade e cumprimento de prazos.`,
            `Colaborar com equipas multidisciplinares, contribuindo com conhecimento técnico e boas práticas.`,
            `Apoiar na identificação de melhorias contínuas em processos, ferramentas e metodologias.`,
            `Participar em reuniões de alinhamento e apresentar resultados quando necessário.`,
        ];

        const requirements = [
            `Experiência mínima de ${minExperience} em funções relacionadas com ${title} ou área similar.`,
            `Conhecimento do setor de ${industry} e das principais tendências do mercado.`,
            `Capacidade de trabalhar de forma autónoma e em equipa, com foco em resultados.`,
            `Boa capacidade de comunicação, organização e gestão de prioridades.`,
        ];

        const aiScreeningQuestions = [
            `Fale sobre uma experiência recente em que atuou como ${title} ou função similar. Que resultados alcançou?`,
            `Na sua opinião, quais são os principais desafios para atuar na área de ${industry} atualmente?`,
            `Descreva uma situação em que teve de lidar com prazos apertados ou múltiplas prioridades. Como organizou o seu trabalho?`,
            `Quais competências considera essenciais para ter sucesso numa função de nível ${demandLevel}?`,
        ];

        return {
            description,
            responsibilities,
            requirements,
            aiScreeningQuestions,
        };
    }

    try {
        const output = await generateJobContent(input);
        return output!;
    } catch (error) {
        console.error("Error in generateJobContentAction:", error);
        throw new Error("Failed to generate job content. Please try again.");
    }
}

export async function generateVacancyContentAction(input: GenerateJobContentInput): Promise<GenerateJobContentOutput> {
    return generateJobContentAction(input);
}

export async function generateAssessmentTestAction(input: GenerateAssessmentTestInput): Promise<GenerateAssessmentTestOutput> {
    try {
      const output = await generateAssessmentTest(input);
      return output;
    } catch (error) {
      console.error("Error in generateAssessmentTestAction:", error);
      throw new Error("Failed to generate assessment test. Please try again.");
    }
  }

  export async function generateModuleAssessmentAction(input: GenerateModuleAssessmentInput): Promise<GenerateModuleAssessmentOutput> {
    try {
      const output = await generateModuleAssessment(input);
      return output;
    } catch (error) {
      console.error("Error in generateModuleAssessmentAction:", error);
      throw new Error("Failed to generate module assessment. Please try again.");
    }
  }

  
  function buildFallbackEmailCampaign(input: GenerateEmailCampaignInput): EmailCampaignContent {
      const topic = input.topic?.trim() || 'Atualização da NexusTalent';
      const tone = input.tone || 'Profissional';
      const language = input.language || 'Português';
      const subject =
        language === 'Português'
          ? `${tone === 'Urgente' ? '🚨 ' : ''}${topic}`
          : `${tone === 'Urgente' ? 'URGENT: ' : ''}${topic}`;
      const buttonText =
        language === 'Português'
          ? tone === 'Urgente'
            ? 'Responder Agora'
            : 'Saber Mais'
          : tone === 'Urgente'
          ? 'Act Now'
          : 'Learn More';
      const buttonLink = 'https://nexustalent.ai/';
      const introPt =
        tone === 'Amigável'
          ? 'Esperamos que esteja bem. Gostaríamos de partilhar consigo uma novidade importante na NexusTalent.'
          : tone === 'Urgente'
          ? 'Esta é uma mensagem importante sobre uma oportunidade limitada relacionada com a sua carreira.'
          : 'Partilhamos abaixo uma atualização relevante para a sua jornada profissional.';
      const introEn =
        tone === 'Amigável'
          ? 'We hope you are doing well. We would like to share an important update from NexusTalent.'
          : tone === 'Urgente'
          ? 'This is an important message about a limited-time opportunity related to your career.'
          : 'Below you can find an update that is relevant to your professional journey.';
      const intro = language === 'Português' ? introPt : introEn;
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charSet="utf-8" />
  <title>${subject}</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 20px; text-align: center; background-color: #f8f9fa; }
    .content { padding: 24px 24px 32px 24px; color: #111827; line-height: 1.6; }
    .title { font-size: 22px; margin: 0 0 12px 0; }
    .paragraph { margin: 0 0 12px 0; }
    .button-wrapper { text-align: center; margin-top: 24px; }
    .button { display: inline-block; background-color: #1d71b8; color: #ffffff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; }
    .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; }
    .footer a { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="[LOGO_URL]" alt="NexusTalent" width="150" />
    </div>
    <div class="content">
      <h1 class="title">${subject}</h1>
      <p class="paragraph">${intro}</p>
      <p class="paragraph">${language === 'Português'
        ? 'O tema desta comunicação é:'
        : 'The main topic of this message is:'}</p>
      <p class="paragraph"><strong>${topic}</strong></p>
      <p class="paragraph">${language === 'Português'
        ? 'Utilize o botão abaixo para saber mais detalhes, confirmar o seu interesse ou falar com a nossa equipa.'
        : 'Use the button below to get more details, confirm your interest or talk to our team.'}</p>
      <div class="button-wrapper">
        <a href="${buttonLink}" class="button">${buttonText}</a>
      </div>
    </div>
    <div class="footer">
      <p>NexusTalent | Luanda, Angola</p>
      <p><a href="[UNSUBSCRIBE_LINK]">${language === 'Português' ? 'Cancelar subscrição' : 'Unsubscribe'}</a></p>
    </div>
  </div>
</body>
</html>`;
      return {
          subject,
          bodyHtml: html,
          buttonText,
          buttonLink,
      };
  }

  export async function generateEmailCampaignAction(input: GenerateEmailCampaignInput): Promise<EmailCampaignContent> {
      const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
      if (!hasGeminiKey) {
          return buildFallbackEmailCampaign(input);
      }
      try {
          const output = await generateEmailCampaign(input);
          return output;
      } catch (error) {
          console.error("Error in generateEmailCampaignAction:", error);
          return buildFallbackEmailCampaign(input);
      }
  }
  
  export async function getChatbotResponseAction(input: ChatbotAssistanceInput): Promise<ChatbotAssistanceOutput> {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const buildFallback = (q: string): ChatbotAssistanceOutput => {
        const query = (q || '').toLowerCase();
        const links: { title: string; url: string }[] = [];
        if (/(curso|form[aá]c|trein|course)/.test(query)) links.push({ title: 'Ver cursos', url: '/courses' });
        if (/(vaga|empreg|trabalh|job|recruit)/.test(query)) links.push({ title: 'Ver vagas', url: '/recruitment' });
        links.push({ title: 'Sobre a NexusTalent', url: '/about' });
        return {
            response: 'No momento estou a funcionar em modo básico. Pode explorar os cursos e vagas pelos atalhos abaixo ou dizer o que procura (ex.: "curso de Power BI", "vaga em Luanda").',
            suggestedLinks: links
        } as ChatbotAssistanceOutput;
    };

    if (!hasGeminiKey) return buildFallback(input.query);

    try {
        const output = await chatbotAssistance(input);
        return output ?? buildFallback(input.query);
    } catch (error) {
        console.error("Error in getChatbotResponseAction:", error);
        return buildFallback(input.query);
    }
}

export async function updateCourseStatusAction(courseId: string, newStatus: 'Ativo' | 'Rejeitado'): Promise<{ success: boolean; message: string }> {
    try {
        const serverSupabase = getServerSupabase();
        const { error } = await (serverSupabase as any)
            .from('courses')
            .update({ status: newStatus })
            .eq('id', courseId);
        if (error) throw error;
        revalidatePath('/dashboard/admin/approvals');
        revalidatePath('/courses');
        revalidatePath(`/courses/${courseId}`);
        return { success: true, message: 'Status atualizado com sucesso!' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao atualizar status do curso.';
        console.error('Error in updateCourseStatusAction:', error);
        return { success: false, message };
    }
}

// JSON file actions
const getSiteDataFilePath = () => path.join(process.cwd(), 'src', 'lib', 'site-data.json');

export async function getSiteData(): Promise<SiteData> {
    try {
        const filePath = getSiteDataFilePath();
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading site data file:', error);
        // Return a default structure on error
        return { stats: [], images: [] };
    }
}

export async function updateSiteData(newData: SiteData): Promise<{ success: boolean; message: string }> {
    try {
        const filePath = getSiteDataFilePath();
        await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');
        revalidatePath('/dashboard/settings');
        revalidatePath('/'); // Revalidate home page as well
        return { success: true, message: 'Dados do site atualizados com sucesso!' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao atualizar dados do site.';
        return { success: false, message };
    }
}


export async function addImageAction(image: ImagePlaceholder): Promise<{ success: boolean; message: string }> {
    try {
        const data = await getSiteData();
        if (data.images.some(p => p.id === image.id)) {
            return { success: false, message: 'Já existe um item com este ID.' };
        }
        data.images.push(image);
        await updateSiteData(data);
        return { success: true, message: 'Item adicionado com sucesso!' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Falha ao adicionar item.' };
    }
}

export async function updateImageAction(image: ImagePlaceholder): Promise<{ success: boolean; message: string }> {
    try {
        const data = await getSiteData();
        const index = data.images.findIndex(p => p.id === image.id);
        if (index === -1) {
            return { success: false, message: 'Item não encontrado.' };
        }
        data.images[index] = image;
        await updateSiteData(data);
        return { success: true, message: 'Item atualizado com sucesso!' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Falha ao atualizar item.' };
    }
}

export async function deleteImageAction(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const data = await getSiteData();
        const initialLength = data.images.length;
        data.images = data.images.filter(p => p.id !== id);
        if (data.images.length === initialLength) {
            return { success: false, message: 'Item não encontrado para exclusão.' };
        }
        await updateSiteData(data);
        return { success: true, message: 'Item excluído com sucesso!' };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Falha ao excluir item.' };
    }
}
