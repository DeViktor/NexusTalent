import { supabase } from '../lib/supabase/client';
import { users } from '../lib/users';
import { jobs } from '../lib/jobs';
import { applications } from '../lib/applications';

/**
 * Script para popular o banco de dados Supabase com dados iniciais
 * Execute este script com: npx ts-node src/scripts/populate-supabase.ts
 */
async function populateSupabase() {
  console.log('Iniciando população do banco de dados Supabase...');

  try {
    // Inserir usuários
    console.log('Inserindo usuários...');
    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile_image: user.profileImage,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      console.log(`Usuário inserido: ${user.name}`);
    }

    // Inserir vagas
    console.log('Inserindo vagas...');
    for (const job of jobs) {
      const { data, error } = await supabase
        .from('vacancies')
        .upsert({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          requirements: job.requirements,
          salary_range: job.salaryRange,
          job_type: job.jobType,
          recruiter_id: job.recruiterId,
          created_at: job.createdAt,
          expires_at: job.expiresAt,
          status: job.status
        })
        .select();

      if (error) throw error;
      console.log(`Vaga inserida: ${job.title}`);
    }

    // Inserir candidaturas
    console.log('Inserindo candidaturas...');
    for (const app of applications) {
      const { data, error } = await supabase
        .from('applications')
        .upsert({
          id: app.id,
          job_posting_id: app.jobPostingId,
          applicant_id: app.applicantId,
          status: app.status,
          created_at: app.createdAt,
          updated_at: app.updatedAt,
          resume_url: app.resumeUrl,
          cover_letter: app.coverLetter
        })
        .select();

      if (error) throw error;
      console.log(`Candidatura inserida para vaga: ${app.jobPostingId}`);
    }

    console.log('Banco de dados populado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
  }
}

// Executar a função
populateSupabase();