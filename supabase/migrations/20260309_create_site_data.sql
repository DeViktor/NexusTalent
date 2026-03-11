create table if not exists site_data (
  id text primary key,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
 
alter table site_data add column if not exists data jsonb;
alter table site_data add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
update site_data set data = '{}'::jsonb where data is null;
alter table site_data alter column data set not null;

alter table site_data enable row level security;
 
drop policy if exists "Public read site data" on site_data;
create policy "Public read site data"
  on site_data for select using (true);
 
drop policy if exists "Admins manage site data" on site_data;
create policy "Admins manage site data"
  on site_data for all using (auth.uid() in (select id from users where role = 'admin'))
  with check (auth.uid() in (select id from users where role = 'admin'));
 
insert into site_data (id, data)
values (
  'default',
  $json$
{
  "stats": {
    "students": 12500,
    "companies": 350,
    "satisfaction": "98%"
  },
  "images": [
    {
      "id": "home-hero",
      "description": "Pessoa sorrindo em um escritório moderno com laptop",
      "imageUrl": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=900&fit=crop",
      "imageHint": "modern office team",
      "role": "hero"
    },
    {
      "id": "home-recruitment",
      "description": "Recrutador analisando currículos em uma mesa",
      "imageUrl": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop",
      "imageHint": "recruiter resume",
      "role": "recruitment"
    },
    {
      "id": "home-courses",
      "description": "Pessoa assistindo a um curso online em um tablet",
      "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop",
      "imageHint": "online course",
      "role": "course"
    },
    {
      "id": "partner-1",
      "description": "Logo do parceiro 1",
      "imageUrl": "https://placehold.co/200x100.png",
      "imageHint": "company logo",
      "role": "partner"
    },
    {
      "id": "partner-2",
      "description": "Logo do parceiro 2",
      "imageUrl": "https://placehold.co/200x100.png",
      "imageHint": "company logo",
      "role": "partner"
    },
    {
      "id": "partner-3",
      "description": "Logo do parceiro 3",
      "imageUrl": "https://placehold.co/200x100.png",
      "imageHint": "company logo",
      "role": "partner"
    },
    {
      "id": "partner-4",
      "description": "Logo do parceiro 4",
      "imageUrl": "https://placehold.co/200x100.png",
      "imageHint": "company logo",
      "role": "partner"
    },
    {
      "id": "course-power-bi",
      "description": "Dashboard de Power BI em uma tela",
      "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      "imageHint": "data dashboard",
      "role": "course"
    },
    {
      "id": "course-leadership",
      "description": "Grupo de pessoas em uma reunião de liderança",
      "imageUrl": "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=800&h=600&fit=crop",
      "imageHint": "leadership meeting",
      "role": "course"
    },
    {
      "id": "course-ux",
      "description": "Designer trabalhando em wireframes",
      "imageUrl": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop",
      "imageHint": "ux design",
      "role": "course"
    },
    {
      "id": "gallery-1",
      "description": "Equipe colaborando em um projeto",
      "imageUrl": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "imageHint": "team collaboration",
      "role": "gallery"
    },
    {
      "id": "gallery-2",
      "description": "Palestrante em uma conferência",
      "imageUrl": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
      "imageHint": "conference speaker",
      "role": "gallery"
    },
    {
      "id": "gallery-3",
      "description": "Pessoa estudando em um laptop",
      "imageUrl": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
      "imageHint": "studying laptop",
      "role": "gallery"
    }
  ],
  "partners": [
    {
      "id": "parceiro-a",
      "name": "TechCorp",
      "logoId": "partner-1"
    },
    {
      "id": "parceiro-b",
      "name": "Inova Solutions",
      "logoId": "partner-2"
    },
    {
      "id": "parceiro-c",
      "name": "Global HR",
      "logoId": "partner-3"
    },
    {
      "id": "parceiro-d",
      "name": "EduFuture",
      "logoId": "partner-4"
    }
  ],
  "locations": [
    {
      "id": "lisboa",
      "name": "Lisboa",
      "address": "Av. da Liberdade, 100",
      "phone": "+351 21 000 0000"
    },
    {
      "id": "porto",
      "name": "Porto",
      "address": "Rua de Santa Catarina, 200",
      "phone": "+351 22 000 0000"
    }
  ],
  "certifications": [
    {
      "id": "iso-9001",
      "name": "ISO 9001",
      "description": "Certificação de Qualidade"
    },
    {
      "id": "iso-27001",
      "name": "ISO 27001",
      "description": "Certificação de Segurança da Informação"
    }
  ],
  "blogPosts": [
    {
      "id": "o-futuro-do-trabalho",
      "title": "O Futuro do Trabalho e as Novas Competências",
      "excerpt": "Descubra as tendências que estão moldando o mercado e como se preparar.",
      "date": "2024-07-20",
      "author": "Equipe NexusTalent",
      "imageId": "gallery-1"
    },
    {
      "id": "dicas-cv",
      "title": "5 Dicas para um Currículo Imbatível",
      "excerpt": "Aprenda a destacar suas experiências e chamar a atenção dos recrutadores.",
      "date": "2024-07-28",
      "author": "Ana Silva",
      "imageId": "gallery-3"
    }
  ]
}
  $json$::jsonb
)
on conflict (id) do nothing;
