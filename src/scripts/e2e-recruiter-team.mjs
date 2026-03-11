import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
 
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  dotenv.config({ path: filePath, override: false });
}
 
const repoRoot = path.resolve(process.cwd());
loadEnvFile(path.join(repoRoot, '.env.local'));
loadEnvFile(path.join(repoRoot, '.env'));
 
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const secret = process.env.AUTH_SECRET;
if (!url || !serviceKey || !secret) {
  console.error('Faltam variáveis: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET');
  process.exit(1);
}
 
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
 
function base64UrlEncode(bytes) {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
 
async function signSession(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey('raw', Buffer.from(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, Buffer.from(unsigned));
  const encodedSig = base64UrlEncode(new Uint8Array(signature));
  return `${unsigned}.${encodedSig}`;
}
 
async function fetchWithSession(userId, input, init) {
  const exp = Date.now() + 60 * 60 * 1000;
  const token = await signSession({ userId, email: 'test@example.com', role: 'recruiter', exp });
  const headers = { ...(init?.headers || {}), cookie: `app_session=${token}` };
  const res = await fetch(input, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}
 
async function main() {
  const { data: recruiters, error: rErr } = await admin.from('users').select('id,email,role').eq('role', 'recruiter').limit(1);
  if (rErr) throw rErr;
  const recruiterId = recruiters?.[0]?.id;
  if (!recruiterId) {
    console.log('Nenhum recruiter encontrado.');
    return;
  }
 
  const { data: users, error: uErr } = await admin.from('users').select('id,email').neq('id', recruiterId).limit(1);
  if (uErr) throw uErr;
  const inviteEmail = String(users?.[0]?.email || '').toLowerCase();
  if (!inviteEmail) {
    console.log('Nenhum usuário para convidar.');
    return;
  }
 
  const invite = await fetchWithSession(
    recruiterId,
    'http://localhost:9002/api/recruiter/team/invite',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, role: 'Recrutador' }) }
  );
  console.log('invite', invite.res.status, invite.json);
  if (!invite.res.ok) return;
 
  const list1 = await fetchWithSession(recruiterId, 'http://localhost:9002/api/recruiter/team', { method: 'GET' });
  console.log('list', list1.res.status, Array.isArray(list1.json?.team) ? list1.json.team.length : list1.json);
  if (!list1.res.ok) return;
 
  const inviteRow = (list1.json.team || []).find((x) => x.kind === 'invite' && String(x.email).toLowerCase() === inviteEmail);
  if (inviteRow) {
    const resend = await fetchWithSession(
      recruiterId,
      `http://localhost:9002/api/recruiter/team/invite/${inviteRow.id}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resend' }) }
    );
    console.log('resend', resend.res.status, resend.json);
  }
 
  const memberRow = (list1.json.team || []).find((x) => x.kind === 'member' && String(x.email).toLowerCase() === inviteEmail);
  if (memberRow) {
    const upd = await fetchWithSession(
      recruiterId,
      `http://localhost:9002/api/recruiter/team/member/${memberRow.id}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'Gestor de Contratação' }) }
    );
    console.log('update member', upd.res.status, upd.json);
 
    const del = await fetchWithSession(recruiterId, `http://localhost:9002/api/recruiter/team/member/${memberRow.id}`, { method: 'DELETE' });
    console.log('delete member', del.res.status, del.json);
  }
 
  const list2 = await fetchWithSession(recruiterId, 'http://localhost:9002/api/recruiter/team', { method: 'GET' });
  console.log('list after', list2.res.status, Array.isArray(list2.json?.team) ? list2.json.team.length : list2.json);
}
 
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
