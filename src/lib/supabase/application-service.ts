import { supabase } from './client';
import type { Database } from './database.types';

export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

// Obter todas as candidaturas para uma vaga
export async function getApplicationsByVacancy(jobPostingId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, users(*)')
      .eq('job_posting_id', jobPostingId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return [];
  }
}

// Obter todas as candidaturas de um candidato
export async function getApplicationsByApplicant(applicantId: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, vacancies(*)')
      .eq('applicant_id', applicantId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar candidaturas do candidato:', error);
    return [];
  }
}

// Obter uma candidatura específica
export async function getApplication(id: string) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, users(*), vacancies(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar candidatura:', error);
    return null;
  }
}

// Criar uma nova candidatura
export async function createApplication(application: ApplicationInsert) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar candidatura:', error);
    return null;
  }
}

// Atualizar uma candidatura existente
export async function updateApplication(id: string, updates: ApplicationUpdate) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar candidatura:', error);
    return null;
  }
}

// Excluir uma candidatura
export async function deleteApplication(id: string) {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir candidatura:', error);
    return false;
  }
}