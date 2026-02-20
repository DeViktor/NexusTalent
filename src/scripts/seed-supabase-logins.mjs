import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  dotenv.config({ path: filePath, override: false });
}

const repoRoot = path.resolve(process.cwd());
loadEnvFile(path.join(repoRoot, '.env.local'));
loadEnvFile(path.join(repoRoot, '.env'));

function getArgValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

const force = process.argv.includes('--force');
const fixed = process.argv.includes('--fixed');
const listOnly = process.argv.includes('--list');
const passwordFromArgs = getArgValue('--password');
const seedPassword =
  passwordFromArgs ||
  process.env.SEED_PASSWORD ||
  `Nexus@${crypto.randomBytes(6).toString('hex')}`;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Faltam variáveis de ambiente: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const seedUsers = [
  { email: 'admin@nexustalent.com', role: 'admin', name: 'Admin Nexus' },
  { email: 'recruiter@nexustalent.com.br', role: 'recruiter', name: 'Recruiter Teste' },
  { email: 'formador@nexustalent.com.br', role: 'instructor', name: 'Formador Teste' },
  { email: 'student@nexustalent.com.br', role: 'student', name: 'Aluno Teste' },
];

function withPlusAlias(email, alias) {
  const [local, domain] = String(email).split('@');
  if (!local || !domain) return email;
  return `${local}+${alias}@${domain}`;
}

async function ensureAuthUser({ email, name, role }) {
  const emailToCreate = fixed ? email : withPlusAlias(email, `seed_${crypto.randomBytes(3).toString('hex')}`);
  const create = async (candidateEmail) => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: candidateEmail,
      password: seedPassword,
      email_confirm: true,
      user_metadata: { name, role },
    });
    return { data, error, candidateEmail };
  };

  let { data, error, candidateEmail } = await create(emailToCreate);
  const message = String(error?.message || '');

  if (error && /already registered|already exists/i.test(message) && !fixed) {
    ({ data, error, candidateEmail } = await create(withPlusAlias(email, `seed_${crypto.randomBytes(4).toString('hex')}`)));
  }

  if (error && /already registered|already exists/i.test(message) && fixed) {
    const { data: profileRow, error: profileErr } = await supabase.from('users').select('id,email').eq('email', email).limit(1);
    if (profileErr) throw profileErr;
    const existingId = Array.isArray(profileRow) ? profileRow[0]?.id : undefined;
    if (existingId && force) {
      const { data: updated, error: updErr } = await supabase.auth.admin.updateUserById(existingId, {
        password: seedPassword,
        user_metadata: { name, role },
      });
      if (updErr) throw updErr;
      return updated.user;
    }
    throw new Error(`Usuário já existe no Auth para ${email}. Rode com --fixed --force (e garanta que existe em public.users) para resetar senha.`);
  }

  if (error) throw error;

  return data.user;
}

async function upsertProfileRow(user, { email, name, role }) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  const first_name = parts[0] || 'Usuário';
  const last_name = parts.slice(1).join(' ') || '';
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email,
      first_name,
      last_name,
      user_type: role,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .limit(1);
  if (error) throw error;
}

async function main() {
  if (listOnly) {
    const { data, error } = await supabase.from('users').select('id,email,user_type,created_at').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    console.log('Últimos usuários (public.users):');
    for (const u of data || []) {
      console.log(`${u.email} (${u.user_type || '—'})`);
    }
    return;
  }

  console.log('Seeding Supabase logins...');
  console.log(`Password (para todos): ${seedPassword}`);
  if (!passwordFromArgs && !process.env.SEED_PASSWORD) {
    console.log('Dica: rode com --password "SuaSenhaAqui" para fixar.');
  }
  console.log(fixed ? 'Modo: emails fixos (--fixed).' : 'Modo: emails com alias +seed (padrão).');

  for (const u of seedUsers) {
    const authUser = await ensureAuthUser(u);
    await upsertProfileRow(authUser, { ...u, email: authUser.email });
    console.log(`OK: ${authUser.email} (${u.role})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
