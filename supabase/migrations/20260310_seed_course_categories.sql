insert into public.course_categories (id, name)
values
  ('comportamental', 'Area Comportamental'),
  ('supply-chain', 'Supply Chain'),
  ('minerios-petroleo', 'Recursos Minerais e Petróleos'),
  ('financas-admin', 'Finanças e Administração'),
  ('industrial', 'Industrial'),
  ('dev-pessoal', 'Desenvolvimento Pessoal e Profissional'),
  ('rh-gestao', 'Recursos Humanos e Gestão'),
  ('informatica-it', 'Informática, IT & Software'),
  ('seguranca-trabalho', 'Higiene & Segurança no Trabalho'),
  ('marketing-comercial', 'Gestão Comercial & Marketing'),
  ('ingles', 'Curso de Inglês'),
  ('certificacao', 'Cursos de Certificação')
on conflict (id) do update set
  name = excluded.name;

notify pgrst, 'reload schema';
