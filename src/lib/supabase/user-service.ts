import { supabase } from './client';
import type { Database } from './database.types';
import type { UserProfile } from '@/lib/types';

export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export function mapUserRowToUserProfile(row: UserRow): UserProfile {
  const fullName = row.name || '';
  const [firstName, ...rest] = fullName.split(' ');
  const lastName = rest.join(' ');
  const role = (row.role || 'student') as UserProfile['userType'];

  return {
    id: row.id,
    firstName: firstName || fullName || 'Usuário',
    lastName: lastName || '',
    email: row.email,
    userType: role,
    profilePictureUrl: (row as any).avatar_url || (row as any).profile_picture_url || (row as any).profile_image || (row as any).photo_url || (row as any).image_url,
    summary: row.bio,
    company: row.company,
  };
}

export async function getUserById(id: string): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data ?? null;
  } catch (e) {
    console.error('Erro ao buscar usuário:', e);
    return null;
  }
}

export async function upsertUser(user: UserInsert): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase.from('users').upsert(user).select().single();
    if (error) throw error;
    return data ?? null;
  } catch (e) {
    console.error('Erro ao inserir/atualizar usuário:', e);
    return null;
  }
}

export async function updateUserRow(id: string, updates: UserUpdate): Promise<UserRow | null> {
  try {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data ?? null;
  } catch (e) {
    console.error('Erro ao atualizar usuário:', e);
    return null;
  }
}

// Listar candidatos (utilizadores com role "student")
export async function getCandidates(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,role,avatar_url,bio')
      .eq('role', 'student');
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map((row: UserRow) => mapUserRowToUserProfile(row));
  } catch (e) {
    console.error('Erro ao listar candidatos:', e);
    return [];
  }
}
