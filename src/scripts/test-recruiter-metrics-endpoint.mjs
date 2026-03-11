import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
 
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  dotenv.config({ path: filePath, override: false });
}
 
const repoRoot = path.resolve(process.cwd());
loadEnvFile(path.join(repoRoot, '.env.local'));
loadEnvFile(path.join(repoRoot, '.env'));
 
const secret = process.env.AUTH_SECRET;
if (!secret) {
  console.error('AUTH_SECRET não configurado');
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
 
  const key = await crypto.subtle.importKey(
    'raw',
    Buffer.from(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, Buffer.from(unsigned));
  const encodedSig = base64UrlEncode(new Uint8Array(signature));
  return `${unsigned}.${encodedSig}`;
}
 
const userId = process.argv[2];
if (!userId) {
  console.error('Uso: node src/scripts/test-recruiter-metrics-endpoint.mjs <userId>');
  process.exit(1);
}
 
const exp = Date.now() + 60 * 60 * 1000;
const token = await signSession({ userId, email: 'test@example.com', role: 'recruiter', exp });
 
const res = await fetch('http://localhost:9002/api/recruiter/metrics', {
  headers: { cookie: `app_session=${token}` },
});
const text = await res.text();
console.log('status', res.status);
console.log(text);
