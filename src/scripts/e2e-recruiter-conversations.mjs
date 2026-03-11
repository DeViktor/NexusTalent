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
 
const recruiterId = process.argv[2];
if (!recruiterId) {
  console.error('Uso: node src/scripts/e2e-recruiter-conversations.mjs <recruiterId>');
  process.exit(1);
}
 
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
 
const { data: studentRows, error: studentErr } = await admin
  .from('users')
  .select('id,email,role')
  .eq('role', 'student')
  .neq('id', recruiterId)
  .limit(1);
if (studentErr) throw studentErr;
const candidateId = studentRows?.[0]?.id;
if (!candidateId) {
  console.log('Nenhum candidato (role=student) encontrado para testar.');
  process.exit(0);
}
 
const exp = Date.now() + 60 * 60 * 1000;
const token = await signSession({ userId: recruiterId, email: 'test@example.com', role: 'recruiter', exp });
const cookieHeader = { cookie: `app_session=${token}` };
 
const startRes = await fetch('http://localhost:9002/api/recruiter/conversations/start', {
  method: 'POST',
  headers: { ...cookieHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidateId }),
});
const startJson = await startRes.json();
console.log('start', startRes.status, startJson);
if (!startRes.ok || !startJson.ok) process.exit(1);
 
const conversationId = startJson.conversationId;
const sendRes = await fetch(`http://localhost:9002/api/recruiter/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: { ...cookieHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: `Teste ${new Date().toISOString()}` }),
});
const sendJson = await sendRes.json();
console.log('send', sendRes.status, sendJson);
if (!sendRes.ok || !sendJson.ok) process.exit(1);
 
const getRes = await fetch(`http://localhost:9002/api/recruiter/conversations/${conversationId}`, { headers: cookieHeader });
const getJson = await getRes.json();
console.log('get', getRes.status, getJson);
if (!getRes.ok || !getJson.ok) process.exit(1);
