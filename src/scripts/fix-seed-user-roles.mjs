import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
 
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  dotenv.config({ path: filePath, override: false });
}
 
const repoRoot = path.resolve(process.cwd());
loadEnvFile(path.join(repoRoot, '.env.local'));
loadEnvFile(path.join(repoRoot, '.env'));
 
const apply = process.argv.includes('--apply');
 
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 
if (!url || !serviceKey) {
  console.error('Faltam variáveis de ambiente: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
 
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
 
const patterns = [
  { label: 'admin seed', ilike: 'admin+seed_%@%', role: 'admin' },
  { label: 'admin fixed', ilike: 'admin@nexustalent.com', role: 'admin' },
  { label: 'recruiter seed', ilike: 'recruiter+seed_%@%', role: 'recruiter' },
  { label: 'recruiter fixed', ilike: 'recruiter@nexustalent.com.br', role: 'recruiter' },
  { label: 'instructor seed', ilike: 'formador+seed_%@%', role: 'instructor' },
  { label: 'instructor fixed', ilike: 'formador@nexustalent.com.br', role: 'instructor' },
  { label: 'student seed', ilike: 'student+seed_%@%', role: 'student' },
  { label: 'student fixed', ilike: 'student@nexustalent.com.br', role: 'student' },
];
 
async function main() {
  console.log(apply ? 'Modo: APPLY (vai atualizar public.users).' : 'Modo: DRY-RUN (não altera dados). Use --apply para aplicar.');
  let totalCandidates = 0;
  let totalUpdated = 0;
 
  for (const p of patterns) {
    const { data: rows, error: selErr } = await supabase
      .from('users')
      .select('id,email,role,user_type')
      .ilike('email', p.ilike)
      .limit(500);
    if (selErr) throw selErr;
 
    const candidates = (rows || []).filter((r) => {
      const currentRole = (r.role || '').trim();
      const currentUserType = (r.user_type || '').trim();
      return currentRole !== p.role || currentUserType !== p.role;
    });
 
    totalCandidates += candidates.length;
    console.log(`${p.label}: encontrados=${(rows || []).length} a corrigir=${candidates.length}`);
 
    if (!apply || candidates.length === 0) continue;
 
    const ids = candidates.map((c) => c.id);
    const { error: updErr, count } = await supabase
      .from('users')
      .update({ role: p.role, user_type: p.role })
      .in('id', ids)
      .select('id', { count: 'exact', head: true });
    if (updErr) throw updErr;
    totalUpdated += typeof count === 'number' ? count : ids.length;
  }
 
  console.log(`Total a corrigir: ${totalCandidates}`);
  if (apply) console.log(`Total atualizado: ${totalUpdated}`);
}
 
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
