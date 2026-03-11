import { supabase } from './client';
import type { Database } from './database.types';

export type Vacancy = Database['public']['Tables']['vacancies']['Row'];
export type VacancyInsert = Database['public']['Tables']['vacancies']['Insert'];
export type VacancyUpdate = Database['public']['Tables']['vacancies']['Update'];

// Obter todas as vagas
export async function getVacancies(includeExpired = false) {
  try {
    let query = supabase.from('vacancies').select('*');
    
    if (!includeExpired) {
      const today = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      query = query.or(`expires_at.is.null,expires_at.gt.${today}`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return [];
  }
}

// Obter vagas de um recrutador específico
export async function getRecruiterVacancies(recruiterId: string, includeExpired = false) {
  try {
    let query = supabase
      .from('vacancies')
      .select('*')
      .eq('recruiter_id', recruiterId);
    
    if (!includeExpired) {
      const today = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      query = query.or(`expires_at.is.null,expires_at.gt.${today}`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar vagas do recrutador:', error);
    return [];
  }
}

// Obter uma vaga específica
export async function getVacancy(id: string) {
  try {
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    return null;
  }
}

// Criar uma nova vaga
export async function createVacancy(vacancy: VacancyInsert) {
  try {
    const withId: VacancyInsert = {
      ...vacancy,
      id: vacancy.id && String(vacancy.id).trim().length > 0
        ? vacancy.id
        : `vac-${crypto.randomUUID()}`,
    };
    const insertPayload: any = { ...withId };
    if (insertPayload.type === undefined) {
      insertPayload.type = insertPayload.job_type;
    }
    const { data, error } = await supabase
      .from('vacancies')
      .insert(insertPayload)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return null;
  }
}

// Atualizar uma vaga existente
export async function updateVacancy(id: string, updates: VacancyUpdate) {
  try {
    const { data, error } = await supabase
      .from('vacancies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return null;
  }
}

// Excluir uma vaga
export async function deleteVacancy(id: string) {
  try {
    const { error } = await supabase
      .from('vacancies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir vaga:', error);
    return false;
  }
}
