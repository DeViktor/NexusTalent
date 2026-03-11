import { getServerSupabase } from '@/lib/supabase/client';
import { decryptSecret, encryptSecret } from '@/lib/security/secret-box';
import { getAiApiKey } from '@/lib/config/ai';

type Provider = 'gemini';

function getEncryptionSecret(): string | null {
  const value = process.env.AI_KEYS_ENCRYPTION_SECRET;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export async function resolveGeminiApiKey(userId?: string | null): Promise<string | null> {
  const secret = getEncryptionSecret();
  if (!secret) return getAiApiKey();

  const admin = getServerSupabase();

  if (userId) {
    const { data: userRows } = await (admin as any)
      .from('ai_api_keys')
      .select('api_key_ciphertext')
      .eq('owner_type', 'user')
      .eq('owner_id', userId)
      .eq('provider', 'gemini')
      .limit(1);
    const row = Array.isArray(userRows) ? userRows[0] : undefined;
    const cipher = row?.api_key_ciphertext as string | undefined;
    if (cipher) {
      try {
        return decryptSecret(cipher, secret);
      } catch {
      }
    }
  }

  const { data: sysRows } = await (admin as any)
    .from('ai_api_keys')
    .select('api_key_ciphertext')
    .eq('owner_type', 'system')
    .is('owner_id', null)
    .eq('provider', 'gemini')
    .limit(1);
  const sysRow = Array.isArray(sysRows) ? sysRows[0] : undefined;
  const sysCipher = sysRow?.api_key_ciphertext as string | undefined;
  if (sysCipher) {
    try {
      return decryptSecret(sysCipher, secret);
    } catch {
    }
  }

  return getAiApiKey();
}

export async function getAiKeyStatus(userId: string): Promise<{ provider: Provider; userKeySet: boolean; systemKeySet: boolean; envKeySet: boolean }> {
  const admin = getServerSupabase();
  const envKeySet = Boolean(getAiApiKey());
  const secret = getEncryptionSecret();

  if (!secret) {
    return { provider: 'gemini', userKeySet: false, systemKeySet: false, envKeySet };
  }

  const [{ data: userRows }, { data: sysRows }] = await Promise.all([
    (admin as any)
      .from('ai_api_keys')
      .select('id')
      .eq('owner_type', 'user')
      .eq('owner_id', userId)
      .eq('provider', 'gemini')
      .limit(1),
    (admin as any)
      .from('ai_api_keys')
      .select('id')
      .eq('owner_type', 'system')
      .is('owner_id', null)
      .eq('provider', 'gemini')
      .limit(1),
  ]);

  return {
    provider: 'gemini',
    userKeySet: Array.isArray(userRows) && userRows.length > 0,
    systemKeySet: Array.isArray(sysRows) && sysRows.length > 0,
    envKeySet,
  };
}

export async function upsertSystemGeminiKey(apiKey: string): Promise<void> {
  const secret = getEncryptionSecret();
  if (!secret) throw new Error('AI_KEYS_ENCRYPTION_SECRET não configurada');
  const admin = getServerSupabase();
  const cipher = encryptSecret(apiKey.trim(), secret);
  const { data: existing } = await (admin as any)
    .from('ai_api_keys')
    .select('id')
    .eq('owner_type', 'system')
    .is('owner_id', null)
    .eq('provider', 'gemini')
    .limit(1);
  const id = (Array.isArray(existing) ? existing[0]?.id : undefined) as string | undefined;

  if (id) {
    const { error } = await (admin as any)
      .from('ai_api_keys')
      .update({ api_key_ciphertext: cipher, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const { error } = await (admin as any).from('ai_api_keys').insert({
    owner_type: 'system',
    owner_id: null,
    provider: 'gemini',
    api_key_ciphertext: cipher,
  });
  if (error) throw error;
}

export async function clearSystemGeminiKey(): Promise<void> {
  const secret = getEncryptionSecret();
  if (!secret) throw new Error('AI_KEYS_ENCRYPTION_SECRET não configurada');
  const admin = getServerSupabase();
  const { error } = await (admin as any)
    .from('ai_api_keys')
    .delete()
    .eq('owner_type', 'system')
    .is('owner_id', null)
    .eq('provider', 'gemini');
  if (error) throw error;
}

export async function upsertUserGeminiKey(userId: string, apiKey: string): Promise<void> {
  const secret = getEncryptionSecret();
  if (!secret) throw new Error('AI_KEYS_ENCRYPTION_SECRET não configurada');
  const admin = getServerSupabase();
  const cipher = encryptSecret(apiKey.trim(), secret);
  const { data: existing } = await (admin as any)
    .from('ai_api_keys')
    .select('id')
    .eq('owner_type', 'user')
    .eq('owner_id', userId)
    .eq('provider', 'gemini')
    .limit(1);
  const id = (Array.isArray(existing) ? existing[0]?.id : undefined) as string | undefined;

  if (id) {
    const { error } = await (admin as any)
      .from('ai_api_keys')
      .update({ api_key_ciphertext: cipher, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return;
  }

  const { error } = await (admin as any).from('ai_api_keys').insert({
    owner_type: 'user',
    owner_id: userId,
    provider: 'gemini',
    api_key_ciphertext: cipher,
  });
  if (error) throw error;
}

export async function clearUserGeminiKey(userId: string): Promise<void> {
  const secret = getEncryptionSecret();
  if (!secret) throw new Error('AI_KEYS_ENCRYPTION_SECRET não configurada');
  const admin = getServerSupabase();
  const { error } = await (admin as any)
    .from('ai_api_keys')
    .delete()
    .eq('owner_type', 'user')
    .eq('owner_id', userId)
    .eq('provider', 'gemini');
  if (error) throw error;
}
