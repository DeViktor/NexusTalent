
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { courses, courseCategories } from '../src/lib/courses';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Service Role Key are required!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Iniciando o processo de seeding...');

  // 1. Inserir Categorias
  console.log('Inserindo categorias...');
  const { error: categoryError } = await supabase
    .from('course_categories')
    .upsert(
      courseCategories.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      { onConflict: 'id' }
    );

  if (categoryError) {
    console.error('Erro ao inserir categorias:', categoryError);
    return;
  }
  console.log('Categorias inseridas com sucesso!');

  // 2. Inserir Cursos
  console.log('Inserindo cursos...');
  const formattedCourses = courses.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    image_id: c.imageId,
    image_data_uri: c.imageDataUri,
    duration: c.duration,
    format: c.format,
    price: c.price,
    currency: c.currency,
    general_objective: c.generalObjective,
    what_you_will_learn: c.whatYouWillLearn,
    modules: c.modules,
    status: c.status,
  }));

  const { error: courseError } = await supabase
    .from('courses')
    .upsert(formattedCourses, { onConflict: 'id' });

  if (courseError) {
    console.error('Erro ao inserir cursos:', courseError);
    return;
  }
  console.log('Cursos inseridos com sucesso!');
}

seed().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
