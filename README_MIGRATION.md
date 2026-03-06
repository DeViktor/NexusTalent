# Migração de Cursos para o Supabase

Para concluir a migração dos cursos do arquivo estático para o banco de dados Supabase, siga estes passos:

## 1. Criar Tabelas no Supabase

1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard).
2. Vá para a seção **SQL Editor**.
3. Crie uma nova query.
4. Copie o conteúdo do arquivo `supabase/migrations/20240306_create_courses_tables.sql` que está na raiz do projeto.
5. Cole no editor SQL e clique em **Run**.

## 2. Popular o Banco de Dados (Seed)

Após criar as tabelas, você precisa inserir os dados dos cursos existentes.

1. Abra um terminal na raiz do projeto.
2. Certifique-se de que as variáveis de ambiente em `.env.local` estão corretas (`NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`).
3. Execute o comando:

```bash
npx tsx scripts/seed-courses.ts
```

Se tudo correr bem, você verá mensagens de sucesso indicando que categorias e cursos foram inseridos.

## 3. Verificação

Acesse a seção **Table Editor** no Supabase e verifique se as tabelas `courses` e `course_categories` foram criadas e populadas.
