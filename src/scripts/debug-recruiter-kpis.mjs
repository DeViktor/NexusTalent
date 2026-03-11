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
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 
if (!url || !key) {
  console.error('Faltam variáveis de ambiente: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou ANON).');
  process.exit(1);
}
 
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
 
const email = process.argv[2] || 'recruiter+seed_f50498@nexustalent.com.br';
 
async function main() {
  const { data: userRows, error: userErr } = await supabase
    .from('users')
    .select('id,email,role,user_type')
    .ilike('email', email)
    .limit(5);
  if (userErr) throw userErr;
  console.log('userRows', userRows);
  const userId = userRows?.[0]?.id;
  if (!userId) {
    console.log('Nenhum user encontrado para', email);
    return;
  }
 
  const { data: vacancies, error: vacErr } = await supabase
    .from('vacancies')
    .select('id,title,recruiter_id,status,expires_at,created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (vacErr) throw vacErr;
  console.log('vacancies total', vacancies?.length || 0);
  console.log('vacancies recruiter_ids sample', [...new Set((vacancies || []).map(v => String(v.recruiter_id)))].slice(0, 10));
  const statusCounts = {};
  for (const v of vacancies || []) {
    const k = String(v.status ?? 'null');
    statusCounts[k] = (statusCounts[k] || 0) + 1;
  }
  console.log('vacancies status counts', statusCounts);
  console.log('vacancies sample', (vacancies || []).slice(0, 10));
 
  const recruiterVacancies = (vacancies || []).filter(v => String(v.recruiter_id) === String(userId));
  console.log('vacancies for recruiter', recruiterVacancies.length);
  console.log('vacancies for recruiter sample', recruiterVacancies.slice(0, 5));
 
  const vacancyIds = recruiterVacancies.map(v => v.id);
  if (vacancyIds.length === 0) return;
 
  const { data: applications, error: appErr } = await supabase
    .from('applications')
    .select('id,job_posting_id,applicant_id,status,created_at')
    .in('job_posting_id', vacancyIds)
    .order('created_at', { ascending: false })
    .limit(50);
  if (appErr) throw appErr;
  console.log('applications for recruiter vacancies', applications?.length || 0);
  console.log('applications sample', applications?.slice(0, 10));
}
 
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
