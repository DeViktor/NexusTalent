with target as (
  select id
  from public.site_data
  order by updated_at desc nulls last
  limit 1
),
placeholder_ids as (
  select img->>'id' as id
  from public.site_data sd,
       jsonb_array_elements(coalesce(sd.data->'images', '[]'::jsonb)) img
  where sd.id = (select id from target)
    and (img->>'imageUrl') like 'https://placehold.co/%'
),
filtered_images as (
  select jsonb_agg(img) as images
  from public.site_data sd,
       jsonb_array_elements(coalesce(sd.data->'images', '[]'::jsonb)) img
  where sd.id = (select id from target)
    and (img->>'imageUrl') not like 'https://placehold.co/%'
),
filtered_partners as (
  select jsonb_agg(p) as partners
  from public.site_data sd,
       jsonb_array_elements(coalesce(sd.data->'partners', '[]'::jsonb)) p
  where sd.id = (select id from target)
    and not exists (
      select 1 from placeholder_ids pi where pi.id = p->>'logoId'
    )
)
update public.site_data sd
set data = jsonb_set(
  jsonb_set(sd.data, '{images}', coalesce((select images from filtered_images), '[]'::jsonb), true),
  '{partners}', coalesce((select partners from filtered_partners), '[]'::jsonb), true
)
where sd.id = (select id from target);

notify pgrst, 'reload schema';
